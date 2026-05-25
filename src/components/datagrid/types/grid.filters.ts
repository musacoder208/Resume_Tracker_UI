export type GridFilterType = 'text' | 'number' | 'date'

/* ---------- Text operators ---------- */
export type TextFilterOperator =
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'equals'
  | 'not_equals'
  | 'none'

/* ---------- Number operators ---------- */
export type NumberFilterOperator =
  | 'equals'
  | 'not_equals'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'none'

/* ---------- Date operators ---------- */
export type DateFilterOperator =
  | 'is'
  | 'is_not'
  | 'before'
  | 'after'
  | 'none'

export type GridFilterOperator =
  | TextFilterOperator
  | NumberFilterOperator
  | DateFilterOperator

export interface GridColumnFilterValue {
  operator: GridFilterOperator
  value?: string | number | Date
}
