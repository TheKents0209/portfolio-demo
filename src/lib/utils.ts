import type { Position } from '../data/positions';

type CurrencyCode = Position['currency'];

const formatters: Record<CurrencyCode, Intl.NumberFormat> = {
  EUR: new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }),
  USD: new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'USD' }),
};

export function formatCents(cents: number, currency: CurrencyCode) {
  return formatters[currency].format(cents / 100);
}
