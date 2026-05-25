import type { DateRange, Matcher } from 'react-day-picker';
import type { Locale } from 'date-fns';
import type {
  CalendarNavigationConfig,
  PickerLocale,
  PickerMode,
} from '../types/DateTimePicker.types';
import type { TimeState } from '../types/DateTimePicker.internal-types';

/**
 * Extract a locale string (for `toLocaleDateString`/`toLocaleTimeString`) from a `PickerLocale`.
 */
export function getFormattingLocale(locale?: PickerLocale): string {
  return typeof locale === 'string' ? locale : 'en-US';
}

/**
 * Extract a date-fns `Locale` (for `react-day-picker`) from a `PickerLocale`.
 */
export function getDayPickerLocale(locale?: PickerLocale): Locale | undefined {
  return typeof locale === 'object' && locale !== null ? locale : undefined;
}

export function formatDate(
  date: Date | undefined,
  mode: PickerMode,
  use12Hour: boolean,
  customFormat?: string,
  locale?: PickerLocale
): string {
  if (!date) return '';

  if (customFormat) {
    return formatCustomDate(date, customFormat);
  }

  const localeStr = getFormattingLocale(locale);

  switch (mode) {
    case 'date':
      return date.toLocaleDateString(localeStr, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    case 'datetime':
      return date.toLocaleString(localeStr, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: use12Hour,
      });
    case 'time':
      return date.toLocaleTimeString(localeStr, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: use12Hour,
      });
    case 'month':
      return date.toLocaleDateString(localeStr, {
        year: 'numeric',
        month: 'long',
      });
    case 'year':
      return date.getFullYear().toString();
    default:
      return '';
  }
}

export function formatCustomDate(date: Date, format: string): string {
  const map: Record<string, string> = {
    YYYY: date.getFullYear().toString(),
    YY: date.getFullYear().toString().slice(-2),
    MM: (date.getMonth() + 1).toString().padStart(2, '0'),
    M: (date.getMonth() + 1).toString(),
    DD: date.getDate().toString().padStart(2, '0'),
    D: date.getDate().toString(),
    HH: date.getHours().toString().padStart(2, '0'),
    H: date.getHours().toString(),
    hh: (date.getHours() % 12 || 12).toString().padStart(2, '0'),
    h: (date.getHours() % 12 || 12).toString(),
    mm: date.getMinutes().toString().padStart(2, '0'),
    m: date.getMinutes().toString(),
    ss: date.getSeconds().toString().padStart(2, '0'),
    s: date.getSeconds().toString(),
    A: date.getHours() >= 12 ? 'PM' : 'AM',
    a: date.getHours() >= 12 ? 'pm' : 'am',
  };

  let result = format;
  for (const key of Object.keys(map)) {
    result = result.replace(new RegExp(key, 'g'), map[key]);
  }
  return result;
}

export function formatRangeDisplay(
  range: DateRange | undefined,
  mode: PickerMode,
  use12Hour: boolean,
  customFormat?: string,
  locale?: PickerLocale
): string {
  if (!range || (!range.from && !range.to)) return '';

  const fromStr = range.from ? formatDate(range.from, mode, use12Hour, customFormat, locale) : '';
  const toStr = range.to ? formatDate(range.to, mode, use12Hour, customFormat, locale) : '';

  if (fromStr && toStr) return `${fromStr} - ${toStr}`;
  return fromStr || toStr;
}

export function formatMultiDisplay(
  dates: Date[] | undefined,
  mode: PickerMode,
  use12Hour: boolean,
  customFormat?: string,
  locale?: PickerLocale
): string {
  if (!dates || dates.length === 0) return '';
  if (dates.length === 1) {
    return formatDate(dates[0], mode, use12Hour, customFormat, locale);
  }
  return `${dates.length} dates selected`;
}

export function getTimeFromDate(date: Date, use12Hour: boolean): TimeState {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  let period: 'AM' | 'PM' = 'AM';

  if (use12Hour) {
    period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
  }

  return { hours, minutes, period };
}

export function createDateFromTime(
  baseDate: Date | undefined,
  time: TimeState,
  use12Hour: boolean
): Date {
  const date = baseDate ? new Date(baseDate) : new Date();
  let hours = time.hours;

  if (use12Hour) {
    if (time.period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (time.period === 'AM' && hours === 12) {
      hours = 0;
    }
  }

  date.setHours(hours, time.minutes, 0, 0);
  return date;
}

export function buildDisabledMatchers(args: {
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Matcher | Matcher[];
}): Matcher[] {
  const matchers: Matcher[] = [];

  if (args.minDate) {
    matchers.push({ before: args.minDate });
  }

  if (args.maxDate) {
    matchers.push({ after: args.maxDate });
  }

  if (args.disabledDates != null) {
    if (Array.isArray(args.disabledDates)) {
      matchers.push(...args.disabledDates);
    } else {
      matchers.push(args.disabledDates);
    }
  }

  return matchers;
}

type CaptionLayout = 'label' | 'dropdown' | 'dropdown-months' | 'dropdown-years' | undefined;

export function resolveCaptionLayout(nav?: CalendarNavigationConfig): CaptionLayout {
  if (!nav?.monthDropdown && !nav?.yearDropdown) {
    return 'label';
  }

  if (nav.monthDropdown && nav.yearDropdown) {
    return 'dropdown';
  }

  if (nav.monthDropdown) {
    return 'dropdown-months';
  }

  if (nav.yearDropdown) {
    return 'dropdown-years';
  }

  return 'label';
}
