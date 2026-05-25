/* @react-compiler-disable */

import { useVirtualizer } from '@tanstack/react-virtual'
import { useMemo } from 'react'
import type { RefObject } from 'react'
import type { Row } from '@tanstack/react-table'

export interface UseVirtualRowsResult<TData> {
  virtualRows: Row<TData>[]
  // totalSize: number
}

interface UseVirtualRowsOptions<TData> {
  rows: Row<TData>[]
  parentRef: RefObject<Element | null>
  estimateRowHeight?: number
  overscan?: number
}

export const useVirtualRows = <TData,>({
  rows,
  parentRef,
  estimateRowHeight = 40,
  overscan = 6,
}: UseVirtualRowsOptions<TData>): UseVirtualRowsResult<TData> => {
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateRowHeight,
    overscan,
  })

  const virtualRows = useMemo(
    () =>
      rowVirtualizer
        .getVirtualItems()
        .map((item) => rows[item.index]),
    [rows, rowVirtualizer],
  )

  return {
    virtualRows,
    // totalSize: rowVirtualizer.getTotalSize(),
  }
}
