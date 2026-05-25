import { DEFAULT_CURRENCY } from '@/constants';

const CURRENCY_LOCALE: Record<string, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
};

export function formatCurrency(
  value: number | null | undefined,
  currency: string = DEFAULT_CURRENCY
): string {
  const num = value ?? 0;
  const locale = CURRENCY_LOCALE[currency] ?? 'en-IN';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatDate(
  value: string | null | undefined,
  locale: string = 'en-GB'
): string {
  if (value == null || value === '') return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
