import React, { useState } from 'react';

import { sizeConfig } from '../utils/DateTimePicker.constants';
import type {
  MonthPickerProps,
  QuickActionsProps,
  TimePickerProps,
  TimeState,
  YearPickerProps,
} from '../types/DateTimePicker.internal-types';
import { createDateFromTime, getTimeFromDate } from '../utils/DateTimePicker.utils';

export function TimePicker({
  value,
  onChange,
  use12Hour,
  size,
}: TimePickerProps): React.ReactElement {
  const timeState: TimeState = value
    ? getTimeFromDate(value, use12Hour)
    : { hours: 12, minutes: 0, period: 'AM' };

  const [time, setTime] = useState<TimeState>(timeState);

  const updateTime = (newTime: TimeState): void => {
    setTime(newTime);
    const newDate = createDateFromTime(value, newTime, use12Hour);
    onChange(newDate);
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const val = Number.parseInt(e.target.value, 10);
    if (Number.isNaN(val)) return;

    const maxHour = use12Hour ? 12 : 23;
    const minHour = use12Hour ? 1 : 0;

    if (val >= minHour && val <= maxHour) {
      updateTime({ ...time, hours: val });
    }
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const val = Number.parseInt(e.target.value, 10);
    if (Number.isNaN(val)) return;

    if (val >= 0 && val <= 59) {
      updateTime({ ...time, minutes: val });
    }
  };

  const togglePeriod = (): void => {
    updateTime({ ...time, period: time.period === 'AM' ? 'PM' : 'AM' });
  };

  const buttonClass = sizeConfig[size].button;

  return (
    <div className="p-4 bg-surface border-t border-border">
      <div className="flex items-center gap-2 justify-center">
        <input
          type="number"
          value={time.hours.toString().padStart(2, '0')}
          onChange={handleHourChange}
          min={use12Hour ? 1 : 0}
          max={use12Hour ? 12 : 23}
          className={`w-16 ${buttonClass} text-center bg-surface border border-border rounded-md text-text focus:ring-2 focus:ring-primary focus:outline-none`}
        />
        <span className="text-text text-xl font-medium">:</span>
        <input
          type="number"
          value={time.minutes.toString().padStart(2, '0')}
          onChange={handleMinuteChange}
          min={0}
          max={59}
          className={`w-16 ${buttonClass} text-center bg-surface border border-border rounded-md text-text focus:ring-2 focus:ring-primary focus:outline-none`}
        />
        {use12Hour && (
          <button
            type="button"
            onClick={togglePeriod}
            className={`${buttonClass} bg-primary text-white rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary`}
          >
            {time.period}
          </button>
        )}
      </div>
    </div>
  );
}

export function MonthPicker({
  value,
  onChange,
  size,
  locale,
}: MonthPickerProps): React.ReactElement {
  const currentYear = value ? value.getFullYear() : new Date().getFullYear();
  const currentMonth = value ? value.getMonth() : new Date().getMonth();
  const [year, setYear] = useState<number>(currentYear);

  const localeStr = locale || 'en-US';
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2000, i, 1);
    return date.toLocaleDateString(localeStr, { month: 'long' });
  });

  const handleMonthClick = (monthIndex: number): void => {
    const newDate = new Date(year, monthIndex, 1);
    onChange(newDate);
  };

  const handleYearChange = (delta: number): void => {
    setYear(year + delta);
  };

  const buttonClass = sizeConfig[size].button;

  return (
    <div className="p-4 bg-surface">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => handleYearChange(-1)}
          className="p-2 hover:bg-surface-muted rounded-md text-text"
        >
          ←
        </button>
        <span className="text-text font-medium">{year}</span>
        <button
          type="button"
          onClick={() => handleYearChange(1)}
          className="p-2 hover:bg-surface-muted rounded-md text-text"
        >
          →
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {months.map((month, index) => (
          <button
            key={month}
            type="button"
            onClick={() => handleMonthClick(index)}
            className={`${buttonClass} rounded-md ${
              index === currentMonth && year === currentYear
                ? 'bg-primary text-white'
                : 'bg-surface-muted text-text hover:bg-primary-hover hover:text-white'
            }`}
          >
            {month.substring(0, 3)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function YearPicker({ value, onChange, size }: YearPickerProps): React.ReactElement {
  const currentYear = value ? value.getFullYear() : new Date().getFullYear();
  const [startYear, setStartYear] = useState<number>(Math.floor(currentYear / 12) * 12);

  const years = Array.from({ length: 12 }, (_, i) => startYear + i);

  const handleYearClick = (year: number): void => {
    const newDate = new Date(year, 0, 1);
    onChange(newDate);
  };

  const handleRangeChange = (delta: number): void => {
    setStartYear(startYear + delta * 12);
  };

  const buttonClass = sizeConfig[size].button;

  return (
    <div className="p-4 bg-surface">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => handleRangeChange(-1)}
          className="p-2 hover:bg-surface-muted rounded-md text-text"
        >
          ←
        </button>
        <span className="text-text font-medium">
          {startYear} - {startYear + 11}
        </span>
        <button
          type="button"
          onClick={() => handleRangeChange(1)}
          className="p-2 hover:bg-surface-muted rounded-md text-text"
        >
          →
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {years.map((year) => (
          <button
            key={year}
            type="button"
            onClick={() => handleYearClick(year)}
            className={`${buttonClass} rounded-md ${
              year === currentYear
                ? 'bg-primary text-white'
                : 'bg-surface-muted text-text hover:bg-primary-hover hover:text-white'
            }`}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  );
}

export function QuickActions({
  showTodayButton,
  onTodayClick,
  size,
  mode,
}: QuickActionsProps): React.ReactElement | null {
  if (!showTodayButton) return null;

  const buttonClass = sizeConfig[size].button;
  const label = mode === 'time' ? 'Now' : 'Today';

  return (
    <div className="p-2 bg-surface border-t border-border flex justify-end">
      <button
        type="button"
        onClick={onTodayClick}
        className={`${buttonClass} bg-surface-muted text-text hover:bg-primary hover:text-white rounded-md transition-colors`}
      >
        {label}
      </button>
    </div>
  );
}
