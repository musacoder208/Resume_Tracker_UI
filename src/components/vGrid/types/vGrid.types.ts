import type { ReactNode, RefObject } from 'react';

// ─── Column Definition ───────────────────────────────────────────────────────

export type VGridFilterType = 'text' | 'number' | 'date';
export type VGridAlign = 'left' | 'center' | 'right';

export interface VGridColumn<TData> {
  field: string;
  header: string;
  width?: number;
  minWidth?: number;
  frozen?: boolean;
  sortable?: boolean;
  filter?: boolean;
  filterType?: VGridFilterType;
  align?: VGridAlign;
  body?: (props: VGridCellProps<TData>) => ReactNode;
  editor?: (props: VGridCellProps<TData>) => ReactNode;
  headerStyle?: React.CSSProperties;
  style?: React.CSSProperties;
}

export interface VGridCellProps<TData> {
  rowData: TData;
  value: unknown;
  field: string;
  tableData: TData[];
  expandRow?: (key: string) => void;
}

// ─── Filter State ────────────────────────────────────────────────────────────

export type VGridFilterOperator =
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'equals'
  | 'notEquals'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'dateIs'
  | 'dateIsNot'
  | 'dateBefore'
  | 'dateAfter'
  | 'noFilter';

export interface VGridFilterState {
  value: string | number | Date | null;
  matchMode: VGridFilterOperator;
}

// ─── Sort State ──────────────────────────────────────────────────────────────

export interface VGridSortState {
  field: string;
  asc: boolean;
}

// ─── Server Fetch ────────────────────────────────────────────────────────────

export interface VGridFetchParams {
  rows: number;
  filters: Record<string, VGridFilterState>;
  sortField?: string;
  sortOrder?: 1 | -1;
}

export interface VGridFetchResult<TData> {
  data: TData[];
  count?: number;
}

// ─── Selection ───────────────────────────────────────────────────────────────

export type VGridSelectionMode = 'single' | 'multiple';

// ─── Component Props ─────────────────────────────────────────────────────────

export interface VGridProps<TData> {
  data: TData[];
  columns: VGridColumn<TData>[];
  rowKey: keyof TData & string;
  totalRecords: number;

  /** Server fetch — called on scroll-to-bottom for next batch */
  serverFetch?: (params: VGridFetchParams) => Promise<VGridFetchResult<TData>>;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;

  /** Sorting */
  onSort?: (params: VGridFetchParams) => void;

  /** Filtering */
  filters?: Record<string, VGridFilterState>;
  onFilter?: (params: {
    filters: Record<string, VGridFilterState>;
    sortField?: string;
    sortOrder?: 1 | -1;
    rows?: number;
  }) => void;
  clientFilter?: boolean;

  /** Selection */
  selection?: TData[];
  onSelectionChange?: (rows: TData[]) => void;
  showSelectAll?: boolean;
  isDataSelectable?: (row: TData) => boolean;
  selectionMode?: VGridSelectionMode;

  /** Show cell borders. Default true */
  bordered?: boolean;

  /** Row expansion */
  renderExpandedRow?: (row: TData) => ReactNode;

  /** Export */
  onExportExcel?: () => void;
  onExportPdf?: () => void;

  /** UI */
  title?: string;
  emptyMessage?: string;
  rowHeight?: number;
  loading?: boolean;
  className?: string;
}

// ─── Internal Context ────────────────────────────────────────────────────────

export interface VGridContextValue<TData> {
  data: TData[];
  columns: VGridColumn<TData>[];
  rowKey: keyof TData & string;
  processedData: TData[];
  windowRows: TData[];
  padTop: number;
  padBottom: number;
  rowHeightPx: number;
  virtualizationEnabled: boolean;

  // Sort
  sort: VGridSortState | null;
  onSortColumn: (field: string) => void;

  // Filter
  filters: Record<string, VGridFilterState>;
  columnFilters: Record<string, string>;
  serverFilterValue: Record<string, string>;
  lockFilter: boolean;
  onFilterChange: (field: string, value: string) => void;
  onFilterOperatorChange: (field: string, matchMode: VGridFilterOperator) => void;
  onFilterClear: (field: string) => void;

  // Selection
  selection: TData[];
  selectionMode: VGridSelectionMode;
  showSelectAll: boolean;
  isDataSelectable?: (row: TData) => boolean;
  onSelectionChange: (rows: TData[]) => void;
  onToggleSelectAll: (checked: boolean) => void;
  isAllSelected: boolean;

  // Expansion
  expandedRows: Set<string>;
  toggleRow: (key: string) => void;
  renderExpandedRow?: (row: TData) => ReactNode;

  // Refs
  containerRef: RefObject<HTMLDivElement | null>;
  tableRef: RefObject<HTMLTableElement | null>;

  // Sticky offsets
  pinnedOffsets: Record<string, number>;
  lastFrozenField: string | null;

  // Loading
  loading: boolean;
  serverFetchLoading: boolean;
}
