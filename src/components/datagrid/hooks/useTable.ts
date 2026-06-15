import {
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Table,
} from '@tanstack/react-table';
import { useMemo } from 'react';
import type { GridColumnMeta } from '../types/grid.types';

import type { GridState } from '../types/grid.state';
import type { GridColumnDef } from '../types/grid.types';

interface UseTableProps<TData> {
  data: ReadonlyArray<TData>;
  columns: ReadonlyArray<GridColumnDef<TData>>;

  totalRows: number;
  state: GridState;
  onStateChange: (next: GridState) => void;

  rowId: (row: TData) => string;

  enableRowSelection?: boolean;
  enableRowExpansion?: boolean;
  getSubRows?: (row: TData) => TData[] | undefined;
}

export const useTable = <TData>({
  data,
  columns,
  totalRows,
  state,
  onStateChange,
  rowId,
  enableRowSelection = false,
  enableRowExpansion = false,
  getSubRows,
}: UseTableProps<TData>): Table<TData> => {
  'use no memo';

  const pageCount = Math.max(1, Math.ceil(totalRows / state.pagination.pageSize));

  const gridData = useMemo(() => (data ? [...data] : []), [data]);

  // Derive left-pinned column IDs from meta.pin — keeps TanStack's getStart('left') in sync
  const leftPinnedIds = useMemo(() => {
    const ids: string[] = [];
    for (const col of columns) {
      const meta = (col.meta as GridColumnMeta | undefined);
      if (meta?.pin === 'left' && typeof col.id === 'string') {
        ids.push(col.id);
      }
    }
    return ids;
  }, [columns]);

  // Derive right-pinned column IDs from meta.pin === 'right'
  const rightPinnedIds = useMemo(() => {
    const ids: string[] = [];
    for (const col of columns) {
      const meta = (col.meta as GridColumnMeta | undefined);
      if (meta?.pin === 'right' && typeof col.id === 'string') {
        ids.push(col.id);
      }
    }
    return ids;
  }, [columns]);

  const table = useReactTable<TData>({
    data: gridData,
    columns: columns as GridColumnDef<TData>[],
    defaultColumn: { size: 170, minSize: 40 },

    // Server-side mode
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,

    pageCount,

    // Row identity (critical for selection, expansion, virtualization)
    getRowId: rowId,

    // Feature toggles
    enableRowSelection,
    enableExpanding: enableRowExpansion,

    getSubRows,

    // Controlled state
    state: {
      pagination: state.pagination,
      sorting: state.sorting,
      columnFilters: state.columnFilters,
      globalFilter: state.globalFilter,
      rowSelection: state.rowSelection,
      expanded: state.expanded,
      columnVisibility: state.columnVisibility,
      columnPinning: {
        left: leftPinnedIds,
        right: rightPinnedIds,
      },
    },

    // State sync back to app / RTK Query
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(state.pagination) : updater;
      // Reset to page 0 when pageSize changes (same as HTML demo: page=1 on size change)
      const resetPage = next.pageSize !== state.pagination.pageSize;
      onStateChange({
        ...state,
        pagination: resetPage ? { ...next, pageIndex: 0 } : next,
      });
    },

    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(state.sorting) : updater;
      onStateChange({ ...state, sorting: next });
    },

    onColumnFiltersChange: (updater) => {
      const next = typeof updater === 'function' ? updater(state.columnFilters) : updater;
      const filtersChanged = JSON.stringify(next) !== JSON.stringify(state.columnFilters);
      onStateChange({
        ...state,
        columnFilters: next,
        pagination: filtersChanged ? { ...state.pagination, pageIndex: 0 } : state.pagination,
      });
    },

    onGlobalFilterChange: (value) => {
      onStateChange({
        ...state,
        globalFilter: typeof value === 'string' ? value : undefined,
        pagination: { ...state.pagination, pageIndex: 0 },
      });
    },

    onRowSelectionChange: (updater) => {
      const next = typeof updater === 'function' ? updater(state.rowSelection) : updater;
      onStateChange({ ...state, rowSelection: next });
    },

    onExpandedChange: (updater) => {
      const next = typeof updater === 'function' ? updater(state.expanded) : updater;
      onStateChange({ ...state, expanded: next });
    },

    onColumnVisibilityChange: (updater) => {
      const next = typeof updater === 'function' ? updater(state.columnVisibility ?? {}) : updater;
      onStateChange({ ...state, columnVisibility: next });
    },

    onColumnPinningChange: (updater) => {
      const next = typeof updater === 'function' ? updater(state.columnPinning ?? {}) : updater;
      onStateChange({ ...state, columnPinning: next });
    },

    // Row models
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),

    debugTable: false,
  });

  return table;
};
