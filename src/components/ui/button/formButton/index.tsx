import type { ButtonHTMLAttributes, JSX, ReactNode } from 'react';
import clsx from 'clsx';

import { getButtonClasses } from '../buttonStyles';

export interface FormButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'soft' | 'danger' | 'outline';
  size?: 'xs' | 'sm' | 'md';
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  circular?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
}

export function FormButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  leadingIcon,
  trailingIcon,
  circular = false,
  className,
  children,
  type = 'submit',
  ...props
}: FormButtonProps): JSX.Element {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={clsx(getButtonClasses(variant, size, false), className)}
      {...props}
    >
      {loading ? (
        'Please wait…'
      ) : (
        <>
          {leadingIcon}
          {!circular && children}
          {trailingIcon}
        </>
      )}
    </button>
  );
}
