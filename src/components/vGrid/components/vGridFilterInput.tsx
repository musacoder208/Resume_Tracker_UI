import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type JSX,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { useT } from '@/i18n/useT';
import { FunnelIcon, FilterClearIcon, FilterCheckIcon } from '@/icons/svg';
import { DateTimePicker } from '@/components/ui/dateTimePicker/DateTimePicker';
import { vGridTheme } from '../theme/vGridTheme';
import type { VGridFilterType, VGridFilterOperator } from '../types/vGrid.types';
import clsx from 'clsx';

interface Props {
  field: string;
  filterType: VGridFilterType;
  value: string;
  matchMode: VGridFilterOperator;
  disabled?: boolean;
  onChange: (value: string) => void;
  onOperatorChange: (matchMode: VGridFilterOperator) => void;
  onClear: () => void;
}

const TEXT_OPERATORS: { label: string; value: VGridFilterOperator }[] = [
  { label: 'grid.filter.contains', value: 'contains' },
  { label: 'grid.filter.notContains', value: 'notContains' },
  { label: 'grid.filter.startsWith', value: 'startsWith' },
  { label: 'grid.filter.endsWith', value: 'endsWith' },
  { label: 'grid.filter.equals', value: 'equals' },
  { label: 'grid.filter.notEquals', value: 'notEquals' },
];

const NUMBER_OPERATORS: { label: string; value: VGridFilterOperator }[] = [
  { label: 'grid.filter.equals', value: 'equals' },
  { label: 'grid.filter.notEquals', value: 'notEquals' },
  { label: 'grid.filter.lessThan', value: 'lt' },
  { label: 'grid.filter.lessThanOrEqual', value: 'lte' },
  { label: 'grid.filter.greaterThan', value: 'gt' },
  { label: 'grid.filter.greaterThanOrEqual', value: 'gte' },
];

const DATE_OPERATORS: { label: string; value: VGridFilterOperator }[] = [
  { label: 'grid.filter.dateIs', value: 'dateIs' },
  { label: 'grid.filter.dateIsNot', value: 'dateIsNot' },
  { label: 'grid.filter.dateIsBefore', value: 'dateBefore' },
  { label: 'grid.filter.dateIsAfter', value: 'dateAfter' },
];

function getOperators(filterType: VGridFilterType): { label: string; value: VGridFilterOperator }[] {
  if (filterType === 'number') return NUMBER_OPERATORS;
  if (filterType === 'date') return DATE_OPERATORS;
  return TEXT_OPERATORS;
}

export function VGridFilterInput({
  filterType,
  value,
  matchMode,
  disabled = false,
  onChange,
  onOperatorChange,
  onClear,
}: Props): JSX.Element {
  const { t } = useT('common');
  const operators = getOperators(filterType);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasValue = value.trim() !== '';

  const getPlaceholder = (): string => {
    const op = operators.find((o) => o.value === matchMode);
    if (op != null) return `${t(op.label)}...`;
    return t('grid.filter.placeholder');
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Escape') setDropdownOpen(false);
    if (filterType === 'number') {
      const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', '.', '-'];
      if (!allowed.includes(e.key) && !/^[0-9]$/.test(e.key)) {
        e.preventDefault();
      }
    }
  };

  const handleOperatorSelect = (op: VGridFilterOperator): void => {
    if (op === 'noFilter') {
      onClear();
    } else {
      onOperatorChange(op);
    }
    setDropdownOpen(false);
  };

  const openDropdown = useCallback((): void => {
    if (btnRef.current == null) return;
    const rect = btnRef.current.getBoundingClientRect();
    let left = rect.left;
    let top = rect.bottom + 4;
    if (left + 200 > window.innerWidth - 8) left = window.innerWidth - 208;
    if (top + 220 > window.innerHeight - 8) top = rect.top - 220;
    setDropdownPos({ top, left });
    setDropdownOpen(true);
  }, []);

  // Close on click-outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent): void => {
      if (btnRef.current?.contains(e.target as Node) === true) return;
      if (dropdownRef.current?.contains(e.target as Node) === true) return;
      setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  return (
    <div className="flex items-center">
      {/* Date picker */}
      {filterType === 'date' ? (
        <div className="flex-1 min-w-0">
          <DateTimePicker
            mode="date"
            size="small"
            value={value !== '' ? new Date(value) : undefined}
            onChange={(date) => {
              if (date != null) {
                onChange(date.toISOString().split('T')[0]);
              } else {
                onChange('');
              }
            }}
            placeholder={getPlaceholder()}
            disabled={disabled}
            showClearButton={hasValue}
            className="[&>div]:h-[24px] [&>div]:text-[11px] [&>div]:px-1.5 [&>div]:rounded [&>div]:border-border [&_span]:truncate [&_span]:block [&_span]:max-w-full"
          />
        </div>
      ) : (
        /* Text / Number input */
        <div className={vGridTheme.filterWrap}>
          <input
            type="text"
            inputMode={filterType === 'number' ? 'numeric' : undefined}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={getPlaceholder()}
            className={clsx(
              vGridTheme.filterInput,
              hasValue && vGridTheme.filterInputActive,
            )}
          />
          {hasValue && (
            <button
              type="button"
              tabIndex={-1}
              onClick={onClear}
              className={vGridTheme.filterClearBtn}
              title={t('grid.clearFilter')}
            >
              <FilterClearIcon />
            </button>
          )}
        </div>
      )}

      {/* Funnel button */}
      <button
        ref={btnRef}
        type="button"
        onClick={() => (dropdownOpen ? setDropdownOpen(false) : openDropdown())}
        className={clsx(
          vGridTheme.filterTypeBtn,
          (dropdownOpen || hasValue) && vGridTheme.filterTypeBtnActive,
        )}
        title={t('grid.filterType')}
      >
        <FunnelIcon />
      </button>

      {/* Operator dropdown */}
      {dropdownOpen && createPortal(
        <div
          ref={dropdownRef}
          className={vGridTheme.filterDropdown}
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
        >
          <div className={vGridTheme.filterDropdownTitle}>{t('grid.filterType')}</div>
          {operators.map((op) => (
            <div
              key={op.value}
              onClick={() => handleOperatorSelect(op.value)}
              className={clsx(
                vGridTheme.filterDropdownItem,
                op.value === matchMode && vGridTheme.filterDropdownItemActive,
              )}
            >
              <span className="w-3 flex-shrink-0">
                {op.value === matchMode && <FilterCheckIcon />}
              </span>
              {t(op.label)}
            </div>
          ))}
          <div
            onClick={() => handleOperatorSelect('noFilter')}
            className={clsx(vGridTheme.filterDropdownItem, 'border-t border-border-muted mt-1 pt-1.5')}
          >
            <span className="w-3 flex-shrink-0" />
            {t('grid.filter.noFilter')}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
