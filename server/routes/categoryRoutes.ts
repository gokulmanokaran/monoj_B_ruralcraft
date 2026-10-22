import { Router, Request, Response } from 'express';
import { db } from '../db/database';

export const categoryRouter = Router();

// Get all categories
categoryRouter.get('/', (req: Request, res: Response): void => {
  try {
    const categories = db.get('categories');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve categories' });
  }
});
