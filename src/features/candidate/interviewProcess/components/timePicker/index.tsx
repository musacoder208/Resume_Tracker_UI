import { useState } from 'react';
import type { JSX } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { ClockIcon } from '@/icons';
import { usePopover } from '../../utils/usePopover';
import { TIME_OPTIONS, formatTimeLabel } from '../../utils/dateTime';

export interface TimePickerProps {
  /** "HH:mm" or empty string */
  value: string;
  onChange: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  className?: string;
}

export function TimePicker({
  value,
  onChange,
  placeholder = 'Select time',
  disabled = false,
  hasError = false,
  className,
}: TimePickerProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const { pos, triggerRef, panelRef } = usePopover(open, () => { setOpen(false); });

  const panel = open
    ? createPortal(
        <div
          ref={panelRef}
          className="fixed z-[9999] max-h-56 w-36 overflow-y-auto rounded-lg border border-border bg-surface p-1.5 shadow-lg"
          style={{ top: pos.top, left: pos.left }}
        >
          {TIME_OPTIONS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { onChange(t); setOpen(false); }}
              className={clsx(
                'w-full rounded-md px-2.5 py-1.5 text-start text-xs hover:bg-surface-muted',
                t === value && 'bg-primary-subtle font-semibold text-primary'
              )}
            >
              {formatTimeLabel(t)}
            </button>
          ))}
        </div>,
        document.body
      )
    : null;

  return (
    <div className={clsx('relative flex-1', className)}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => { setOpen((o) => !o); }}
        className={clsx(
          'flex h-[var(--layout-field-height)] w-full items-center gap-1.5 rounded border bg-surface px-2.5 text-start shadow-sm transition-colors',
          hasError ? 'border-error' : open ? 'border-primary ring-2 ring-primary/10' : 'border-border',
          disabled && 'cursor-not-allowed bg-surface-disabled'
        )}
      >
        <ClockIcon className="h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
        <span className={clsx('truncate text-xs font-medium', value !== '' ? 'text-text' : 'font-light text-text-muted')}>
          {value !== '' ? formatTimeLabel(value) : placeholder}
        </span>
      </button>
      {panel}
    </div>
  );
}
