import { Router, Request, Response } from 'express';
import { CurrencyService } from '../services/currencyService';

export const currencyRouter = Router();

// Get cached currency rates
currencyRouter.get('/rates', (req: Request, res: Response): void => {
  try {
    const rates = CurrencyService.getRates();
    res.json(rates);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve currency rates' });
  }
});

// Refresh rates from live Frankfurter API
currencyRouter.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await CurrencyService.refreshRates();
    res.json({
      success: true,
      message: 'Exchange rates successfully synchronized with international currency markets',
      data: updated
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to refresh rates' });
  }
});

// Quick conversion calculation endpoint
currencyRouter.get('/convert', (req: Request, res: Response): void => {
  try {
    const amount = parseFloat(req.query.amount as string) || 0;
    const to = (req.query.to as string) || 'USD';
    const result = CurrencyService.convert(amount, to);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to convert currency' });
  }
});
