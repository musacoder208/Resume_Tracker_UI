import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'soft' | 'danger' | 'outline' | 'unstyled';
export type ButtonSize = 'xs' | 'sm' | 'md';

export const buttonBase =
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50';

export const variantClasses: Record<ButtonVariant, string> = {
  primary: '[background:linear-gradient(135deg,var(--accent),var(--accent2))] text-white border border-[var(--accent)] hover:opacity-90 focus:ring-2 focus:ring-[var(--accent)]',
  secondary: 'bg-surface text-text border border-border hover:bg-surface-muted focus:ring-2 focus:ring-primary',
  danger: 'bg-error text-white border border-error hover:bg-error/90 hover:border-error/90 focus:ring-2 focus:ring-error',
  soft: 'bg-surface-muted text-text border border-surface-muted hover:bg-surface hover:border-surface focus:ring-2 focus:ring-primary',
  outline: 'bg-transparent text-text border border-border hover:bg-surface-muted focus:ring-2 focus:ring-primary',
  unstyled: '',
};

export const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-xs rounded-md',
  sm: 'px-2.5 py-1.5 text-sm rounded-md',
  md: 'px-3 py-2 text-sm rounded-md',
};

export function getButtonClasses(
  variant: ButtonVariant,
  size: ButtonSize,
  circular: boolean
): string {
  return clsx(
    buttonBase,
    variantClasses[variant],
    sizeClasses[size],
    circular && 'rounded-full p-1'
  );
}
