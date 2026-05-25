import type { JSX } from 'react';
import { vGridTheme } from '../theme/vGridTheme';
import { VGridSortIndicator } from './vGridSortIndicator';
import { VGridFilterInput } from './vGridFilterInput';
import type { VGridColumn, VGridSortState, VGridFilterState, VGridFilterOperator } from '../types/vGrid.types';
import clsx from 'clsx';

interface Props<TData> {
  columns: VGridColumn<TData>[];
  sort: VGridSortState | null;
  onSortColumn: (field: string) => void;
  filters: Record<string, VGridFilterState>;
  serverFilterValue: Record<string, string>;
  lockFilter: boolean;
  columnFilters: Record<string, string>;
  onFilterChange: (field: string, value: string) => void;
  onFilterOperatorChange: (field: string, matchMode: VGridFilterOperator) => void;
  onFilterClear: (field: string) => void;
  pinnedOffsets: Record<string, number>;
  lastFrozenField: string | null;
  showSelectAll: boolean;
  isAllSelected: boolean;
  onToggleSelectAll: (checked: boolean) => void;
  selectionMode?: 'single' | 'multiple';
  hasExpansion: boolean;
}

export function VGridHeader<TData>({
  columns,
  sort,
  onSortColumn,
  filters,
  serverFilterValue,
  lockFilter,
  columnFilters,
  onFilterChange,
  onFilterOperatorChange,
  onFilterClear,
  pinnedOffsets,
  lastFrozenField,
  showSelectAll,
  isAllSelected,
  onToggleSelectAll,
  selectionMode,
  hasExpansion,
}: Props<TData>): JSX.Element {
  const hasSelection = selectionMode != null;

  return (
    <thead className={vGridTheme.thead}>
      {/* Sort header row */}
      <tr className={vGridTheme.headerRow}>
        {/* Expand column header */}
        {hasExpansion && (
          <th
            className={clsx(vGridTheme.th, vGridTheme.thFrozen)}
            style={{ width: 36, minWidth: 36, insetInlineStart: 0 }}
          />
        )}
        {/* Selection column header */}
        {hasSelection && (
          <th
            className={clsx(vGridTheme.th, vGridTheme.thFrozen)}
            style={{ width: 36, minWidth: 36, insetInlineStart: hasExpansion ? 36 : 0 }}
          />
        )}
        {columns.map((col) => {
          const isFrozen = col.frozen === true;
          const isLastFrozen = col.field === lastFrozenField;

          return (
            <th
              key={col.field}
              className={clsx(
                vGridTheme.th,
                col.sortable && vGridTheme.thSortable,
                isFrozen && vGridTheme.thFrozen,
                isLastFrozen && vGridTheme.lastFrozenBorder,
              )}
              style={{
                ...(col.width != null ? { width: col.width, minWidth: col.width } : {}),
                ...(isFrozen ? { insetInlineStart: pinnedOffsets[col.field] ?? 0 } : {}),
                ...col.headerStyle,
              }}
              onClick={() => col.sortable === true && onSortColumn(col.field)}
            >
              <div className="flex items-center">
                <span className="truncate">{col.header}</span>
                {col.sortable === true && (
                  <VGridSortIndicator sort={sort} field={col.field} />
                )}
              </div>
            </th>
          );
        })}
      </tr>

      {/* Filter row */}
      <tr className={vGridTheme.filterRow}>
        {/* Expand column filter (empty) */}
        {hasExpansion && (
          <th
            className={clsx(vGridTheme.filterCell, vGridTheme.filterCellFrozen)}
            style={{ width: 36, minWidth: 36, insetInlineStart: 0 }}
          />
        )}
        {/* Selection column filter (select all) */}
        {hasSelection && (
          <th
            className={clsx(vGridTheme.filterCell, vGridTheme.filterCellFrozen)}
            style={{ width: 36, minWidth: 36, insetInlineStart: hasExpansion ? 36 : 0 }}
          >
            {showSelectAll && selectionMode === 'multiple' && (
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => onToggleSelectAll(e.target.checked)}
                  className={vGridTheme.checkbox}
                />
              </div>
            )}
          </th>
        )}
        {columns.map((col) => {
          const isFrozen = col.frozen === true;
          const isLastFrozen = col.field === lastFrozenField;
          const filterValue = lockFilter
            ? columnFilters[col.field] ?? ''
            : serverFilterValue[col.field] ?? '';
          const matchMode = filters[col.field]?.matchMode ?? 'contains';

          return (
            <th
              key={`${col.field}-filter`}
              className={clsx(
                vGridTheme.filterCell,
                isFrozen && vGridTheme.filterCellFrozen,
                isLastFrozen && vGridTheme.lastFrozenBorder,
              )}
              style={{
                ...(col.width != null ? { width: col.width, minWidth: col.width } : {}),
                ...(isFrozen ? { insetInlineStart: pinnedOffsets[col.field] ?? 0 } : {}),
              }}
            >
              {col.filter === true && (
                <VGridFilterInput
                  field={col.field}
                  filterType={col.filterType ?? 'text'}
                  value={filterValue}
                  matchMode={matchMode}
                  onChange={(val) => onFilterChange(col.field, val)}
                  onOperatorChange={(mode) => onFilterOperatorChange(col.field, mode)}
                  onClear={() => onFilterClear(col.field)}
                />
              )}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}
