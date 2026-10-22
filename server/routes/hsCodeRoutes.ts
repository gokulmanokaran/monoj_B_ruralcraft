import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { HSCodeMaster } from '../types';

export const hsCodeRouter = Router();

// List / search HS codes master table
hsCodeRouter.get('/', (req: Request, res: Response): void => {
  try {
    let list = db.get('hs_codes');
    const { search, category } = req.query as Record<string, string | undefined>;

    if (category) {
      list = list.filter(item => item.category.toLowerCase().includes(category.toLowerCase()));
    }

    if (search && search.trim() !== '') {
      const q = search.toLowerCase();
      list = list.filter(item =>
        item.hs_code.includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.keywords.some(k => k.toLowerCase().includes(q))
      );
    }

    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve HS codes' });
  }
});

// Admin add new HS Code
hsCodeRouter.post('/', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { category, hs_code, description, keywords, country_rules, duty_notes, confidence_rating = 'High' } = req.body;

    if (!category || !hs_code || !description) {
      res.status(400).json({ error: 'Category, HS code, and description are required' });
      return;
    }

    const keywordList = Array.isArray(keywords)
      ? keywords
      : (typeof keywords === 'string' ? keywords.split(',').map(s => s.trim()) : []);

    const newItem: HSCodeMaster = {
      id: `hs-${Date.now()}`,
      category,
      hs_code,
      description,
      keywords: keywordList,
      country_rules: country_rules || 'Standard export documentation required.',
      duty_notes: duty_notes || 'Preferential handicraft tariff rates apply.',
      confidence_rating
    };

    db.mutate(draft => {
      draft.hs_codes.unshift(newItem);
    });

    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add HS code entry' });
  }
});

// Admin update HS code
hsCodeRouter.put('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    let updated: HSCodeMaster | null = null;

    db.mutate(draft => {
      const idx = draft.hs_codes.findIndex(h => h.id === id);
      if (idx !== -1) {
        draft.hs_codes[idx] = {
          ...draft.hs_codes[idx],
          ...req.body,
          id
        };
        updated = draft.hs_codes[idx];
      }
    });

    if (!updated) {
      res.status(404).json({ error: 'HS code record not found' });
      return;
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update HS code' });
  }
});

// Admin delete HS code
hsCodeRouter.delete('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    let deleted = false;

    db.mutate(draft => {
      const prevLen = draft.hs_codes.length;
      draft.hs_codes = draft.hs_codes.filter(h => h.id !== id);
      if (draft.hs_codes.length < prevLen) {
        deleted = true;
      }
    });

    if (!deleted) {
      res.status(404).json({ error: 'HS code record not found' });
      return;
    }

    res.json({ success: true, message: 'HS Code removed from master repository' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete HS code' });
  }
});
