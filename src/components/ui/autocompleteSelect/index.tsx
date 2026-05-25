/**
 * AutocompleteSelect
 *
 * Trigger: read-only button with selected label + chevron arrow.
 * Dropdown: portaled to body (never clipped by scroll containers).
 * Search input at top + filtered option list.
 * Keyboard: ArrowDown/ArrowUp to navigate, Enter to select, Escape to close.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { JSX } from 'react';
import clsx from 'clsx';
import { ChevronDownIcon, CheckIcon, MagnifyingGlassIcon, XMarkIcon } from '@/icons';

export interface AutocompleteOption {
  value: string;
  label: string;
}

export interface AutocompleteSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly AutocompleteOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsText?: string;
  disabled?: boolean;
  hasError?: boolean;
  className?: string;
}

export function AutocompleteSelect({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  noResultsText = 'No results found',
  disabled = false,
  hasError = false,
  className,
}: AutocompleteSelectProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const [openUp, setOpenUp] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value) ?? null;

  const filtered =
    query === ''
      ? options
      : options.filter((o) =>
          o.label.toLowerCase().includes(query.toLowerCase()),
        );

  const DROPDOWN_MAX_HEIGHT = 220;

  const updatePosition = useCallback((): void => {
    if (triggerRef.current == null) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const gap = 4;

    const shouldOpenUp = spaceBelow < DROPDOWN_MAX_HEIGHT && spaceAbove > spaceBelow;
    setOpenUp(shouldOpenUp);

    if (shouldOpenUp) {
      const dropdownHeight = dropdownRef.current?.offsetHeight ?? DROPDOWN_MAX_HEIGHT;
      setDropdownPos({
        top: rect.top + window.scrollY - dropdownHeight - gap,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    } else {
      setDropdownPos({
        top: rect.bottom + window.scrollY + gap,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, []);

  // Focus + reposition after render
  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      updatePosition();
      searchRef.current?.focus();
    });
  }, [open, updatePosition]);

  // Scroll active item into view
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const list = listRef.current;
    if (list == null) return;
    const item = list.children[activeIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  // Reposition on scroll/resize while open
  useEffect(() => {
    if (!open) return;
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, updatePosition]);

  const closeDropdown = useCallback((): void => {
    setOpen(false);
    setQuery('');
    setActiveIndex(-1);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent): void => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) === true ||
        dropdownRef.current?.contains(target) === true
      ) {
        return;
      }
      closeDropdown();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, closeDropdown]);

  const handleClear = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onChange('');
    closeDropdown();
    triggerRef.current?.focus();
  };

  const handleSelect = (opt: AutocompleteOption): void => {
    onChange(opt.value);
    closeDropdown();
    triggerRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? 0 : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filtered.length) {
        handleSelect(filtered[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeDropdown();
      triggerRef.current?.focus();
    }
  };

  const dropdown = open
    ? createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[9999] rounded-lg border border-border bg-surface shadow-lg"
          style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width }}
        >
          {/* Search */}
          <div className="border-b border-border-muted px-2.5 py-2">
            <div className="flex items-center gap-2 rounded border border-border bg-surface px-2 py-1.5">
              <MagnifyingGlassIcon className="h-3.5 w-3.5 flex-shrink-0 text-text-muted" aria-hidden="true" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-xs text-text placeholder:text-text-muted focus:outline-none"
              />
            </div>
          </div>

          {/* Options */}
          <div ref={listRef} className="max-h-40 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-xs text-text-muted">{noResultsText}</div>
            ) : (
              filtered.map((opt, idx) => {
                const isSelected = opt.value === value;
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={clsx(
                      'flex w-full items-center justify-between px-3 py-2 text-start text-xs text-text transition-colors hover:bg-primary-subtle',
                      isSelected && 'bg-primary-subtle font-medium',
                      isActive && !isSelected && 'bg-surface-hover',
                    )}
                  >
                    {opt.label}
                    {isSelected && <CheckIcon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />}
                  </button>
                );
              })
            )}
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <div className={clsx('relative h-[var(--layout-field-height)]', className)}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (open) {
            closeDropdown();
          } else {
            updatePosition();
            setOpen(true);
          }
        }}
        className={clsx(
          'flex h-full w-full items-center gap-1.5 rounded border bg-surface px-[4px] text-xs shadow-sm transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary/10',
          hasError
            ? 'border-error focus:border-error'
            : open
              ? 'border-primary ring-2 ring-primary/10'
              : 'border-border focus:border-primary',
          disabled && 'cursor-not-allowed bg-surface-disabled !text-text-disabled',
        )}
      >
        <span className={clsx('min-w-0 flex-1 truncate text-start', selected != null ? 'text-text' : 'font-light text-text-muted')}>
          {selected?.label ?? placeholder}
        </span>
        {selected != null && !disabled && (
          <XMarkIcon
            className="h-3.5 w-3.5 flex-shrink-0 cursor-pointer text-text-muted transition-colors hover:text-text"
            aria-hidden="true"
            onClick={handleClear}
          />
        )}
        <ChevronDownIcon
          className={clsx(
            'h-4 w-4 flex-shrink-0 text-text-muted transition-transform',
            open && (openUp ? 'rotate-0' : 'rotate-180'),
          )}
          aria-hidden="true"
        />
      </button>

      {dropdown}
    </div>
  );
}
