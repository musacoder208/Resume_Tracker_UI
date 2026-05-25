/**
 * NumberInput
 *
 * Text input that only accepts numeric characters (no e/E/+/-).
 * - commaFormatted: formats with commas on blur (default false)
 * - showArrows: shows up/down increment buttons (default false)
 */

import { forwardRef, useRef, useState } from 'react';
import type { InputHTMLAttributes, JSX } from 'react';
import clsx from 'clsx';
import { ChevronUpIcon, ChevronDownIcon } from '@/icons';
import { getInputClasses } from '@/components/ui/input/inputStyles';

export interface NumberInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onChange'
> {
  value: string;
  onChange: (value: string) => void;
  commaFormatted?: boolean;
  showArrows?: boolean;
  hasError?: boolean;
  min?: number;
  max?: number;
  maxLength?: number;
}

function formatWithCommas(val: string): string {
  const raw = val.replace(/,/g, '');
  if (raw === '') return '';
  const num = Number(raw);
  if (isNaN(num)) return val;
  return num.toLocaleString('en-IN');
}

function stripCommas(val: string): string {
  return val.replace(/,/g, '');
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  {
    value,
    onChange,
    commaFormatted = false,
    showArrows = false,
    hasError = false,
    disabled = false,
    min,
    max,
    maxLength,
    className,
    placeholder,
    ...props
  },
  ref
): JSX.Element {
  // Internal state only needed for comma mode (display differs from raw value during focus)
  const [commaFocused, setCommaFocused] = useState(false);
  const [commaDisplay, setCommaDisplay] = useState(value);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const setRef = (el: HTMLInputElement | null): void => {
    inputRef.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref != null) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
  };

  const clampValue = (v: number): number => {
    let clamped = v;
    if (min != null) clamped = Math.max(min, clamped);
    if (max != null) clamped = Math.min(max, clamped);
    return clamped;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    let raw = e.target.value.replace(/[^0-9]/g, '');
    if (maxLength != null) raw = raw.slice(0, maxLength);
    if (commaFormatted) {
      setCommaDisplay(raw);
    }
    onChange(raw);
  };

  const handleFocus = (): void => {
    if (commaFormatted) {
      setCommaFocused(true);
      setCommaDisplay(stripCommas(value));
    }
  };

  const handleBlur = (): void => {
    if (commaFormatted) {
      setCommaFocused(false);
      const raw = stripCommas(commaDisplay);
      onChange(raw);
    }
  };

  const increment = (): void => {
    const num = Number(value) || 0;
    onChange(String(clampValue(num + 1)));
  };

  const decrement = (): void => {
    const num = Number(value) || 0;
    onChange(String(clampValue(num - 1)));
  };

  // Determine display value
  let displayValue: string;
  if (commaFormatted) {
    displayValue = commaFocused ? commaDisplay : formatWithCommas(value);
  } else {
    displayValue = value;
  }

  const inputClasses = clsx(
    'w-full',
    getInputClasses(hasError ? 'error' : 'default', 'default', disabled),
    showArrows && 'pe-8',
    className
  );

  return (
    <div className="relative w-full">
      <input
        ref={setRef}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        className={inputClasses}
        {...props}
      />

      {showArrows && !disabled && (
        <div className="absolute inset-y-0 end-0 flex flex-col items-center justify-center pe-1">
          <button
            type="button"
            tabIndex={-1}
            onClick={increment}
            className="flex h-3 w-5 items-center justify-center rounded bg-background text-text-muted transition-colors hover:text-text"
          >
            <ChevronUpIcon className="h-3 w-3" aria-hidden="true" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            onClick={decrement}
            className="flex h-3 w-5 items-center justify-center rounded bg-background text-text-muted transition-colors hover:text-text"
          >
            <ChevronDownIcon className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
});
