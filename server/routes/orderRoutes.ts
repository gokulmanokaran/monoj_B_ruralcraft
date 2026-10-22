import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { CustomsService } from '../services/customsService';
import { CurrencyService } from '../services/currencyService';
import { optionalAuthMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { Order, OrderItem, OrderStatus } from '../types';

export const orderRouter = Router();

// Place order
orderRouter.post('/', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      items,
      selected_currency = 'USD'
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Order must contain at least one item' });
      return;
    }

    if (!shipping_address || !shipping_address.address || !shipping_address.country) {
      res.status(400).json({ error: 'Valid international shipping address is required' });
      return;
    }

    const products = db.get('products');
    const currencyData = db.get('currency_rates');
    const rate = currencyData.rates[selected_currency] || 1.0;

    let totalInr = 0;
    const populatedItems: OrderItem[] = [];

    // Process items & verify stock
    for (const it of items) {
      const prod = products.find(p => p.id === it.product_id);
      if (!prod) {
        res.status(400).json({ error: `Product not found: ${it.product_id}` });
        return;
      }
      const qty = Math.max(1, Number(it.quantity) || 1);
      const lineInr = prod.price_inr * qty;
      totalInr += lineInr;
      const convertedPrice = Number((prod.price_inr * rate).toFixed(2));

      populatedItems.push({
        product_id: prod.id,
        product_name: prod.name,
        artisan_id: prod.artisan_id,
        artisan_name: prod.artisan_name,
        quantity: qty,
        price_inr: prod.price_inr,
        converted_price: convertedPrice,
        suggested_hs_code: prod.suggested_hs_code,
        weight_kg: prod.weight_kg,
        image: prod.images[0] || ''
      });
    }

    const convertedTotal = Number((totalInr * rate).toFixed(2));
    const orderNumber = `RCG-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const orderId = `ord-${Date.now()}`;

    const newOrder: Order = {
      id: orderId,
      order_number: orderNumber,
      user_id: req.user ? req.user.id : (customer_email || 'guest'),
      customer_name: customer_name || shipping_address.full_name || 'Valued Customer',
      customer_email: customer_email || shipping_address.email || 'customer@example.com',
      customer_phone: customer_phone || shipping_address.phone || '',
      items: populatedItems,
      total_inr: totalInr,
      selected_currency,
      exchange_rate: rate,
      converted_total: convertedTotal,
      shipping_address: {
        full_name: customer_name || shipping_address.full_name,
        email: customer_email || shipping_address.email,
        phone: customer_phone || shipping_address.phone,
        address: shipping_address.address,
        city: shipping_address.city,
        state: shipping_address.state,
        country: shipping_address.country,
        postal_code: shipping_address.postal_code
      },
      status: 'Confirmed',
      tracking_number: `RCG-EXP-${Math.floor(100000000 + Math.random() * 900000000)}`,
      created_at: new Date().toISOString()
    };

    // Save order and decrement stock
    db.mutate(draft => {
      draft.orders.unshift(newOrder);

      // Decrement stock
      for (const item of populatedItems) {
        const p = draft.products.find(prod => prod.id === item.product_id);
        if (p) {
          p.stock = Math.max(0, p.stock - item.quantity);
          if (p.stock === 0) {
            p.status = 'out_of_stock';
          }
        }
      }
    });

    // Automatically generate customs information dossier!
    const customsDoc = CustomsService.createDocumentForOrder(newOrder);

    res.status(201).json({
      order: newOrder,
      customs_document: customsDoc
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// Get orders list (with role scoping)
orderRouter.get('/', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    let orders = db.get('orders');
    const user = req.user;

    if (user) {
      if (user.role === 'customer') {
        orders = orders.filter(o => o.user_id === user.id || o.customer_email.toLowerCase() === user.email.toLowerCase());
      } else if (user.role === 'artisan') {
        const artisans = db.get('artisans');
        const artisan = artisans.find(a => a.user_id === user.id);
        if (artisan) {
          orders = orders.filter(o => o.items.some(it => it.artisan_id === artisan.id));
        }
      }
      // admin gets all orders
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
});

// Get single order with linked customs document
orderRouter.get('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const orders = db.get('orders');
    const order = orders.find(o => o.id === id || o.order_number === id);

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const customsDocs = db.get('customs_documents');
    const customsDoc = customsDocs.find(c => c.order_id === order.id || c.id === order.customs_document_id);

    res.json({
      order,
      customs_document: customsDoc || null
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve order' });
  }
});

// Update order status (Admin / Artisan)
orderRouter.patch('/:id/status', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { status, tracking_number } = req.body as { status: OrderStatus; tracking_number?: string };

    let updated: Order | null = null;
    db.mutate(draft => {
      const ord = draft.orders.find(o => o.id === id || o.order_number === id);
      if (ord) {
        if (status) ord.status = status;
        if (tracking_number) ord.tracking_number = tracking_number;
        updated = { ...ord };
      }
    });

    if (!updated) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});
