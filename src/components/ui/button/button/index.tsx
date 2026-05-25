import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, JSX, ReactNode } from 'react';
import clsx from 'clsx';

import { getButtonClasses } from '../buttonStyles';

export interface UIButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'soft' | 'danger' | 'outline' | 'unstyled';
  size?: 'xs' | 'sm' | 'md';
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  circular?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, UIButtonProps>(function UIButton(
  {
    variant = 'primary',
    size = 'md',
    leadingIcon,
    trailingIcon,
    circular = false,
    fullWidth = false,
    className,
    children,
    type = 'button',
    ...props
  },
  ref
): JSX.Element {
  return (
    <button
      ref={ref}
      type={type}
      className={clsx(
        getButtonClasses(variant, size, circular),
        'gap-x-1.5',
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {leadingIcon}
      {!circular && children}
      {trailingIcon}
    </button>
  );
});
