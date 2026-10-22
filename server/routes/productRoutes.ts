import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { HSCodeService } from '../services/hsCodeService';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { Product } from '../types';

export const productRouter = Router();

// Live HS code suggestion preview
productRouter.post('/suggest-hs', (req: Request, res: Response): void => {
  try {
    const { name, material, description, category_name } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Product name is required for HS code suggestion' });
      return;
    }
    const suggestion = HSCodeService.suggest({ name, material, description, category_name });
    res.json(suggestion);
  } catch (err) {
    res.status(500).json({ error: 'Failed to suggest HS Code' });
  }
});

// List products with filtering & sorting
productRouter.get('/', (req: Request, res: Response): void => {
  try {
    let products = db.get('products');
    const {
      search,
      category,
      artisanId,
      minPrice,
      maxPrice,
      sort,
      status
    } = req.query as Record<string, string | undefined>;

    // Filter by status (default to active for storefront)
    if (status) {
      products = products.filter(p => p.status === status);
    } else {
      // By default show active unless specifically requested
      products = products.filter(p => p.status === 'active');
    }

    // Filter by artisan
    if (artisanId) {
      products = products.filter(p => p.artisan_id === artisanId);
    }

    // Filter by category slug or id
    if (category && category !== 'all') {
      const categories = db.get('categories');
      const catObj = categories.find(c => c.slug === category || c.id === category);
      if (catObj) {
        products = products.filter(p => p.category_id === catObj.id);
      }
    }

    // Filter by price in INR
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) products = products.filter(p => p.price_inr >= min);
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) products = products.filter(p => p.price_inr <= max);
    }

    // Search query across name, description, material, artisan_name, category_name
    if (search && search.trim() !== '') {
      const q = search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        p.artisan_name.toLowerCase().includes(q) ||
        p.category_name.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sort === 'price-low') {
      products.sort((a, b) => a.price_inr - b.price_inr);
    } else if (sort === 'price-high') {
      products.sort((a, b) => b.price_inr - a.price_inr);
    } else if (sort === 'newest') {
      products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      // Default: popular / rating
      products.sort((a, b) => (b.rating * b.reviews_count) - (a.rating * a.reviews_count));
    }

    res.json({
      products,
      total: products.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

// Get single product by ID or Slug
productRouter.get('/:idOrSlug', (req: Request, res: Response): void => {
  try {
    const { idOrSlug } = req.params;
    const products = db.get('products');
    const product = products.find(p => p.id === idOrSlug || p.slug === idOrSlug);

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Include artisan details
    const artisans = db.get('artisans');
    const artisan = artisans.find(a => a.id === product.artisan_id);

    res.json({
      ...product,
      artisan: artisan || null
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve product details' });
  }
});

// Create product (Artisan or Admin)
productRouter.post('/', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const {
      name,
      description,
      price_inr,
      stock = 10,
      category_id,
      material = 'Handmade Artisan Materials',
      weight_kg = 0.5,
      dimensions = '25 cm x 20 cm x 10 cm',
      country_of_origin = 'India',
      images = [],
      suggested_hs_code
    } = req.body;

    if (!name || !price_inr || !category_id) {
      res.status(400).json({ error: 'Name, price (INR), and category are required' });
      return;
    }

    const categories = db.get('categories');
    const category = categories.find(c => c.id === category_id);
    const category_name = category ? category.name : 'Handicrafts';

    // Find artisan
    const artisans = db.get('artisans');
    let artisan = artisans.find(a => a.user_id === req.user!.id);
    if (!artisan) {
      // If admin or artisan not explicitly bound, fallback to first artisan
      artisan = artisans[0];
    }

    // HS code recommendation
    let finalHsCode = suggested_hs_code;
    let hsConfidence: 'High' | 'Medium' | 'Low' = 'Medium';
    if (!finalHsCode) {
      const suggestion = HSCodeService.suggest({ name, material, description, category_name });
      finalHsCode = suggestion.hs_code;
      hsConfidence = suggestion.confidence;
    }

    const defaultImg = 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=1000&auto=format&fit=crop';
    const productImages = Array.isArray(images) && images.length > 0 ? images : [defaultImg];

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(100 + Math.random() * 900);

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      artisan_id: artisan.id,
      artisan_name: artisan.brand_name,
      category_id,
      category_name,
      name,
      slug,
      description: description || 'Artisanal authentic handcrafted goods made by rural craftsmen.',
      price_inr: Number(price_inr),
      stock: Number(stock),
      weight_kg: Number(weight_kg),
      dimensions,
      material,
      country_of_origin,
      images: productImages,
      suggested_hs_code: finalHsCode,
      hs_confidence: hsConfidence,
      hs_code_verified: req.user!.role === 'admin',
      status: 'active',
      created_at: new Date().toISOString(),
      rating: 5.0,
      reviews_count: 1
    };

    db.mutate(draft => {
      draft.products.unshift(newProduct);
    });

    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
productRouter.put('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    let updatedProduct: Product | null = null;

    db.mutate(draft => {
      const idx = draft.products.findIndex(p => p.id === id);
      if (idx !== -1) {
        draft.products[idx] = {
          ...draft.products[idx],
          ...req.body,
          id // enforce original id
        };
        updatedProduct = draft.products[idx];
      }
    });

    if (!updatedProduct) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
productRouter.delete('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    let removed = false;

    db.mutate(draft => {
      const initialLen = draft.products.length;
      draft.products = draft.products.filter(p => p.id !== id);
      if (draft.products.length < initialLen) {
        removed = true;
      }
    });

    if (!removed) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});
