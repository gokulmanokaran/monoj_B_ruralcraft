import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import type { CurrencyRates } from '../types';

export interface CurrencyMeta {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

export const SUPPORTED_CURRENCIES: CurrencyMeta[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED ', flag: '🇦🇪' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' }
];

interface FormattedPrice {
  inrString: string;
  convertedString: string;
  convertedRaw: number;
  currency: string;
  symbol: string;
  rate: number;
}

interface CurrencyContextType {
  currency: string;
  setCurrency: (code: string) => void;
  rates: Record<string, number>;
  loadingRates: boolean;
  formatPrice: (priceInr: number) => FormattedPrice;
  convertPrice: (priceInr: number) => number;
  refreshRates: () => Promise<void>;
  lastUpdated: string;
}

const DEFAULT_RATES: Record<string, number> = {
  INR: 1.0,
  USD: 0.01185,
  EUR: 0.01095,
  GBP: 0.00938,
  AED: 0.0435,
  AUD: 0.0181,
  CAD: 0.0163,
  SGD: 0.0157,
  JPY: 1.815
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<string>(() => {
    return localStorage.getItem('rcg_currency') || 'USD';
  });
  const [rates, setRates] = useState<Record<string, number>>(DEFAULT_RATES);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());
  const [loadingRates, setLoadingRates] = useState<boolean>(false);

  const fetchRates = async () => {
    setLoadingRates(true);
    try {
      const data = await api.getCurrencyRates();
      if (data && data.rates) {
        setRates(data.rates);
        setLastUpdated(data.last_updated);
      }
    } catch (err) {
      console.warn('Using default currency rates:', err);
    } finally {
      setLoadingRates(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const setCurrency = (code: string) => {
    setCurrencyState(code);
    localStorage.setItem('rcg_currency', code);
  };

  const convertPrice = (priceInr: number): number => {
    const rate = rates[currency] || 1.0;
    if (currency === 'JPY') {
      return Math.round(priceInr * rate);
    }
    return Number((priceInr * rate).toFixed(2));
  };

  const formatPrice = (priceInr: number): FormattedPrice => {
    const currMeta = SUPPORTED_CURRENCIES.find(c => c.code === currency) || SUPPORTED_CURRENCIES[0];
    const rate = rates[currency] || 1.0;
    const converted = convertPrice(priceInr);

    let convertedString = '';
    if (currency === 'JPY') {
      convertedString = `${currMeta.symbol}${converted.toLocaleString()}`;
    } else {
      convertedString = `${currMeta.symbol}${converted.toFixed(2)}`;
    }

    const inrString = `₹${priceInr.toLocaleString('en-IN')}`;

    return {
      inrString,
      convertedString,
      convertedRaw: converted,
      currency,
      symbol: currMeta.symbol,
      rate
    };
  };

  const refreshRates = async () => {
    try {
      const result = await api.refreshCurrencyRates();
      if (result && result.data) {
        setRates(result.data.rates);
        setLastUpdated(result.data.last_updated);
      }
    } catch (err) {
      console.error('Failed to trigger rate refresh:', err);
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        rates,
        loadingRates,
        formatPrice,
        convertPrice,
        refreshRates,
        lastUpdated
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
