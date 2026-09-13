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

// ── Duration (Hours + Minutes → "HH:MM") ──────────────────────────────────────

export type DurationFieldError = 'negative' | 'notInteger' | 'outOfRange' | null;

function validateDurationPart(raw: string, max: number | null): DurationFieldError {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) return 'notInteger';
  if (trimmed.startsWith('-')) return 'negative';
  if (trimmed.includes('.')) return 'notInteger';
  if (max != null && Number(trimmed) > max) return 'outOfRange';
  return null;
}

export function validateDurationHours(raw: string): DurationFieldError {
  return validateDurationPart(raw, null);
}

export function validateDurationMinutes(raw: string): DurationFieldError {
  return validateDurationPart(raw, 59);
}

/** Formats Hours + Minutes into "HH:MM" (both zero-padded to 2 digits). Returns null when both are empty. */
export function formatDuration(hours: string, minutes: string): string | null {
  if (hours.trim() === '' && minutes.trim() === '') return null;
  if (validateDurationHours(hours) !== null || validateDurationMinutes(minutes) !== null) return null;
  const h = hours.trim() === '' ? 0 : Number(hours);
  const m = minutes.trim() === '' ? 0 : Number(minutes);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Splits a stored "HH:MM" duration back into numeric-input-friendly strings (no leading zeros). */
export function parseDuration(value: string | null | undefined): { hours: string; minutes: string } {
  if (value == null || value === '') return { hours: '', minutes: '' };
  const [hours, minutes] = value.split(':');
  if (hours == null || minutes == null) return { hours: '', minutes: '' };
  return { hours: String(Number(hours)), minutes: String(Number(minutes)) };
}
