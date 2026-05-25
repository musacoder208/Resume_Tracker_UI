/**
 * CascadeSelect
 *
 * PrimeReact-style cascading select/menu.
 * Items with `children` open a side panel on hover.
 * Items without children are leaf actions — they call item.onClick().
 *
 * Two modes:
 *  1. Standalone  — trigger button + floating panel (form-select UX)
 *  2. panelOnly   — just the cascading panel (embed inside your own dropdown)
 *
 * subPanelSide:
 *  'start' — child panels open to the RIGHT in LTR (default, standard cascade)
 *  'end'   — child panels open to the LEFT  in LTR (use at the right viewport edge)
 *
 * Hover stability:
 *  Crossing from a panel to its absolute-positioned child triggers onMouseLeave on
 *  the parent panel. We use a 150 ms delay before hiding + an onFocus prop so the
 *  child panel cancels the parent's timer the moment it is entered.
 */

import type { JSX } from 'react';
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import type { CascadeSelectItem } from './cascadeSelect.types';
import { ChevronDownIcon, ChevronRightIcon, CheckIcon } from '@/icons';

// ─── Internal recursive panel ─────────────────────────────────────────────────

type CascadePanelProps = {
  items: CascadeSelectItem[];
  subPanelSide: 'start' | 'end';
  onLeafClick: (item: CascadeSelectItem) => void;
  /**
   * Called by a child panel when the mouse enters it.
   * Used by the parent to cancel its pending hide timer, keeping the sub-panel
   * visible during the brief gap between the parent panel's edge and the child panel.
   */
  onEnter?: () => void;
};

function CascadePanel({
  items,
  subPanelSide,
  onLeafClick,
  onEnter,
}: CascadePanelProps): JSX.Element {
  const [activeId, setActiveId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelHide = (): void => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const scheduleHide = (): void => {
    timerRef.current = setTimeout(() => setActiveId(null), 150);
  };

  // Clean up on unmount
  useEffect(() => () => cancelHide(), []);

  return (
    <div
      className="min-w-[11rem] rounded-md border border-border bg-surface py-1 shadow-lg"
      onMouseEnter={() => {
        cancelHide();
        onEnter?.(); // cancel the PARENT panel's pending hide
      }}
      onMouseLeave={scheduleHide}
    >
      {items.map((item) => {
        const hasChildren = Boolean(item.children?.length);
        const isActive = activeId === item.id;

        return (
          <div
            key={item.id}
            className="relative"
            onMouseEnter={() => {
              cancelHide();
              setActiveId(hasChildren ? item.id : null);
            }}
          >
            {/* Row */}
            <button
              type="button"
              onClick={() => {
                if (hasChildren) {
                  // Touch/click support: open sub-panel (no toggle — hover closes it on desktop)
                  setActiveId(item.id);
                } else {
                  item.onClick?.();
                  onLeafClick(item);
                }
              }}
              className={clsx(
                'flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                item.variant === 'danger'
                  ? 'text-error hover:bg-error/5'
                  : 'text-text hover:bg-surface-muted',
                isActive && (item.variant === 'danger' ? 'bg-error/5' : 'bg-surface-muted')
              )}
            >
              {/* Leading color dot — inline style intentional (data-driven hex) */}
              {item.dot != null && (
                <span
                  className="h-3 w-3 flex-shrink-0 rounded-full ring-1 ring-border"
                  style={{ backgroundColor: item.dot }}
                  aria-hidden="true"
                />
              )}

              {/* Icon */}
              {item.icon != null && (
                <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
                  {item.icon}
                </span>
              )}

              {/* Label */}
              <span className="flex-1 text-start">{item.label}</span>

              {/* Active checkmark */}
              {item.active === true && (
                <CheckIcon className="h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
              )}

              {/* Drill arrow */}
              {hasChildren && (
                <ChevronRightIcon
                  className="h-4 w-4 flex-shrink-0 text-text-muted"
                  aria-hidden="true"
                />
              )}
            </button>

            {/* Sub-panel
                 Mobile  (<md): stacked below the item in normal flow (accordion style)
                 Desktop (md+): absolutely positioned to the side                          */}
            {isActive && hasChildren && (
              <div
                className={clsx(
                  // Mobile — in-flow, indented
                  'relative ps-3',
                  // Desktop — floating side panel
                  'md:absolute md:top-0 md:z-10 md:ps-0',
                  subPanelSide === 'start' ? 'md:start-full' : 'md:end-full'
                )}
              >
                <CascadePanel
                  items={item.children!}
                  subPanelSide={subPanelSide}
                  onLeafClick={onLeafClick}
                  onEnter={cancelHide}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

type Props = {
  items: CascadeSelectItem[];
  /** Which side sub-panels expand toward. Default 'start' (right in LTR). */
  subPanelSide?: 'start' | 'end';
  /** Render only the panel, no trigger. Use when embedding in another dropdown. */
  panelOnly?: boolean;
  /** Trigger placeholder text (standalone mode only) */
  placeholder?: string;
  /** Called when a leaf item is clicked (standalone mode) */
  onChange?: (item: CascadeSelectItem) => void;
  className?: string;
};

export function CascadeSelect({
  items,
  subPanelSide = 'start',
  panelOnly = false,
  placeholder = 'Select…',
  onChange,
  className,
}: Props): JSX.Element {
  const [open, setOpen] = useState(false);
  const [selectedLabel, setSelected] = useState<string | null>(null);

  const handleLeafClick = (item: CascadeSelectItem): void => {
    onChange?.(item);
    setSelected(item.label);
    setOpen(false);
  };

  if (panelOnly) {
    return <CascadePanel items={items} subPanelSide={subPanelSide} onLeafClick={handleLeafClick} />;
  }

  return (
    <div className={clsx('relative inline-block w-full v-cascadeSelect', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-full items-center justify-between rounded border border-border bg-surface px-3.5 text-sm transition-colors hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
      >
        <span className={clsx(selectedLabel ? 'text-text' : 'text-text-muted')}>
          {selectedLabel ?? placeholder}
        </span>
        <ChevronDownIcon
          className={clsx(
            'h-4 w-4 flex-shrink-0 text-text-muted transition-transform',
            open && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="absolute start-0 top-full z-50 mt-1">
          <CascadePanel items={items} subPanelSide={subPanelSide} onLeafClick={handleLeafClick} />
        </div>
      )}
    </div>
  );
}

export type { CascadeSelectItem, CascadeSelectVariant } from './cascadeSelect.types';
