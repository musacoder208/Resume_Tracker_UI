import type { JSX, ReactNode } from 'react';
import { useState } from 'react';
import clsx from 'clsx';
import { XMarkIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@/icons';

export type AlertVariant = 'info' | 'warning';

const variantStyles: Record<AlertVariant, { container: string; text: string; icon: string }> = {
  info: {
    container: 'border-info-border bg-info-subtle',
    text: 'text-info',
    icon: 'text-info',
  },
  warning: {
    container: 'border-warning bg-warning-subtle',
    text: 'text-warning-text',
    icon: 'text-warning-text',
  },
};

export interface AlertBannerProps {
  title?: string;
  description?: string;
  children?: ReactNode;
  variant?: AlertVariant;
  className?: string;
  /** Show close/dismiss button. Default true. */
  dismissible?: boolean;
}

export function AlertBanner({
  title,
  description,
  children,
  variant = 'info',
  className,
  dismissible = true,
}: AlertBannerProps): JSX.Element | null {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const styles = variantStyles[variant];
  const Icon = variant === 'warning' ? ExclamationTriangleIcon : InformationCircleIcon;

  return (
    <div
      role="alert"
      className={clsx(
        'flex items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5',
        styles.container,
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        <Icon className={clsx('h-5 w-5 flex-shrink-0', styles.icon)} aria-hidden="true" />
        {children != null ? (
          <span className={clsx('text-[13px] font-normal', styles.text)}>{children}</span>
        ) : (
          <div>
            <p className={clsx('text-xs font-semibold tracking-wide', styles.text)}>{title}</p>
            <p className={clsx('text-xs font-semibold', styles.text)}>{description}</p>
          </div>
        )}
      </div>

      {dismissible && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => setDismissed(true)}
          className={clsx('flex-shrink-0 rounded p-1 transition-colors', styles.text, 'hover:opacity-70')}
        >
          <XMarkIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
