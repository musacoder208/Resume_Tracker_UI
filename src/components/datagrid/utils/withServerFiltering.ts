import type { GridColumnDef, GridColumnMeta } from '../types/grid.types'

/**
 * Columns using semantic / server-side filters (number, date, range)
 * must explicitly opt-out of TanStack internal filter evaluation.
 */
const REQUIRES_SERVER_FILTER_FN = new Set(['number', 'date'])

const needsServerFilterFn = (meta?: GridColumnMeta): boolean => {
  if (!meta?.filterType) return false
  return REQUIRES_SERVER_FILTER_FN.has(meta.filterType)
}

/**
 * Injects `filterFn: () => true` for columns that:
 * - are server-filtered
 * - use non-primitive filter values ({ operator, value })
 *
 * This prevents TanStack from swallowing filter updates.
 */
export const withServerFiltering = <TData>(
  columns: ReadonlyArray<GridColumnDef<TData>>,
): GridColumnDef<TData>[] => {
  return columns.map((col) => {
    // already explicit → respect user config
    if (typeof col.filterFn === 'function') {
      return col
    }

    if (needsServerFilterFn(col.meta)) {
      return {
        ...col,
        filterFn: () => true,
      }
    }

    return col
  })
}
