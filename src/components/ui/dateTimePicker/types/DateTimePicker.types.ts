/**
 * DateTimePicker public types
 *
 * This file contains types intended for component consumers.
 * Internal implementation types are separated to avoid leaking internals
 * into the public surface area.
 */

import type { DateRange, Matcher } from 'react-day-picker';
import type { Locale } from 'date-fns';

/**
 * Determines which UI/format is active.
 */
export type PickerMode = 'date' | 'datetime' | 'time' | 'month' | 'year';

/**
 * Selection model for the calendar.
 */
export type RangeMode = 'single' | 'range' | 'multiple';

/**
 * Size variants used for spacing and typography.
 */
export type SizeVariant = 'small' | 'medium' | 'large';

/**
 * Locale input.
 *
 * - If you pass a string (e.g. "en-US"), it's used for `toLocale*` formatting.
 * - If you pass a date-fns Locale object, it is forwarded to `react-day-picker`.
 */
export type PickerLocale = string | Locale;

/**
 * Main props for DateTimePicker.
 */
export interface DateTimePickerProps {
  /**
   * The mode of the picker.
   */
  mode: PickerMode;

  /**
   * Selected date value (single mode).
   */
  value?: Date;

  /**
   * Callback when date changes (single mode).
   */
  onChange?: (date: Date | undefined) => void;

  /**
   * Placeholder text shown when no value is selected.
   */
  placeholder?: string;

  /**
   * Whether the picker is disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * Minimum selectable date.
   */
  minDate?: Date;

  /**
   * Maximum selectable date.
   */
  maxDate?: Date;

  /**
   * Additional CSS class names applied to the container.
   */
  className?: string;

  /**
   * Use 12-hour time format (with AM/PM).
   * @default true
   */
  use12Hour?: boolean;

  /**
   * Selection mode: single, range, or multiple.
   * @default "single"
   */
  rangeMode?: RangeMode;

  /**
   * Selected date range (range mode).
   */
  rangeValue?: DateRange;

  /**
   * Callback when range changes.
   */
  onRangeChange?: (range: DateRange | undefined) => void;

  /**
   * Selected dates (multiple mode).
   */
  multiValue?: Date[];

  /**
   * Callback when multiple selection changes.
   */
  onMultiChange?: (dates: Date[] | undefined) => void;

  /**
   * Show clear button when a value exists.
   * @default false
   */
  showClearButton?: boolean;

  /**
   * Show a quick action button (Today / Now).
   * @default false
   */
  showTodayButton?: boolean;

  /**
   * Custom date format tokens.
   * Supports: YYYY, YY, MM, M, DD, D, HH, H, hh, h, mm, m, ss, s, A, a
   */
  customFormat?: string;

  /**
   * Size variant.
   * @default "medium"
   */
  size?: SizeVariant;

  /**
   * Read-only mode (display only).
   * @default false
   */
  readOnly?: boolean;

  /**
   * Custom rules for disabled dates.
   */
  disabledDates?: Matcher | Matcher[];

  /**
   * Locale configuration.
   */
  locale?: PickerLocale;

  /**
   * Callback when picker opens.
   */
  onOpen?: () => void;

  /**
   * Callback when picker closes.
   */
  onClose?: () => void;

  /**
   * Auto-close picker after selection.
   * @default true
   */
  autoClose?: boolean;

  /**
   * Enable keyboard shortcuts (ESC closes).
   * @default true
   */
  enableKeyboardShortcuts?: boolean;

  calendarNavigation?: CalendarNavigationConfig;

  /**
   * Show error border (red) on the trigger.
   * @default false
   */
  hasError?: boolean;
}


export interface CalendarNavigationConfig {
  /** Show month dropdown in calendar caption */
  monthDropdown?: boolean;

  /** Show year dropdown in calendar caption */
  yearDropdown?: boolean;

  /** Earliest selectable year (only applies if yearDropdown = true) */
  fromYear?: number;

  /** Latest selectable year (only applies if yearDropdown = true) */
  toYear?: number;
}
