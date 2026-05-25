import type { JSX } from 'react';
import clsx from 'clsx';

export type StatusBadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export interface StatusBadgeProps {
  label: string;
  variant?: StatusBadgeVariant;
  /** Show a leading dot indicator */
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<StatusBadgeVariant, { badge: string; dot: string }> = {
  success: { badge: 'bg-success-subtle text-success',   dot: 'bg-success' },
  warning: { badge: 'bg-warning-subtle text-warning',   dot: 'bg-warning' },
  error:   { badge: 'bg-error-subtle   text-error',     dot: 'bg-error' },
  info:    { badge: 'bg-primary-subtle text-primary',   dot: 'bg-primary' },
  neutral: { badge: 'bg-surface-muted  text-text-muted', dot: 'bg-text-muted' },
};

export function StatusBadge({
  label,
  variant = 'neutral',
  dot = true,
  className,
}: StatusBadgeProps): JSX.Element {
  const { badge, dot: dotClass } = variantClasses[variant];

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        badge,
        className,
      )}
    >
      {dot && (
        <span className={clsx('h-1.5 w-1.5 flex-shrink-0 rounded-full', dotClass)} aria-hidden="true" />
      )}
      {label}
    </span>
  );
}
