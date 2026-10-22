import { db } from '../db/database';
import { CurrencyRates } from '../types';

export class CurrencyService {
  /**
   * Get cached rates
   */
  public static getRates(): CurrencyRates {
    return db.get('currency_rates');
  }

  /**
   * Convert an INR amount to a target currency
   */
  public static convert(amountInr: number, targetCurrency: string): {
    amount_inr: number;
    converted_amount: number;
    rate: number;
    currency: string;
  } {
    const currencyData = db.get('currency_rates');
    const rate = currencyData.rates[targetCurrency] || 1.0;
    const converted = Number((amountInr * rate).toFixed(2));
    return {
      amount_inr: amountInr,
      converted_amount: converted,
      rate,
      currency: targetCurrency
    };
  }

  /**
   * Refresh rates from public API or update timestamp
   */
  public static async refreshRates(): Promise<CurrencyRates> {
    try {
      // Attempt fetching from Frankfurter or Open Exchange
      const response = await fetch('https://api.frankfurter.app/latest?from=EUR', {
        signal: AbortSignal.timeout(4000)
      });
      if (response.ok) {
        const data = await response.json() as { rates: Record<string, number> };
        // EUR to INR
        const eurToInr = data.rates['INR'] || 91.3;
        const current = db.get('currency_rates');
        
        // Recalculate rates against INR base
        const updatedRates: Record<string, number> = {
          INR: 1.0,
          USD: Number(((data.rates['USD'] || 1.08) / eurToInr).toFixed(6)),
          EUR: Number((1 / eurToInr).toFixed(6)),
          GBP: Number(((data.rates['GBP'] || 0.85) / eurToInr).toFixed(6)),
          AED: Number((0.0435).toFixed(6)), // AED pegged to USD (~3.67 AED/USD)
          AUD: Number(((data.rates['AUD'] || 1.65) / eurToInr).toFixed(6)),
          CAD: Number(((data.rates['CAD'] || 1.48) / eurToInr).toFixed(6)),
          SGD: Number(((data.rates['SGD'] || 1.45) / eurToInr).toFixed(6)),
          JPY: Number(((data.rates['JPY'] || 164.5) / eurToInr).toFixed(4))
        };

        const newRatesObj: CurrencyRates = {
          base: 'INR',
          rates: updatedRates,
          last_updated: new Date().toISOString()
        };

        db.set('currency_rates', newRatesObj);
        return newRatesObj;
      }
    } catch {
      // Offline fallback: keep existing solid cached rates and touch timestamp
    }

    const current = db.get('currency_rates');
    const updated = {
      ...current,
      last_updated: new Date().toISOString()
    };
    db.set('currency_rates', updated);
    return updated;
  }
}
