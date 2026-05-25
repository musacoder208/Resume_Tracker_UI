import { forwardRef } from 'react';
import type { InputHTMLAttributes, JSX, ReactNode } from 'react';
import clsx from 'clsx';

import { getInputClasses } from '../inputStyles';

export interface UIInputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error';
  shape?: 'default' | 'pill';
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  leadingAddon?: ReactNode;
  trailingAddon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, UIInputProps>(function UIInput(
  {
    variant = 'default',
    shape = 'default',
    leadingIcon,
    trailingIcon,
    leadingAddon,
    trailingAddon,
    disabled = false,
    className,
    ...props
  },
  ref
): JSX.Element {
  const hasGridOverlay = leadingIcon != null || trailingIcon != null;

  if (leadingAddon != null || trailingAddon != null) {
    return (
      <div className="flex">
        {leadingAddon}
        <input
          ref={ref}
          disabled={disabled}
          className={clsx(
            'w-full',
            getInputClasses(variant, shape, disabled),
            leadingAddon != null && '-ms-px rounded-s-none',
            trailingAddon != null && 'rounded-e-none',
            className
          )}
          {...props}
        />
        {trailingAddon}
      </div>
    );
  }

  if (hasGridOverlay) {
    return (
      <div className="grid grid-cols-1">
        <input
          ref={ref}
          disabled={disabled}
          className={clsx(
            'col-start-1 row-start-1 w-full',
            leadingIcon != null && 'ps-10',
            trailingIcon != null && 'pe-10',
            getInputClasses(variant, shape, disabled),
            className
          )}
          {...props}
        />
        {leadingIcon != null && (
          <span className="pointer-events-none col-start-1 row-start-1 ms-3 self-center text-text-muted sm:text-sm">
            {leadingIcon}
          </span>
        )}
        {trailingIcon != null && (
          <span className="pointer-events-none col-start-1 row-start-1 me-3 self-center justify-self-end text-text-muted sm:text-sm">
            {trailingIcon}
          </span>
        )}
      </div>
    );
  }

  return (
    <input
      ref={ref}
      disabled={disabled}
      className={clsx('w-full', getInputClasses(variant, shape, disabled), className)}
      {...props}
    />
  );
});
