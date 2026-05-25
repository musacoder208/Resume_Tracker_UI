/**
 * DateTimePicker internal types
 *
 * These types are used by internal subcomponents and helpers.
 * They are not intended to be the primary consumer API.
 */

import type { PickerMode, SizeVariant } from './DateTimePicker.types';

/**
 * Internal state representing the time controls.
 */
export interface TimeState {
  hours: number;
  minutes: number;
  period: 'AM' | 'PM';
}

export interface IconProps {
  size: SizeVariant;
}

export interface TimePickerProps {
  value: Date | undefined;
  onChange: (date: Date) => void;
  use12Hour: boolean;
  size: SizeVariant;
}

export interface MonthPickerProps {
  value: Date | undefined;
  onChange: (date: Date) => void;
  size: SizeVariant;
  locale?: string;
}

export interface YearPickerProps {
  value: Date | undefined;
  onChange: (date: Date) => void;
  size: SizeVariant;
}

export interface QuickActionsProps {
  showTodayButton: boolean;
  onTodayClick: () => void;
  size: SizeVariant;
  mode: PickerMode;
}
