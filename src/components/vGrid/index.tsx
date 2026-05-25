import { useCallback, useMemo, useRef, useState, type JSX } from 'react';
import clsx from 'clsx';
import type { VGridProps, VGridSortState, VGridFilterOperator } from './types/vGrid.types';
import { vGridTheme } from './theme/vGridTheme';
import { VGridHeader } from './components/vGridHeader';
import { VGridBody } from './components/vGridBody';
import { VGridFooter } from './components/vGridFooter';
import { useVGridScroll } from './hooks/useVGridScroll';
import { useVGridStickyOffsets } from './hooks/useVGridStickyOffsets';
import { useVGridSelection } from './hooks/useVGridSelection';
import { applyClientFilters } from './utils/vGrid.filters';
import { applyClientSort } from './utils/vGrid.sort';

const DEFAULT_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE_OPTIONS = [20, 50, 100, 200];

export function VGrid<TData>({
  data,
  columns,
  rowKey,
  totalRecords,
  serverFetch,
  pageSize = DEFAULT_PAGE_SIZE,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageSizeChange,
  onSort,
  filters = {},
  onFilter,
  clientFilter = false,
  selection = [],
  onSelectionChange,
  showSelectAll = false,
  isDataSelectable,
  selectionMode,
  renderExpandedRow,
  bordered = true,
  onExportExcel,
  onExportPdf,
  emptyMessage,
  rowHeight = 28,
  loading = false,
  className,
}: VGridProps<TData>): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement | null>(null);

  const [sort, setSort] = useState<VGridSortState | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [serverFilterValue, setServerFilterValue] = useState<Record<string, string>>({});
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const rowHeightPx = rowHeight;

  // ─── Unique data ───────────────────────────────────────────────────────────
  const uniqueData = useMemo(() => {
    const seen = new Set<unknown>();
    return data.filter((item) => {
      const key = (item as Record<string, unknown>)[rowKey];
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [data, rowKey]);

  // ─── Processed data (client mode: filter+sort, server mode: pass-through) ─
  const processedData = useMemo(() => {
    if (!clientFilter) return uniqueData;
    let result = applyClientFilters(uniqueData, columns, columnFilters);
    result = applyClientSort(result, sort, columns);
    return result;
  }, [uniqueData, clientFilter, columnFilters, sort, columns]);

  // ─── Virtualization ────────────────────────────────────────────────────────
  const virtualizationEnabled = renderExpandedRow == null || expandedRows.size === 0;

  // ─── Scroll + virtual window ───────────────────────────────────────────────
  // In client mode: serverFetch is undefined, so no API calls happen
  const { win, padTop, padBottom, serverFetchLoading, handleScroll, resetScroll } = useVGridScroll<TData>({
    containerRef,
    processedDataLength: processedData.length,
    rowHeightPx,
    virtualizationEnabled,
    totalRecords: clientFilter ? processedData.length : totalRecords,
    dataLength: clientFilter ? processedData.length : data.length,
    pageSize,
    sort,
    filters,
    lockFilter: clientFilter,
    serverFetch: clientFilter ? undefined : serverFetch,
  });

  const windowRows = useMemo(() => {
    if (!virtualizationEnabled) return processedData;
    return processedData.slice(win.start, win.end);
  }, [processedData, win, virtualizationEnabled]);

  // ─── Sticky offsets ────────────────────────────────────────────────────────
  const hasExpansion = renderExpandedRow != null;
  const hasSelection = selectionMode != null;

  const { pinnedOffsets, lastFrozenField } = useVGridStickyOffsets({
    tableRef,
    columns,
    data,
    hasSelectionColumn: hasSelection,
    hasExpansionColumn: hasExpansion,
  });

  // ─── Selection (operates on processedData so select-all = all filtered) ────
  const { isRowSelected, toggleRow, toggleSelectAll, isAllSelected } = useVGridSelection({
    data: processedData,
    rowKey,
    selection,
    selectionMode: selectionMode ?? 'multiple',
    isDataSelectable,
    onSelectionChange: onSelectionChange ?? (() => {}),
  });

  // ─── Sort handler ──────────────────────────────────────────────────────────
  const onSortColumn = useCallback((field: string): void => {
    setSort((prev) => (prev?.field === field ? { field, asc: !prev.asc } : { field, asc: true }));

    // Server mode: notify parent to re-fetch sorted data
    if (!clientFilter && onSort != null) {
      const newSort = sort?.field === field ? { field, asc: !sort.asc } : { field, asc: true };
      onSort({
        rows: pageSize,
        filters,
        sortField: newSort.field,
        sortOrder: newSort.asc ? 1 : -1,
      });
    }
  }, [sort, clientFilter, onSort, pageSize, filters]);

  // ─── Filter handlers ───────────────────────────────────────────────────────
  const onFilterChange = useCallback((field: string, value: string): void => {
    if (clientFilter) {
      // Client mode: update local filter state
      setColumnFilters((prev) => ({ ...prev, [field]: value }));
      return;
    }
    // Server mode: notify parent to re-fetch filtered data
    setServerFilterValue((prev) => ({ ...prev, [field]: value }));
    if (onFilter != null) {
      onFilter({
        filters: { ...filters, [field]: { ...filters[field], value: value || null } },
        sortField: sort?.field,
        sortOrder: sort?.asc ? 1 : -1,
        rows: pageSize,
      });
    }
  }, [clientFilter, onFilter, filters, sort, pageSize]);

  const onFilterOperatorChange = useCallback((field: string, matchMode: VGridFilterOperator): void => {
    if (clientFilter) return; // Client mode doesn't use operator-based server filtering
    if (onFilter != null) {
      onFilter({
        filters: { ...filters, [field]: { ...filters[field], matchMode } },
        sortField: sort?.field,
        sortOrder: sort?.asc ? 1 : -1,
        rows: pageSize,
      });
    }
  }, [clientFilter, onFilter, filters, sort, pageSize]);

  const onFilterClear = useCallback((field: string): void => {
    if (clientFilter) {
      setColumnFilters((prev) => ({ ...prev, [field]: '' }));
      return;
    }
    setServerFilterValue((prev) => ({ ...prev, [field]: '' }));
    if (onFilter != null) {
      const defaultMode = columns.find((c) => c.field === field)?.filterType === 'date'
        ? 'dateIs' : columns.find((c) => c.field === field)?.filterType === 'number'
        ? 'equals' : 'contains';
      onFilter({
        filters: { ...filters, [field]: { value: null, matchMode: defaultMode } },
        sortField: sort?.field,
        sortOrder: sort?.asc ? 1 : -1,
        rows: pageSize,
      });
    }
  }, [clientFilter, onFilter, filters, sort, pageSize, columns]);

  // ─── Expansion ─────────────────────────────────────────────────────────────
  const toggleExpand = useCallback((key: string): void => {
    const el = containerRef.current;
    const prevTop = el?.scrollTop ?? 0;

    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

    requestAnimationFrame(() => {
      if (el != null) el.scrollTop = prevTop;
    });
  }, []);

  // ─── Page size (server mode only) ──────────────────────────────────────────
  const handlePageSizeChange = useCallback((size: number): void => {
    resetScroll();
    onPageSizeChange?.(size);
  }, [onPageSizeChange, resetScroll]);

  // ─── Computed values ───────────────────────────────────────────────────────
  const displayTotalRecords = clientFilter ? uniqueData.length : totalRecords;
  const displayShowing = processedData.length;
  const selectedCount = selection.length;

  return (
    <div className={clsx(vGridTheme.root, className)}>
      {/* Top header bar */}
      <VGridFooter
        totalRecords={displayTotalRecords}
        showing={displayShowing}
        selectedCount={selectedCount}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        onPageSizeChange={handlePageSizeChange}
        onExportExcel={onExportExcel}
        onExportPdf={onExportPdf}
        loading={serverFetchLoading}
        position="top"
        clientMode={clientFilter}
      />

      {/* Scroll container */}
      <div
        ref={containerRef}
        className={vGridTheme.scrollContainer}
        style={{ maxHeight: 'calc(100vh - 200px)' }}
        onScroll={handleScroll}
      >
        <table ref={tableRef} className={vGridTheme.table}>
          <colgroup>
            {hasExpansion && <col style={{ width: 36 }} />}
            {hasSelection && <col style={{ width: 36 }} />}
            {columns.map((col) => (
              <col key={col.field} style={{ width: col.width ?? 150 }} />
            ))}
          </colgroup>

          <VGridHeader
            columns={columns}
            sort={sort}
            onSortColumn={onSortColumn}
            filters={filters}
            serverFilterValue={serverFilterValue}
            lockFilter={clientFilter}
            columnFilters={columnFilters}
            onFilterChange={onFilterChange}
            onFilterOperatorChange={onFilterOperatorChange}
            onFilterClear={onFilterClear}
            pinnedOffsets={pinnedOffsets}
            lastFrozenField={lastFrozenField}
            showSelectAll={showSelectAll}
            isAllSelected={isAllSelected}
            onToggleSelectAll={toggleSelectAll}
            selectionMode={selectionMode}
            hasExpansion={hasExpansion}
          />

          <VGridBody
            columns={columns}
            windowRows={windowRows}
            allData={data}
            rowKey={rowKey}
            rowHeightPx={rowHeightPx}
            padTop={padTop}
            padBottom={padBottom}
            virtualizationEnabled={virtualizationEnabled}
            pinnedOffsets={pinnedOffsets}
            lastFrozenField={lastFrozenField}
            bordered={bordered}
            selectionMode={selectionMode}
            isRowSelected={isRowSelected}
            toggleRow={toggleRow}
            hasExpansion={hasExpansion}
            expandedRows={expandedRows}
            toggleExpand={toggleExpand}
            renderExpandedRow={renderExpandedRow}
          />
        </table>
      </div>

      {/* Empty state */}
      {processedData.length === 0 && !loading && (
        <div className={vGridTheme.empty}>{emptyMessage ?? 'No records found.'}</div>
      )}

      {/* Loading indicator (server mode only) */}
      {!clientFilter && serverFetchLoading && (
        <div className={vGridTheme.loadingBar}>
          <span className={vGridTheme.loadingSpinner} />
          Loading more records...
        </div>
      )}

      {/* Footer bar */}
      <VGridFooter
        totalRecords={displayTotalRecords}
        showing={displayShowing}
        selectedCount={selectedCount}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        onPageSizeChange={handlePageSizeChange}
        onExportExcel={undefined}
        onExportPdf={undefined}
        loading={serverFetchLoading}
        position="bottom"
        clientMode={clientFilter}
      />
    </div>
  );
}
