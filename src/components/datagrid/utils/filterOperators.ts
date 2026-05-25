import type {
  GridFilterType,
  GridFilterOperator,
} from '../types/grid.filters'

export interface FilterOperatorOption {
  /** i18n key — translate with t(op.label) at the call site */
  label: string
  value: GridFilterOperator
}

export const FILTER_OPERATORS: Record<
  GridFilterType,
  FilterOperatorOption[]
> = {
  text: [
    { label: 'grid.filter.contains', value: 'contains' },
    { label: 'grid.filter.notContains', value: 'not_contains' },
    { label: 'grid.filter.startsWith', value: 'starts_with' },
    { label: 'grid.filter.endsWith', value: 'ends_with' },
    { label: 'grid.filter.equals', value: 'equals' },
    { label: 'grid.filter.notEquals', value: 'not_equals' },
    { label: 'grid.filter.noFilter', value: 'none' },
  ],

  number: [
    { label: 'grid.filter.equals', value: 'equals' },
    { label: 'grid.filter.notEquals', value: 'not_equals' },
    { label: 'grid.filter.lessThan', value: 'lt' },
    { label: 'grid.filter.lessThanOrEqual', value: 'lte' },
    { label: 'grid.filter.greaterThan', value: 'gt' },
    { label: 'grid.filter.greaterThanOrEqual', value: 'gte' },
    { label: 'grid.filter.noFilter', value: 'none' },
  ],

  date: [
    { label: 'grid.filter.dateIs', value: 'is' },
    { label: 'grid.filter.dateIsNot', value: 'is_not' },
    { label: 'grid.filter.dateIsBefore', value: 'before' },
    { label: 'grid.filter.dateIsAfter', value: 'after' },
    { label: 'grid.filter.noFilter', value: 'none' },
  ],
}
