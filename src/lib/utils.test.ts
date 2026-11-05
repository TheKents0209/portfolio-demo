import { expect, test } from 'vitest';
import { formatCents } from './utils';

// Intl uses non-breaking spaces; normalise so the expectations stay readable.
const fmt = (cents: number, currency: 'EUR' | 'USD') =>
  formatCents(cents, currency).replace(/\s/g, ' ');

test('formats integer cents as Estonian currency', () => {
  expect(fmt(312, 'EUR')).toBe('3,12 €');
  expect(fmt(22841, 'USD')).toBe('228,41 $');
});

test('keeps small and large amounts exact', () => {
  expect(fmt(5, 'EUR')).toBe('0,05 €');
  expect(fmt(0, 'EUR')).toBe('0,00 €');
  expect(fmt(123456789, 'EUR')).toBe('1 234 567,89 €');
});

test('et-EE only groups thousands from 5 digits up', () => {
  expect(fmt(867000, 'EUR')).toBe('8670,00 €');
  expect(fmt(1234500, 'EUR')).toBe('12 345,00 €');
});
