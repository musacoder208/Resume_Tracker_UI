import type { JSX } from 'react';

import { ComboBox } from '../comboBox';

export interface FormComboboxProps<T> {
  id: string;
  label: string | null;
  value: T | null;
  onChange: (value: T | null) => void;
  options: readonly T[];
  getOptionKey: (option: T) => string | number;
  getOptionLabel: (option: T) => string;
  filter: (query: string, option: T) => boolean;

  renderOption?: (option: T, selected: boolean) => JSX.Element;
  renderCreateOption?: (query: string) => JSX.Element;

  error?: string;
  helperText?: string;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

export function FormCombobox<T>({
  id,
  label,
  hint,
  error,
  helperText,
  disabled,
  required,
  ...props
}: FormComboboxProps<T>): JSX.Element {
  return (
    <div>
      <div className="flex justify-between">
        <label htmlFor={id} className="block text-sm/6 font-medium text-text">
          {label}
          {required && <span className="text-error ms-1">*</span>}
        </label>
        {hint != null && <span className="text-sm/6 text-text-muted">{hint}</span>}
      </div>

      <ComboBox {...props} hasError={error != null} disabled={disabled} />

      {(error ?? '') ? (
        <p className="mt-2 text-sm text-error">{error}</p>
      ) : helperText != null ? (
        <p className="mt-2 text-sm text-text-muted">{helperText}</p>
      ) : null}
    </div>
  );
}
