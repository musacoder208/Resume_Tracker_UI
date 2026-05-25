import { useState, forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import { EyeIcon, EyeSlashIcon } from '@/icons';
import { useDirection } from '@/hooks/useDirection';

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  hasError?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ hasError = false, className, disabled = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const direction = useDirection();
    const isRtl = direction === 'rtl';

    return (
      <div className="relative h-[var(--layout-field-height)]">
        <input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          disabled={disabled}
          className={clsx(
            'block w-full rounded border bg-surface text-xs text-text placeholder:text-text-muted',
            'transition-colors focus:outline-none focus:ring-2',
            'h-[var(--layout-field-height)]',
            hasError
              ? 'border-error focus:border-error focus:ring-error/10'
              : 'border-border focus:border-primary focus:ring-primary/10',
            disabled && 'bg-surface-muted cursor-not-allowed opacity-60',
            isRtl ? 'pl-10 pr-[4px]' : 'pr-10 pl-[4px]',
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => {
            setShowPassword((prev) => !prev);
          }}
          disabled={disabled}
          className={clsx(
            'absolute inset-y-0 flex items-center text-text-muted hover:text-text',
            'focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
            isRtl ? 'left-0 pl-3' : 'right-0 pr-3'
          )}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
