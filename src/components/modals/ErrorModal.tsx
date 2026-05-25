import { XMarkIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@/icons';
import { Fragment } from 'react';
import type { ErrorModalProps, ErrorModalVariant } from './modal.types';

function prettyJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function VariantIcon({ variant }: { variant: ErrorModalVariant }): React.ReactElement {
  if (variant === 'warning') return <ExclamationTriangleIcon className="h-6 w-6 text-warning" />;
  if (variant === 'info') return <InformationCircleIcon className="h-6 w-6 text-primary" />;
  return <ExclamationTriangleIcon className="h-6 w-6 text-error" />;
}

function VariantBg({ variant }: { variant: ErrorModalVariant }): string {
  if (variant === 'warning') return 'bg-surface-muted';
  if (variant === 'info') return 'bg-surface-muted';
  return 'bg-surface-muted';
}

export function ErrorModal({
  open,
  title,
  message,
  code,
  details,
  variant = 'error',
  onClose,
  primaryActionLabel = 'OK',
  onPrimaryAction,
}: ErrorModalProps): React.ReactElement | null {
  if (!open) return null;

  const showDetails = details !== undefined && details !== null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-lg rounded-xl bg-surface shadow-xl"
      >
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-border px-6 py-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${VariantBg({ variant })}`}>
            <VariantIcon variant={variant} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-text">{title}</h3>
            {code ? (
              <p className="mt-1 text-xs text-text-muted">
                Code: <span className="font-medium text-text-muted">{code}</span>
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-text-muted hover:bg-surface-muted hover:text-primary-hover"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {message ? <p className="text-sm text-text-muted">{message}</p> : null}

          {showDetails ? (
            <Fragment>
              <div className="mt-4 rounded-lg border border-border bg-surface-muted">
                <div className="border-b border-border px-3 py-2 text-xs font-medium text-text-muted">
                  Details
                </div>
                <pre className="max-h-64 overflow-auto px-3 py-2 text-xs text-text-muted">
                  {prettyJson(details)}
                </pre>
              </div>
              <p className="mt-2 text-xs text-text-muted">
                If you need support, share the code and details with the administrator.
              </p>
            </Fragment>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={() => {
              onPrimaryAction?.();
              onClose();
            }}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            {primaryActionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
