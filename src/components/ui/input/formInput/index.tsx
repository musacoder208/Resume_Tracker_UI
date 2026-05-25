import type { InputHTMLAttributes, JSX, ReactNode } from 'react';

import { Input } from '../input';

export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: string;
  hint?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  shape?: 'default' | 'pill';
}

export function FormInput({
  label,
  helperText,
  error,
  hint,
  id,
  leadingIcon,
  trailingIcon,
  shape = 'default',
  ...props
}: FormInputProps): JSX.Element {
  const describedBy = error ? `${id}-error` : helperText ? `${id}-description` : undefined;

  return (
    <div>
      <div className="flex justify-between">
        <label htmlFor={id} className="block text-sm/6 font-medium text-text">
          {label}
        </label>
        {hint && <span className="text-sm/6 text-text-muted">{hint}</span>}
      </div>

      <div className="mt-2">
        <Input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          variant={error ? 'error' : 'default'}
          leadingIcon={leadingIcon}
          trailingIcon={trailingIcon}
          shape={shape}
          {...props}
        />
      </div>

      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm text-error">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${id}-description`} className="mt-2 text-sm text-text-muted">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
