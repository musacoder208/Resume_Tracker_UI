// components/datagrid/types/grid.types.ts

import type { ColumnDef, Row, Table, Column, Header } from '@tanstack/react-table';
import type { GridState } from './grid.state';
import type { ReactNode, RefObject } from 'react';

export type GridAlign = 'left' | 'center' | 'right';
export type GridPin = 'left' | 'right';

export type GridFilterType = 'text' | 'select' | 'number' | 'date';

export interface GridFilterMeta {
  type: GridFilterType;
  // For select filters
  options?: ReadonlyArray<{ label: string; value: string }>;
  // Optional placeholder text key (i18n)
  placeholderKey?: string;
}

export interface GridColumnMeta {
  align?: GridAlign;

  width?: number;
  minWidth?: number;

  pin?: GridPin;

  editable?: boolean;

  filterType?: GridFilterType;
  filterPlaceholder?: string;

  /** Custom className applied to td cells in this column */
  cellClassName?: string;

  /** Custom className applied to th header in this column */
  headerClassName?: string;
}

export type GridColumnDef<TData> = ColumnDef<TData, unknown> & {
  meta?: GridColumnMeta;
};

/**
 * Server-driven grid contract:
 * - You own the state (pagination/sorting/filters/etc.)
 * - Grid emits onStateChange
 * - Data is already sliced/sorted/filtered by server when manual* flags are enabled
 */
export interface DataGridProps<TData> {
  data: ReadonlyArray<TData>;
  columns: ReadonlyArray<GridColumnDef<TData>>;

  totalRows: number;

  state: GridState;
  onStateChange: (next: GridState) => void;

  loading?: boolean;
  error?: unknown;

  // Stable unique key for rows (mandatory for selection, expansion, virtualization)
  rowId: (row: TData) => string;

  // Feature flags
  enableVirtualization?: boolean;
  enableRowSelection?: boolean;
  enableRowExpansion?: boolean;
  enableColumnFilters?: boolean;
  enableSorting?: boolean;

  // Parent-child / nested rows
  getSubRows?: (row: TData) => TData[] | undefined;

  className?: string;
  layout?: DataGridLayout;

  /** Hide the toolbar above the grid. Default true. */
  showToolbar?: boolean;

  /** Show top pagination bar with stats, export buttons, pagination. Default false. */
  showTopBar?: boolean;

  /** Export to Excel callback — shows Excel button when provided */
  onExportExcel?: () => void;

  /** Export to PDF callback — shows PDF button when provided */
  onExportPdf?: () => void;

  /** Render the expanded detail panel for a row. Requires enableRowExpansion. */
  renderExpandedRow?: (row: Row<TData>) => ReactNode;
}

/**
 * Internal convenience types used across DataGrid parts.
 * Keep these here (types/) to avoid UI <-> hook circular deps.
 */
export interface DataGridContextValue<TData> {
  table: Table<TData>;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  enableVirtualization: boolean;
  enableRowSelection: boolean;
  enableRowExpansion: boolean;
  enableColumnFilters: boolean;
  enableSorting: boolean;
  layout?: DataGridLayout;
  loading: boolean | undefined;
  lastPinnedColumnId: string | null;
  /** Sticky left offsets (px) for each left-pinned column, keyed by column id */
  pinnedLeftOffsets: Record<string, number>;
  renderExpandedRow?: (row: Row<TData>) => ReactNode;
}

export interface GridCellRendererProps<TData> {
  table: Table<TData>;
  row: Row<TData>;
  column: Column<TData, unknown>;
  value: unknown;
}

export interface GridHeaderRendererProps<TData> {
  table: Table<TData>;
  header: Header<TData, unknown>;
}

export interface DataGridLayout {
  /**
   * Width behavior of the grid
   * - 'container' → fit parent (default)
   * - 'screen'    → fit viewport width
   * - number      → fixed max width in px
   */
  maxWidth?: 'container' | 'screen' | number;

  /**
   * Height behavior of the grid
   * - 'auto'   → grow with rows (default)
   * - 'screen' → fit viewport height
   * - number   → fixed height in px
   */
  height?: 'auto' | 'screen' | number;

  /**
   * Column width behavior
   * - 'content' → nowrap, natural width (default, LIMS worklists)
   * - 'fit'     → columns fit container width (NO horizontal scroll)
   */
  widthMode?: 'content' | 'fit';
}
