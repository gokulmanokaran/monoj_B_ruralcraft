import { db } from '../db/database';
import { Order, CustomsDocument } from '../types';

export class CustomsService {
  /**
   * Automatically generate customs dossier from order
   */
  public static createDocumentForOrder(order: Order): CustomsDocument {
    const artisans = db.get('artisans');
    // Find first artisan or collective exporter
    const firstItem = order.items[0];
    const primaryArtisan = artisans.find(a => a.id === firstItem?.artisan_id) || artisans[0];

    const invoiceNumber = `RCG-INV-${order.order_number.replace('RCG-', '')}`;
    const invoiceDate = new Date().toISOString().split('T')[0];

    let totalWeight = 0;
    const items = order.items.map(item => {
      const lineWeight = (item.weight_kg || 0.5) * item.quantity;
      totalWeight += lineWeight;
      return {
        product_name: item.product_name,
        hs_code: item.suggested_hs_code || '4602.11',
        quantity: item.quantity,
        unit_price_inr: item.price_inr,
        total_price_inr: item.price_inr * item.quantity,
        unit_price_converted: item.converted_price,
        total_price_converted: Number((item.converted_price * item.quantity).toFixed(2)),
        weight_kg: Number(lineWeight.toFixed(2))
      };
    });

    const customsDoc: CustomsDocument = {
      id: `cust-${Date.now()}`,
      order_id: order.id,
      order_number: order.order_number,
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate,
      exporter: {
        name: `${primaryArtisan.brand_name} / RuralCraft Export Collective`,
        organization: 'Rural Artisan Export Consortium of India',
        address: `${primaryArtisan.village || 'Majuli'}, ${primaryArtisan.state || 'Assam'}, India`,
        iec_code: primaryArtisan.iec_code || '0518099341',
        gstin: '18AAACL9012M1Z2',
        country: 'India',
        contact: 'customs-export@ruralcraft.global'
      },
      buyer: {
        name: order.shipping_address.full_name,
        address: order.shipping_address.address,
        city: order.shipping_address.city,
        state: order.shipping_address.state,
        country: order.shipping_address.country,
        postal_code: order.shipping_address.postal_code,
        email: order.shipping_address.email,
        phone: order.shipping_address.phone
      },
      country_of_origin: 'India',
      destination_country: order.shipping_address.country,
      items,
      currency: order.selected_currency,
      exchange_rate: order.exchange_rate,
      total_value_inr: order.total_inr,
      total_value_converted: order.converted_total,
      total_weight_kg: Number(totalWeight.toFixed(2)),
      declaration: 'I hereby certify that the information provided in this document is accurate to the best of my knowledge and that the goods are authentic handmade crafts of Indian rural origin.',
      disclaimer: 'HS code shown is a system suggestion for student demo platform and must be verified by the exporter/customs professional. Not legally certified.',
      verification_status: 'Suggested',
      created_at: new Date().toISOString()
    };

    db.mutate(draft => {
      draft.customs_documents.push(customsDoc);
      // Link to order
      const ord = draft.orders.find(o => o.id === order.id);
      if (ord) {
        ord.customs_document_id = customsDoc.id;
      }
    });

    return customsDoc;
  }

  /**
   * Admin verifies or updates customs info
   */
  public static verifyOrUpdate(
    id: string,
    updates: {
      hs_codes?: Record<number, string>;
      notes?: string;
      verified_by: string;
      status: 'Admin_Verified' | 'Shipped' | 'Suggested';
    }
  ): CustomsDocument | null {
    let updated: CustomsDocument | null = null;
    db.mutate(draft => {
      const doc = draft.customs_documents.find(d => d.id === id);
      if (doc) {
        if (updates.hs_codes) {
          Object.entries(updates.hs_codes).forEach(([idxStr, newCode]) => {
            const idx = parseInt(idxStr, 10);
            if (doc.items[idx]) {
              doc.items[idx].hs_code = newCode;
            }
          });
        }
        doc.verification_status = updates.status;
        doc.verified_by = updates.verified_by;
        doc.verified_at = new Date().toISOString();
        updated = { ...doc };
      }
    });
    return updated;
  }
}
