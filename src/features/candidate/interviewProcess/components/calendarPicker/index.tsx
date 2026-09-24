import { useState } from 'react';
import type { JSX } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@/icons';
import { usePopover } from '../../utils/usePopover';

export interface CalendarPickerProps {
  /** "YYYY-MM-DD" or empty string */
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  className?: string;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}
function toISODate(y: number, m: number, d: number): string {
  return `${y}-${pad2(m + 1)}-${pad2(d)}`;
}
function parseISODate(s: string): { y: number; m: number; d: number } | null {
  if (s === '') return null;
  const parts = s.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => isNaN(n))) return null;
  return { y: parts[0], m: parts[1] - 1, d: parts[2] };
}

export function CalendarPicker({
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  hasError = false,
  className,
}: CalendarPickerProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const { pos, triggerRef, panelRef } = usePopover(open, () => { setOpen(false); });

  const parsed = parseISODate(value);
  const today = new Date();
  const [viewY, setViewY] = useState(parsed?.y ?? today.getFullYear());
  const [viewM, setViewM] = useState(parsed?.m ?? today.getMonth());

  const daysInMonth = new Date(viewY, viewM + 1, 0).getDate();
  const startDay = new Date(viewY, viewM, 1).getDay();
  const cells: Array<number | null> = [
    ...Array.from({ length: startDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const label = parsed != null
    ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(
        new Date(parsed.y, parsed.m, parsed.d)
      )
    : placeholder;

  function goToPrevMonth(): void {
    if (viewM === 0) { setViewM(11); setViewY((y) => y - 1); } else { setViewM((m) => m - 1); }
  }
  function goToNextMonth(): void {
    if (viewM === 11) { setViewM(0); setViewY((y) => y + 1); } else { setViewM((m) => m + 1); }
  }

  const panel = open
    ? createPortal(
        <div
          ref={panelRef}
          className="fixed z-[9999] w-64 rounded-lg border border-border bg-surface p-3 shadow-lg"
          style={{ top: pos.top, left: pos.left }}
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={goToPrevMonth}
              className="rounded p-1 text-text-muted hover:bg-surface-muted"
              aria-label="Previous month"
            >
              <ChevronLeftIcon className="h-3.5 w-3.5" />
            </button>
            <span className="text-xs font-bold text-text">
              {new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date(viewY, viewM, 1))}
            </span>
            <button
              type="button"
              onClick={goToNextMonth}
              className="rounded p-1 text-text-muted hover:bg-surface-muted"
              aria-label="Next month"
            >
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-text-subtle">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) =>
              d === null ? (
                <span key={i} />
              ) : (
                <button
                  key={i}
                  type="button"
                  onClick={() => { onChange(toISODate(viewY, viewM, d)); setOpen(false); }}
                  className={clsx(
                    'mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[11px]',
                    parsed != null && parsed.y === viewY && parsed.m === viewM && parsed.d === d
                      ? 'bg-primary font-bold text-white'
                      : today.getFullYear() === viewY && today.getMonth() === viewM && today.getDate() === d
                        ? 'border border-primary font-semibold text-primary'
                        : 'text-text hover:bg-surface-muted'
                  )}
                >
                  {d}
                </button>
              )
            )}
          </div>
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
        <CalendarIcon className="h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
        <span className={clsx('truncate text-xs font-medium', value !== '' ? 'text-text' : 'font-light text-text-muted')}>
          {label}
        </span>
      </button>
      {panel}
    </div>
  );
}
