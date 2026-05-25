import {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
  type ChangeEvent,
  type JSX,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import type { Column } from '@tanstack/react-table';
import { FILTER_OPERATORS } from '../utils/filterOperators';
import type {
  GridFilterType,
  GridColumnFilterValue,
  GridFilterOperator,
} from '../types/grid.filters';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useT } from '@/i18n/useT';
import { gridTheme } from '../theme/gridTheme';
import { FunnelIcon, FilterClearIcon, FilterCheckIcon } from '@/icons/svg';
import { DateTimePicker } from '@/components/ui/dateTimePicker/DateTimePicker';
import clsx from 'clsx';

interface Props<TData> {
  column: Column<TData, unknown>;
}

const getFilterTypeFromMeta = (meta: unknown): GridFilterType => {
  if (typeof meta === 'object' && meta !== null && 'filterType' in meta) {
    const v = (meta as { filterType?: unknown }).filterType;
    if (v === 'text' || v === 'number' || v === 'date') return v;
  }
  return 'text';
};

const defaultOperatorByType: Record<GridFilterType, GridFilterOperator> = {
  text: 'contains',
  number: 'equals',
  date: 'is',
};

export const GridAdvancedColumnFilter = <TData,>({ column }: Props<TData>): JSX.Element => {
  const { t } = useT('common');
  const filterType = getFilterTypeFromMeta(column.columnDef.meta);
  const operators = FILTER_OPERATORS[filterType];

  const raw = column.getFilterValue() as GridColumnFilterValue | undefined;

  const [operator, setOperator] = useState<GridFilterOperator>(
    raw?.operator ?? defaultOperatorByType[filterType]
  );

  const [inputValue, setInputValue] = useState<string>(() => {
    const v = raw?.value;
    return v === undefined || v === null ? '' : String(v);
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedText = useDebouncedValue(inputValue, 400);
  const effectiveText = filterType === 'text' ? debouncedText : inputValue;

  const nextFilterValue = useMemo<GridColumnFilterValue | undefined>(() => {
    if (operator === 'none') return undefined;
    const trimmed = effectiveText.trim();
    if (trimmed === '') return undefined;
    return { operator, value: trimmed };
  }, [operator, effectiveText]);

  useEffect(() => {
    const current = column.getFilterValue() as GridColumnFilterValue | undefined;
    if (JSON.stringify(current) !== JSON.stringify(nextFilterValue)) {
      column.setFilterValue(nextFilterValue);
    }
  }, [column, nextFilterValue]);

  const handleOperatorChange = useCallback((newOp: GridFilterOperator): void => {
    if (newOp === 'none') {
      // Reset everything back to default
      setInputValue('');
      setOperator(defaultOperatorByType[filterType]);
    } else {
      setOperator(newOp);
    }
    setDropdownOpen(false);
  }, [filterType]);

  const handleClear = useCallback((): void => {
    setInputValue('');
    setOperator(defaultOperatorByType[filterType]);
  }, [filterType]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setInputValue(e.target.value);
  };

  const getPlaceholder = (): string => {
    if (operator === 'none') return t('grid.filterNoFilter');
    if (filterType === 'date') return '';
    // Show the selected operator's label as placeholder
    const currentOp = operators.find((op) => op.value === operator);
    if (currentOp != null) return `${t(currentOp.label)}...`;
    return t('grid.filter.placeholder');
  };

  /* Open dropdown — handle viewport overflow */
  const openDropdown = useCallback((): void => {
    if (btnRef.current == null) return;
    const rect = btnRef.current.getBoundingClientRect();
    let left = rect.left;
    let top = rect.bottom + 4;

    if (left + 210 > window.innerWidth - 8) {
      left = window.innerWidth - 218;
    }
    if (top + 250 > window.innerHeight - 8) {
      top = rect.top - 250;
    }

    setDropdownPos({ top, left });
    setDropdownOpen(true);
  }, []);

  const toggleDropdown = useCallback((): void => {
    if (dropdownOpen) {
      setDropdownOpen(false);
    } else {
      openDropdown();
    }
  }, [dropdownOpen, openDropdown]);

  /* Close on click-outside */
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

  const handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') setDropdownOpen(false);
  };

  const hasValue = inputValue.trim() !== '';
  const isActive = hasValue && operator !== 'none';
  const isOperatorNonDefault = operator !== defaultOperatorByType[filterType];

  return (
    <div className="flex items-center">
      {/* Date filter uses DateTimePicker component */}
      {filterType === 'date' ? (
        <div className="flex-1 min-w-0">
          <DateTimePicker
            mode="date"
            size="small"
            value={inputValue !== '' ? new Date(inputValue) : undefined}
            onChange={(date) => {
              if (date != null) {
                const iso = date.toISOString().split('T')[0];
                setInputValue(iso);
              } else {
                setInputValue('');
              }
            }}
            placeholder={getPlaceholder()}
            disabled={operator === 'none'}
            showClearButton={hasValue}
            className="[&>div]:h-[26px] [&>div]:text-[11px] [&>div]:px-1.5 [&>div]:rounded [&>div]:border-border [&_span]:truncate [&_span]:block [&_span]:max-w-full"
          />
        </div>
      ) : (
        /* Text/Number filter with inline clear button */
        <div className={clsx(gridTheme.filterInputWrap, hasValue && 'has-val')}>
          <input
            type="text"
            inputMode={filterType === 'number' ? 'numeric' : undefined}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={operator === 'none'}
            placeholder={getPlaceholder()}
            className={clsx(
              gridTheme.filterInput,
              isActive && gridTheme.filterInputActive,
            )}
          />
          {hasValue && (
            <button
              type="button"
              tabIndex={-1}
              onClick={handleClear}
              className={gridTheme.filterClearBtn}
              title={t('grid.clearFilter')}
            >
              <FilterClearIcon />
            </button>
          )}
        </div>
      )}

      {/* Funnel / operator button */}
      <button
        ref={btnRef}
        type="button"
        onClick={toggleDropdown}
        className={clsx(
          gridTheme.filterTypeBtn,
          (dropdownOpen || isOperatorNonDefault || isActive) && gridTheme.filterTypeBtnActive,
        )}
        title={t('grid.filterType')}
      >
        <FunnelIcon />
      </button>

      {/* Operator dropdown — portal to body */}
      {dropdownOpen && createPortal(
        <div
          ref={dropdownRef}
          className={gridTheme.filterDropdown}
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
          onKeyDown={handleKeyDown}
        >
          <div className={gridTheme.filterDropdownTitle}>{t('grid.filterType')}</div>
          {operators.map((op) => (
            <div
              key={op.value}
              role="option"
              aria-selected={op.value === operator}
              onClick={() => handleOperatorChange(op.value)}
              className={clsx(
                gridTheme.filterDropdownItem,
                op.value === operator && gridTheme.filterDropdownItemActive,
              )}
            >
              <span className="w-3 flex-shrink-0">
                {op.value === operator && <FilterCheckIcon />}
              </span>
              {t(op.label)}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};
