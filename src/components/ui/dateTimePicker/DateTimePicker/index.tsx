import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DayPicker, type DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import '../DateTimePicker.css';

import type { DateTimePickerProps } from '../types/DateTimePicker.types';
import { CalendarIcon, XMarkIcon } from '@/icons';
import { sizeConfig } from '../utils/DateTimePicker.constants';
import {
  MonthPicker,
  QuickActions,
  TimePicker,
  YearPicker,
} from '../components/DateTimePicker.subcomponents';
import {
  buildDisabledMatchers,
  formatDate,
  formatMultiDisplay,
  formatRangeDisplay,
  getDayPickerLocale,
  getFormattingLocale,
  resolveCaptionLayout,
} from '../utils/DateTimePicker.utils';
import { dayPickerClassNames } from '@/theme/dayPicker.theme';

type CalendarView = 'date' | 'month' | 'year';

const DEFAULT_FROM_YEAR = new Date().getFullYear() - 10;
const DEFAULT_TO_YEAR = new Date().getFullYear() + 10;

export function DateTimePicker({
  mode,
  value,
  onChange,
  placeholder,
  disabled = false,
  minDate,
  maxDate,
  className = '',
  use12Hour = true,
  rangeMode = 'single',
  rangeValue,
  onRangeChange,
  multiValue,
  onMultiChange,
  showClearButton = false,
  showTodayButton = false,
  customFormat,
  size = 'medium',
  readOnly = false,
  disabledDates,
  locale,
  onOpen,
  onClose,
  autoClose = true,
  enableKeyboardShortcuts = true,
  calendarNavigation,
  hasError = false,
}: DateTimePickerProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(rangeValue);
  const [selectedMulti, setSelectedMulti] = useState<Date[]>(multiValue ?? []);
  const [calendarView, setCalendarView] = useState<CalendarView>('date');
  const [viewMonth, setViewMonth] = useState<Date>(value ?? new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const updatePosition = useCallback((): void => {
    if (containerRef.current == null) return;
    const rect = containerRef.current.getBoundingClientRect();
    const gap = 8;
    const calendarWidth = dropdownRef.current?.offsetWidth ?? 360;

    let left = rect.left + window.scrollX;
    if (left + calendarWidth > window.innerWidth) {
      left = rect.right + window.scrollX - calendarWidth;
    }
    left = Math.max(0, left);

    setDropdownPos({
      top: rect.bottom + window.scrollY + gap,
      left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    setSelectedDate(value);
  }, [value]);
  useEffect(() => {
    setSelectedRange(rangeValue);
  }, [rangeValue]);
  useEffect(() => {
    setSelectedMulti(multiValue ?? []);
  }, [multiValue]);

  const handleOpen = useCallback((): void => {
    if (disabled || readOnly) return;
    setIsOpen(true);
    setCalendarView('date');
    onOpen?.();
    requestAnimationFrame(() => updatePosition());
  }, [disabled, readOnly, onOpen, updatePosition]);

  const handleClose = useCallback((): void => {
    setIsOpen(false);
    setCalendarView('date');
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target;
      if (!target) return;
      if (
        containerRef.current?.contains(target as Node) === true ||
        dropdownRef.current?.contains(target as Node) === true
      ) return;
      handleClose();
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClose]);

  // Reposition on scroll/resize
  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!enableKeyboardShortcuts || !isOpen) return;
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, enableKeyboardShortcuts, handleClose]);

  const handleDateSelect = (date: Date | undefined): void => {
    if (!date) return;
    let newDate = date;
    if (mode === 'datetime' && selectedDate) {
      newDate = new Date(date);
      newDate.setHours(selectedDate.getHours());
      newDate.setMinutes(selectedDate.getMinutes());
    }
    setSelectedDate(newDate);
    onChange?.(newDate);
    if (autoClose && mode !== 'datetime' && mode !== 'time') handleClose();
  };

  const handleRangeSelect = (range: DateRange | undefined): void => {
    if (mode === 'datetime' && range) {
      const updatedRange: DateRange = { ...range };
      const wasCompleteRange = Boolean(selectedRange?.from && selectedRange?.to);
      const isNewSelection = Boolean(wasCompleteRange && range.from && !range.to);
      if (range.from) {
        updatedRange.from = new Date(range.from);
        if (isNewSelection || !selectedRange?.from) {
          const now = new Date();
          updatedRange.from.setHours(now.getHours());
          updatedRange.from.setMinutes(now.getMinutes());
        } else {
          updatedRange.from.setHours(selectedRange.from.getHours());
          updatedRange.from.setMinutes(selectedRange.from.getMinutes());
        }
      }
      if (range.to) {
        updatedRange.to = new Date(range.to);
        if (selectedRange?.to) {
          updatedRange.to.setHours(selectedRange.to.getHours());
          updatedRange.to.setMinutes(selectedRange.to.getMinutes());
        } else {
          const now = new Date();
          updatedRange.to.setHours(now.getHours());
          updatedRange.to.setMinutes(now.getMinutes());
        }
      }
      setSelectedRange(updatedRange);
      onRangeChange?.(updatedRange);
    } else {
      setSelectedRange(range);
      onRangeChange?.(range);
    }
    const isCompleteRange = Boolean(range?.from && range?.to);
    if (autoClose && isCompleteRange && mode !== 'datetime' && mode !== 'date') handleClose();
  };

  const handleRangeTimeChange = (date: Date, isStartTime: boolean): void => {
    if (!selectedRange) return;
    const updatedRange: DateRange = { ...selectedRange };
    if (isStartTime && updatedRange.from) {
      updatedRange.from = new Date(updatedRange.from);
      updatedRange.from.setHours(date.getHours());
      updatedRange.from.setMinutes(date.getMinutes());
    } else if (!isStartTime && updatedRange.to) {
      updatedRange.to = new Date(updatedRange.to);
      updatedRange.to.setHours(date.getHours());
      updatedRange.to.setMinutes(date.getMinutes());
    }
    setSelectedRange(updatedRange);
    onRangeChange?.(updatedRange);
  };

  const handleMultiSelect = (dates: Date[] | undefined): void => {
    const newDates = dates ?? [];
    setSelectedMulti(newDates);
    onMultiChange?.(newDates.length > 0 ? newDates : undefined);
  };

  const handleTimeChange = (date: Date): void => {
    setSelectedDate(date);
    onChange?.(date);
  };

  const handleClear = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (rangeMode === 'range') {
      setSelectedRange(undefined);
      onRangeChange?.(undefined);
    } else if (rangeMode === 'multiple') {
      setSelectedMulti([]);
      onMultiChange?.(undefined);
    } else {
      setSelectedDate(undefined);
      onChange?.(undefined);
    }
  };

  const handleTodayClick = (): void => {
    const now = new Date();
    if (rangeMode === 'range') {
      const range: DateRange = { from: now, to: now };
      setSelectedRange(range);
      onRangeChange?.(range);
    } else if (rangeMode === 'multiple') {
      setSelectedMulti([now]);
      onMultiChange?.([now]);
    } else {
      setSelectedDate(now);
      onChange?.(now);
    }
    if (autoClose && mode !== 'datetime') handleClose();
  };

  // Stepped navigation: year → month → date
  const handleYearSelect = (date: Date | undefined): void => {
    if (!date) return;
    setViewMonth(new Date(date.getFullYear(), viewMonth.getMonth(), 1));
    setCalendarView('month');
  };

  const handleMonthSelect = (date: Date | undefined): void => {
    if (!date) return;
    setViewMonth(new Date(viewMonth.getFullYear(), date.getMonth(), 1));
    setCalendarView('date');
  };

  const handleCaptionClick = (): void => {
    setCalendarView('year');
  };

  const disabledMatchers = buildDisabledMatchers({ minDate, maxDate, disabledDates });

  const getDisplayValue = (): string => {
    if (rangeMode === 'range')
      return formatRangeDisplay(selectedRange, mode, use12Hour, customFormat, locale);
    if (rangeMode === 'multiple')
      return formatMultiDisplay(selectedMulti, mode, use12Hour, customFormat, locale);
    return formatDate(selectedDate, mode, use12Hour, customFormat, locale);
  };

  const displayValue = getDisplayValue();
  const hasValue =
    rangeMode === 'range'
      ? Boolean(selectedRange?.from || selectedRange?.to)
      : rangeMode === 'multiple'
        ? selectedMulti.length > 0
        : Boolean(selectedDate);

  const handleToggle = (): void => {
    if (disabled || readOnly) return;
    if (isOpen) handleClose();
    else handleOpen();
  };

  const dayPickerLocale = getDayPickerLocale(locale);
  const monthYearLocaleString = getFormattingLocale(locale);

  const fromYear = calendarNavigation?.fromYear ?? DEFAULT_FROM_YEAR;
  const toYear = calendarNavigation?.toYear ?? DEFAULT_TO_YEAR;

  // Custom caption with clickable month/year label
  const captionLabel = viewMonth.toLocaleDateString(monthYearLocaleString, {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        onClick={handleToggle}
        className={`
          flex items-center justify-between gap-2
          w-full h-[var(--layout-field-height)] px-3.5
          bg-surface border rounded
          text-text text-xs
          ${
            hasError
              ? 'border-error focus-within:border-error focus-within:ring-2 focus-within:ring-error/10'
              : 'border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10'
          }
          ${disabled ? 'cursor-not-allowed bg-surface-muted text-text-muted border-border' : readOnly ? 'cursor-default' : 'cursor-pointer'}
        `}
      >
        <span className={displayValue ? 'text-text flex-1' : 'text-text-muted flex-1'}>
          {displayValue || placeholder || 'Select...'}
        </span>
        <div className="flex items-center gap-1">
          {showClearButton && hasValue && !disabled && !readOnly && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-surface-muted rounded transition-colors"
              aria-label="Clear"
            >
              <XMarkIcon className={`${sizeConfig[size].icon} text-text-muted hover:text-text`} />
            </button>
          )}
          <CalendarIcon className={`${sizeConfig[size].icon} text-text-muted`} />
        </div>
      </div>

      {isOpen && !disabled && !readOnly && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[9999] min-w-[260px] bg-surface border border-border rounded-lg shadow-lg"
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
        >
          {/* Stepped navigation for date/datetime mode */}
          {(mode === 'date' || mode === 'datetime') && calendarView === 'year' && (
            <YearPicker value={viewMonth} onChange={handleYearSelect} size={size} />
          )}

          {(mode === 'date' || mode === 'datetime') && calendarView === 'month' && (
            <MonthPicker
              value={viewMonth}
              onChange={handleMonthSelect}
              size={size}
              locale={monthYearLocaleString}
            />
          )}

          {(mode === 'date' || mode === 'datetime') && calendarView === 'date' && (
            <div className="custom-day-picker">
              {/* Clickable caption for stepped navigation */}
              <div className="flex items-center justify-between px-3 pt-3 pb-1">
                <button
                  type="button"
                  onClick={handleCaptionClick}
                  className="text-sm font-medium text-text hover:text-primary transition-colors"
                >
                  {captionLabel}
                </button>
              </div>

              {rangeMode === 'range' ? (
                <DayPicker
                  captionLayout={resolveCaptionLayout(calendarNavigation)}
                  startMonth={new Date(fromYear, 0)}
                  endMonth={new Date(toYear, 11)}
                  mode="range"
                  month={viewMonth}
                  onMonthChange={setViewMonth}
                  selected={selectedRange}
                  onSelect={handleRangeSelect}
                  disabled={disabledMatchers}
                  locale={dayPickerLocale}
                  classNames={{ ...dayPickerClassNames, month_caption: 'hidden' }}
                  hideNavigation={false}
                />
              ) : rangeMode === 'multiple' ? (
                <DayPicker
                  captionLayout="label"
                  mode="multiple"
                  month={viewMonth}
                  onMonthChange={setViewMonth}
                  selected={selectedMulti}
                  onSelect={handleMultiSelect}
                  disabled={disabledMatchers}
                  locale={dayPickerLocale}
                  classNames={{ ...dayPickerClassNames, month_caption: 'hidden' }}
                />
              ) : (
                <DayPicker
                  captionLayout="label"
                  mode="single"
                  month={viewMonth}
                  onMonthChange={setViewMonth}
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={disabledMatchers}
                  locale={dayPickerLocale}
                  classNames={{ ...dayPickerClassNames, month_caption: 'hidden' }}
                />
              )}
            </div>
          )}

          {mode === 'datetime' && rangeMode === 'range' && calendarView === 'date' && (
            <div className="border-t border-border">
              <div className="p-3 bg-surface-muted">
                <p className="text-xs font-medium text-text mb-2">Start Time</p>
              </div>
              <TimePicker
                value={selectedRange?.from}
                onChange={(date) => handleRangeTimeChange(date, true)}
                use12Hour={use12Hour}
                size={size}
              />
              {selectedRange?.to != null && (
                <>
                  <div className="p-3 bg-surface-muted border-t border-border">
                    <p className="text-xs font-medium text-text mb-2">End Time</p>
                  </div>
                  <TimePicker
                    value={selectedRange.to}
                    onChange={(date) => handleRangeTimeChange(date, false)}
                    use12Hour={use12Hour}
                    size={size}
                  />
                </>
              )}
            </div>
          )}

          {mode === 'datetime' && rangeMode === 'single' && calendarView === 'date' && (
            <TimePicker
              value={selectedDate}
              onChange={handleTimeChange}
              use12Hour={use12Hour}
              size={size}
            />
          )}

          {mode === 'time' && (
            <TimePicker
              value={selectedDate}
              onChange={handleTimeChange}
              use12Hour={use12Hour}
              size={size}
            />
          )}

          {mode === 'month' && (
            <MonthPicker
              value={selectedDate}
              onChange={handleDateSelect}
              size={size}
              locale={monthYearLocaleString}
            />
          )}

          {mode === 'year' && (
            <YearPicker value={selectedDate} onChange={handleDateSelect} size={size} />
          )}

          {showTodayButton && (
            <QuickActions
              showTodayButton={showTodayButton}
              onTodayClick={handleTodayClick}
              size={size}
              mode={mode}
            />
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
