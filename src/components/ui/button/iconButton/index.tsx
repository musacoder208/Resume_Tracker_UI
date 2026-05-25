import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, JSX, ReactElement } from 'react';
import clsx from 'clsx';

export type IconButtonVariant = 'primary' | 'secondary' | 'soft' | 'danger' | 'ghost' | 'unstyled';
export type IconButtonSize = 'sm' | 'md';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: ReactElement;
  /** Accessible label — required, replaces visible text */
  ariaLabel: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  /** true = fully rounded (circle), false = rounded-lg square */
  circular?: boolean;
  /** Add a visible border (border-border). Useful in toolbars on coloured backgrounds. */
  bordered?: boolean;
}

const variantClasses: Record<IconButtonVariant, string> = {
  /** Filled primary brand colour */
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
  /** Outlined neutral */
  secondary: 'bg-surface text-text border border-border hover:bg-surface-muted',
  /** Subtle tinted background */
  soft: 'bg-surface-muted text-text hover:bg-surface-hover',
  /** Destructive */
  danger: 'bg-error text-error-foreground hover:bg-error/90',
  /** No background — icon only, used in toolbars */
  ghost: 'text-text-muted hover:bg-surface hover:text-text',
  unstyled: '',
};

const sizeClasses: Record<IconButtonSize, string> = {
  /** 32 × 32 — compact toolbars */
  sm: 'h-8 w-8',
  /** 38 × 38 — standard navbar / action buttons */
  md: 'h-[38px] w-[38px]',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    icon,
    ariaLabel,
    variant = 'ghost',
    size = 'sm',
    circular = false,
    bordered = false,
    className,
    type = 'button',
    ...props
  },
  ref
): JSX.Element {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={ariaLabel}
      className={clsx(
        'inline-flex flex-shrink-0 items-center justify-center transition-colors',
        'focus:outline-none',
        'disabled:pointer-events-none disabled:opacity-50',
        'v-iconButton',
        circular ? 'rounded-full' : 'rounded-md',
        variantClasses[variant],
        sizeClasses[size],
        bordered && 'border border-border',
        className
      )}
      {...props}
    >
      {icon}
    </button>
  );
});
