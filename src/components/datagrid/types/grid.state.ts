// components/datagrid/types/grid.state.ts

import type {
  ColumnFiltersState,
  ExpandedState,
  RowSelectionState,
  SortingState,
  VisibilityState,
  ColumnPinningState,
} from '@tanstack/react-table'

export interface GridPaginationState {
  pageIndex: number
  pageSize: number
}

export interface GridState {
  pagination: GridPaginationState
  sorting: SortingState
  columnFilters: ColumnFiltersState
  globalFilter?: string

  rowSelection: RowSelectionState
  expanded: ExpandedState

  // Optional but strongly recommended for an ERP/LIMS grid:
  columnVisibility?: VisibilityState
  columnPinning?: ColumnPinningState
}

export const createInitialGridState = (overrides?: Partial<GridState>): GridState => ({
  pagination: { pageIndex: 0, pageSize: 25 },
  sorting: [],
  columnFilters: [],
  globalFilter: undefined,
  rowSelection: {},
  expanded: {},

  // 🔑 MUST be objects, not undefined
  columnVisibility: {},
  columnPinning: {
    left: [],
    right: [],
  },

  ...overrides,
})
