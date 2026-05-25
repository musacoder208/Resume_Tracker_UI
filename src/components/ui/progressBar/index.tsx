import type { JSX } from 'react';
import clsx from 'clsx';

export type ProgressBarVariant = 'primary' | 'success' | 'warning' | 'error' | 'neutral';

export interface ProgressBarProps {
  /** 0–100 */
  value: number;
  variant?: ProgressBarVariant;
  /** Show percentage label to the right */
  showLabel?: boolean;
  className?: string;
}

const trackVariant: Record<ProgressBarVariant, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  error:   'bg-error',
  neutral: 'bg-border',
};

export function ProgressBar({
  value,
  variant = 'primary',
  showLabel = false,
  className,
}: ProgressBarProps): JSX.Element {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <div
        className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={clsx('h-full rounded-full transition-all duration-300', trackVariant[variant])}
          style={{ width: `${clamped}%` }}
        />
      </div>

      {showLabel && (
        <span className="w-9 flex-shrink-0 text-end text-xs font-medium text-text-muted">
          {clamped}%
        </span>
      )}
    </div>
  );
}
