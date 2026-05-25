import { useVirtualizer, type VirtualItem } from '@tanstack/react-virtual'
import { useEffect, useMemo } from 'react'
import type { RefObject } from 'react'
import type { Row } from '@tanstack/react-table'

export interface UseVirtualizedServerRowsResult<TData> {
  virtualItems: VirtualItem[]
  virtualRows: Row<TData>[]
  totalSize: number
  paddingTop: number
  paddingBottom: number
}

/**
 * Server-grid safe virtualization hook:
 * - Provides totalSize + paddingTop/paddingBottom for spacer rows
 * - Forces measure() when row identity changes (fixes cached-data/back-nav cases)
 * - Prevents undefined row access on index mismatch
 */
export const useVirtualizedServerRows = <TData,>(opts: {
  rows: Row<TData>[]
  parentRef: RefObject<HTMLElement | null>
  estimateRowHeight?: number
  overscan?: number
  /**
   * Change this when "data identity" changes.
   * Use something stable like `${pageIndex}-${rows.length}-${firstRowId ?? ''}`
   */
  dataKey: string
}): UseVirtualizedServerRowsResult<TData> => {
  const {
    rows,
    parentRef,
    estimateRowHeight = 40,
    overscan = 8,
    dataKey,
  } = opts

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateRowHeight,
    overscan,
  })

  const virtualItems = rowVirtualizer.getVirtualItems()
  const totalSize = rowVirtualizer.getTotalSize()

  // ✅ Critical: when cached data/back-nav happens, force re-measure
  useEffect(() => {
    rowVirtualizer.measure()
    // Also ensure we re-evaluate after scroll element becomes available
    // (common on back/forward cache restores)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataKey])

  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0
  const paddingBottom =
    virtualItems.length > 0 ? totalSize - virtualItems[virtualItems.length - 1].end : 0

  const virtualRows = useMemo(() => {
    // Avoid undefined when indices mismatch briefly
    const out: Row<TData>[] = []
    for (const item of virtualItems) {
      const r = rows[item.index]
      if (r != null) out.push(r)
    }
    return out
  }, [rows, virtualItems])

  return {
    virtualItems,
    virtualRows,
    totalSize,
    paddingTop,
    paddingBottom,
  }
}
