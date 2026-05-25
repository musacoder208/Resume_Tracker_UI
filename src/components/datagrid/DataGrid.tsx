import { createContext, useContext, useLayoutEffect, useMemo, useRef, useState, type JSX } from 'react';
import type { Table } from '@tanstack/react-table';
import clsx from 'clsx';

import { useTable } from './hooks/useTable';
import type { DataGridProps, DataGridContextValue, GridColumnMeta } from './types/grid.types';
import { DataGridHeader } from './DataGridHeader';
import { DataGridBody } from './DataGridBody';
import { DataGridPagination } from './DataGridPagination';
import { DataGridToolbar } from './DataGridToolbar';
import { rowSelectionColumn, rowExpansionColumn } from './columns/rowSelectionColumns';
import { gridTheme } from './theme/gridTheme';
import { getGridLayoutClasses } from './utils/gridLayout';

const DataGridContext = createContext<DataGridContextValue<unknown> | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useDataGridContext = <TData,>(): DataGridContextValue<TData> => {
  const ctx = useContext(DataGridContext);
  if (ctx == null) throw new Error('useDataGridContext must be used inside <DataGrid />');
  return ctx as DataGridContextValue<TData>;
};

export const DataGrid = <TData,>({
  data,
  columns,
  totalRows,
  state,
  onStateChange,
  loading,
  error,
  rowId,

  enableVirtualization,
  enableRowSelection,
  enableRowExpansion,
  enableColumnFilters,
  enableSorting,
  getSubRows,

  className,
  layout,
  showToolbar = true,
  showTopBar = false,
  onExportExcel,
  onExportPdf,
  renderExpandedRow,
}: DataGridProps<TData>): JSX.Element => {
  const { widthClass } = getGridLayoutClasses(layout);

  const finalColumns = useMemo(() => {
    let cols = [...columns];
    if (enableRowSelection) cols = [rowSelectionColumn<TData>(), ...cols];
    if (enableRowExpansion) cols = [rowExpansionColumn<TData>(), ...cols];
    return cols;
  }, [columns, enableRowSelection, enableRowExpansion]);

  const table = useTable<TData>({
    data,
    columns: finalColumns,
    totalRows,
    state,
    onStateChange,
    rowId,
    enableRowSelection,
    enableRowExpansion,
    getSubRows,
  });

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement | null>(null);

  // Last pinned column ID drives the right-side box-shadow separator
  const lastPinnedColumnId = useMemo(() => {
    let lastId: string | null = null;
    for (const col of finalColumns) {
      if ((col.meta as GridColumnMeta | undefined)?.pin === 'left' && typeof col.id === 'string') {
        lastId = col.id;
      }
    }
    return lastId;
  }, [finalColumns]);

  // Pinned column IDs in order (for DOM measurement)
  const pinnedColumnIds = useMemo(() => {
    const ids: string[] = [];
    for (const col of finalColumns) {
      if ((col.meta as GridColumnMeta | undefined)?.pin === 'left' && typeof col.id === 'string') {
        ids.push(col.id);
      }
    }
    return ids;
  }, [finalColumns]);

  // DOM-measured offsets — computed after render from actual <th> widths
  const [pinnedLeftOffsets, setPinnedLeftOffsets] = useState<Record<string, number>>({});

  // Measure actual rendered widths from the first header row's <th> elements
  // This is the same technique as the HTML demo's setStickyOffsets()
  useLayoutEffect(() => {
    const tableEl = tableRef.current;
    if (tableEl == null || pinnedColumnIds.length === 0) return;

    // Get the first header row (sort row)
    const headerRow = tableEl.querySelector('thead tr');
    if (headerRow == null) return;

    const thElements = headerRow.querySelectorAll('th');
    const offsets: Record<string, number> = {};
    let cumulative = 0;

    // Walk through <th> elements in DOM order — pinned columns come first
    for (let i = 0; i < pinnedColumnIds.length && i < thElements.length; i++) {
      const colId = pinnedColumnIds[i];
      offsets[colId] = cumulative;
      cumulative += thElements[i].offsetWidth;
    }

    setPinnedLeftOffsets(offsets);
  }, [pinnedColumnIds, data, state]);

  const ctxValue: DataGridContextValue<TData> = {
    table: table as unknown as Table<TData>,
    scrollContainerRef,
    enableVirtualization: enableVirtualization ?? false,
    enableRowSelection: enableRowSelection ?? false,
    enableRowExpansion: enableRowExpansion ?? false,
    enableColumnFilters: enableColumnFilters ?? false,
    enableSorting: enableSorting ?? false,
    layout,
    loading,
    lastPinnedColumnId,
    pinnedLeftOffsets,
    renderExpandedRow,
  };

  return (
    <DataGridContext.Provider value={ctxValue as DataGridContextValue<unknown>}>
      <div
        className={clsx(gridTheme.root, className)}
        role="region"
        aria-busy={loading === true ? 'true' : 'false'}
      >
        {showToolbar && (
          <DataGridToolbar loading={loading} error={error} totalRows={totalRows} />
        )}

        {/* Top bar: stats + pagination + export */}
        {showTopBar && (
          <DataGridPagination
            totalRows={totalRows}
            onExportExcel={onExportExcel}
            onExportPdf={onExportPdf}
            showStats
            position="top"
          />
        )}

        {/* Single container handles both axes — sticky columns require one scroll ancestor */}
        <div
          ref={scrollContainerRef}
          className={clsx(
            gridTheme.scrollContainer,
            widthClass,
            layout?.height === 'auto' && '!max-h-none',
          )}
        >
          <table
            ref={tableRef}
            role="grid"
            className={gridTheme.table}
            style={{ minWidth: `max(100%, ${table.getTotalSize()}px)` }}
            aria-rowcount={totalRows}
          >
            <colgroup>
              {table.getVisibleLeafColumns().map((col) => (
                <col key={col.id} style={{ width: col.getSize() }} />
              ))}
            </colgroup>
            <DataGridHeader />
            <DataGridBody />
          </table>
        </div>

        {/* Pagination stays outside both scroll containers */}
        {/* Bottom pagination — always shows */}
        <DataGridPagination
          totalRows={totalRows}
          onExportExcel={!showTopBar ? onExportExcel : undefined}
          onExportPdf={!showTopBar ? onExportPdf : undefined}
          showStats={!showTopBar}
          position="bottom"
        />
      </div>
    </DataGridContext.Provider>
  );
};
