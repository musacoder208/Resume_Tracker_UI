import { useState } from 'react';
import type { JSX, MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { ChevronDownIcon, XMarkIcon } from '@/icons';
import { Checkbox } from '@/components/ui/checkbox';
import { usePopover } from '../../utils/usePopover';
import type { Interviewer } from '../../types/interviewProcess.types';

export interface InterviewerPickerProps {
  options: Interviewer[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
  emptyOptionsText?: string;
  disabled?: boolean;
  hasError?: boolean;
  className?: string;
}

/**
 * Click-to-open multi-select with real checkboxes (not a checkmark-only combobox).
 * Structurally mirrors `AutocompleteSelect`'s portal + fixed-position + outside-click
 * pattern so it can never be clipped or have its clicks swallowed by a backdrop.
 */
export function InterviewerPicker({
  options,
  selectedIds,
  onChange,
  placeholder = 'Click to select interviewer(s)…',
  emptyOptionsText = 'No interviewers configured yet.',
  disabled = false,
  hasError = false,
  className,
}: InterviewerPickerProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const { pos, triggerRef, panelRef } = usePopover(open, () => { setOpen(false); });

  const selected = options.filter((o) => selectedIds.includes(o.id));

  function toggle(id: number): void {
    onChange(selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id]);
  }

  function removeChip(id: number, e: MouseEvent): void {
    e.stopPropagation();
    onChange(selectedIds.filter((i) => i !== id));
  }

  const panel = open
    ? createPortal(
        <div
          ref={panelRef}
          className="fixed z-[9999] max-h-56 overflow-y-auto rounded-lg border border-border bg-surface p-1.5 shadow-lg"
          style={{ top: pos.top, left: pos.left, width: pos.width }}
        >
          {options.length === 0 ? (
            <p className="px-2.5 py-2 text-xs text-text-muted">{emptyOptionsText}</p>
          ) : (
            options.map((opt) => (
              <label
                key={opt.id}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 hover:bg-surface-muted"
              >
                <Checkbox checked={selectedIds.includes(opt.id)} onChange={() => { toggle(opt.id); }} />
                <span className="text-xs text-text">{opt.name}</span>
              </label>
            ))
          )}
        </div>,
        document.body
      )
    : null;

  return (
    <div className={clsx('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => { setOpen((o) => !o); }}
        className={clsx(
          'flex min-h-[var(--layout-field-height)] w-full flex-wrap items-center gap-1.5 rounded border bg-surface px-2 py-1 text-start shadow-sm transition-colors',
          hasError ? 'border-error' : open ? 'border-primary ring-2 ring-primary/10' : 'border-border',
          disabled && 'cursor-not-allowed bg-surface-disabled'
        )}
      >
        {selected.length === 0 ? (
          <span className="px-0.5 text-xs font-light text-text-muted">{placeholder}</span>
        ) : (
          selected.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1 rounded-full bg-primary-subtle px-2 py-0.5 text-[11px] font-medium text-primary"
            >
              {s.name}
              <XMarkIcon
                className="h-3 w-3 cursor-pointer"
                aria-label={`Remove ${s.name}`}
                onClick={(e) => { removeChip(s.id, e); }}
              />
            </span>
          ))
        )}
        <ChevronDownIcon
          className={clsx('ms-auto h-4 w-4 flex-shrink-0 text-text-muted transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      {panel}
    </div>
  );
}
