import type { Position } from '../data/positions';

type CurrencyCode = Position['currency'];

const formatters: Record<CurrencyCode, Intl.NumberFormat> = {
  EUR: new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }),
  USD: new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'USD' }),
};

export function formatCents(cents: number, currency: CurrencyCode) {
  return formatters[currency].format(cents / 100);
}

export function createBackoff({ base = 500, max = 30000, jitter = true } = {}) {
  let attempt = 0;

  return {
    next() {
      const exponential = Math.min(base * Math.pow(2, attempt), max);
      const delay = jitter ? exponential * (0.5 + Math.random() * 0.5) : exponential;
      attempt++;
      return Math.floor(delay);
    },
    reset() {
      attempt = 0;
    },
  };
}
