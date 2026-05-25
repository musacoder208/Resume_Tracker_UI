import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { GridState } from '../types/grid.state'
import type {
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table'
import type { GridColumnFilterValue } from '../types/grid.filters'

interface UseGridUrlStateOptions {
  defaultState: GridState
}

/* -------------------------------------------------- */
/* Helpers: encode / decode */
/* -------------------------------------------------- */

const encodeSorting = (sorting: SortingState): string =>
  sorting.map((s) => `${s.id}:${s.desc ? 'desc' : 'asc'}`).join(',')

const decodeSorting = (value: string | null): SortingState => {
  if (value == null) return []
  return value.split(',').map((item) => {
    const [id, dir] = item.split(':')
    return { id, desc: dir === 'desc' }
  })
}

// const encodeFilters = (filters: ColumnFiltersState): string =>
//   filters.map((f) => `${f.id}:${String(f.value)}`).join(',')

// const decodeFilters = (value: string | null): ColumnFiltersState => {
//   if (value == null) return []
//   return value.split(',').map((item) => {
//     const [id, val] = item.split(':')
//     return { id, value: val }
//   })
// }

/* ---------- Encode ---------- */
export const encodeFilters = (
  filters: ColumnFiltersState,
): string => {
  return filters
    .flatMap((f) => {
      if (
        typeof f.value === 'object' &&
        f.value !== null &&
        'operator' in f.value
      ) {
        const fv = f.value as GridColumnFilterValue

        if (fv.operator === 'none') {
          return []
        }

        if (
          typeof fv.value === 'string' ||
          typeof fv.value === 'number'
        ) {
          return [
            `${f.id}:${fv.operator}:${encodeURIComponent(
              String(fv.value),
            )}`,
          ]
        }
      }
      return []
    })
    .join('|')
}


/* ---------- Decode ---------- */
export const decodeFilters = (
  value: string | null,
): ColumnFiltersState => {
  if (typeof value !== 'string' || value.length === 0) {
    return []
  }

  return value.split('|').map((part) => {
    const [id, operator, raw] = part.split(':')

    return {
      id,
      value: {
        operator,
        value: decodeURIComponent(raw),
      },
    }
  })
}
/* -------------------------------------------------- */
/* Hook */
/* -------------------------------------------------- */

export const useGridUrlState = ({
  defaultState,
}: UseGridUrlStateOptions): [GridState, (next: GridState) => void] => {
  const [params, setParams] = useSearchParams()

  /* ---------- Read from URL ---------- */

  const state: GridState = useMemo(() => {
    const pageIndex = Number(params.get('page') ?? defaultState.pagination.pageIndex)
    const pageSize = Number(params.get('pageSize') ?? defaultState.pagination.pageSize)

    return {
      ...defaultState,

      pagination: {
        pageIndex,
        pageSize,
      },

      sorting: decodeSorting(params.get('sort')),
      columnFilters: decodeFilters(params.get('filters')),
    }
  }, [params, defaultState])

  /* ---------- Write to URL ---------- */

//   const setState = useCallback(
//     (next: GridState) => {
//       const nextParams = new URLSearchParams(params)

//       nextParams.set('page', String(next.pagination.pageIndex))
//       nextParams.set('pageSize', String(next.pagination.pageSize))

//       if (next.sorting.length > 0) {
//         nextParams.set('sort', encodeSorting(next.sorting))
//       } else {
//         nextParams.delete('sort')
//       }

//       if (next.columnFilters.length > 0) {
//         nextParams.set('filters', encodeFilters(next.columnFilters))
//       } else {
//         nextParams.delete('filters')
//       }

//       setParams(nextParams, { replace: true })
//     },
//     [params, setParams],
//   )\
const setState = useCallback(
  (next: GridState): void => {
    const nextParams = new URLSearchParams(params)

    const nextPage = String(next.pagination.pageIndex)
    const nextPageSize = String(next.pagination.pageSize)

    if (params.get('page') !== nextPage) {
      nextParams.set('page', nextPage)
    }

    if (params.get('pageSize') !== nextPageSize) {
      nextParams.set('pageSize', nextPageSize)
    }

    const nextSort =
      next.sorting.length > 0 ? encodeSorting(next.sorting) : null

    if (nextSort !== params.get('sort')) {
      if (nextSort !== null) {
        nextParams.set('sort', nextSort)
      } else {
        nextParams.delete('sort')
      }
    }

    const nextFilters =
      next.columnFilters.length > 0
        ? encodeFilters(next.columnFilters)
        : null

    if (nextFilters !== params.get('filters')) {
      if (nextFilters !== null) {
        nextParams.set('filters', nextFilters)
      } else {
        nextParams.delete('filters')
      }
    }

    // 🔑 IMPORTANT: only navigate if params actually changed
    const changed: boolean =
      nextParams.toString() !== params.toString()

    if (changed === true) {
      setParams(nextParams, { replace: true })
    }
  },
  [params, setParams],
)

  return [state, setState] as const
}
