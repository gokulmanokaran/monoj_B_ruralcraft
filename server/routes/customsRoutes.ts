import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { CustomsService } from '../services/customsService';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

export const customsRouter = Router();

// List all customs documents
customsRouter.get('/', (req: Request, res: Response): void => {
  try {
    const docs = db.get('customs_documents');
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve customs documents' });
  }
});

// Get by document ID
customsRouter.get('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const docs = db.get('customs_documents');
    const doc = docs.find(d => d.id === id || d.invoice_number === id);

    if (!doc) {
      res.status(404).json({ error: 'Customs document not found' });
      return;
    }

    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve document' });
  }
});

// Get by Order ID
customsRouter.get('/by-order/:orderId', (req: Request, res: Response): void => {
  try {
    const { orderId } = req.params;
    const docs = db.get('customs_documents');
    const doc = docs.find(d => d.order_id === orderId || d.order_number === orderId);

    if (!doc) {
      res.status(404).json({ error: 'No customs document found for this order' });
      return;
    }

    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve customs document' });
  }
});

// Admin verify or edit HS code
customsRouter.patch('/:id/verify', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { hs_codes, notes, status = 'Admin_Verified' } = req.body;

    const verifierName = req.user ? `${req.user.full_name} (${req.user.role})` : 'System Admin';

    const updated = CustomsService.verifyOrUpdate(id, {
      hs_codes,
      notes,
      verified_by: verifierName,
      status
    });

    if (!updated) {
      res.status(404).json({ error: 'Customs document not found' });
      return;
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update customs verification' });
  }
});
