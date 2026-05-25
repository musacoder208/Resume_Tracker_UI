import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { VGridFetchParams, VGridFetchResult, VGridSortState, VGridFilterState } from '../types/vGrid.types';

interface UseVGridScrollProps<TData> {
  containerRef: RefObject<HTMLDivElement | null>;
  processedDataLength: number;
  rowHeightPx: number;
  virtualizationEnabled: boolean;
  totalRecords: number;
  dataLength: number;
  pageSize: number;
  sort: VGridSortState | null;
  filters: Record<string, VGridFilterState>;
  lockFilter: boolean;
  serverFetch?: (params: VGridFetchParams) => Promise<VGridFetchResult<TData>>;
}

interface UseVGridScrollReturn {
  win: { start: number; end: number };
  padTop: number;
  padBottom: number;
  serverFetchLoading: boolean;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  resetScroll: () => void;
}

export function useVGridScroll<TData>({
  containerRef,
  processedDataLength,
  rowHeightPx,
  virtualizationEnabled,
  totalRecords,
  dataLength,
  pageSize,
  sort,
  filters,
  lockFilter,
  serverFetch,
}: UseVGridScrollProps<TData>): UseVGridScrollReturn {
  const [win, setWin] = useState({ start: 0, end: Math.min(30, processedDataLength) });
  const [padTop, setPadTop] = useState(0);
  const [padBottom, setPadBottom] = useState(0);
  const [serverFetchLoading, setServerFetchLoading] = useState(false);

  const scrollRaf = useRef<number | null>(null);
  const lastScrollTop = useRef(0);
  const fetchingRef = useRef(false);
  const prevDataLength = useRef(dataLength);

  // Recalculate virtual window when processedDataLength changes (filter applied/cleared)
  useEffect(() => {
    if (!virtualizationEnabled) return;
    const el = containerRef.current;
    if (el == null) return;

    const scrollTop = el.scrollTop;
    const viewHeight = el.clientHeight || 1;
    const overscan = 8;

    const start = Math.max(0, Math.floor(scrollTop / rowHeightPx) - overscan);
    const visible = Math.ceil(viewHeight / rowHeightPx) + overscan * 2;
    const end = Math.min(processedDataLength, start + visible);

    setWin({ start, end });

    const totalHeight = processedDataLength * rowHeightPx;
    const padT = start * rowHeightPx;
    const visibleHeight = (end - start) * rowHeightPx;
    const padB = Math.max(0, totalHeight - padT - visibleHeight);

    setPadTop(padT);
    setPadBottom(padB);
  }, [processedDataLength, virtualizationEnabled, rowHeightPx, containerRef]);

  // Reset scroll to top when data resets (page size change, filter clear, etc.)
  useEffect(() => {
    // Data got smaller = reset happened (page size change or filter)
    if (dataLength < prevDataLength.current) {
      const el = containerRef.current;
      if (el != null) el.scrollTop = 0;
      setWin({ start: 0, end: Math.min(30, processedDataLength) });
      setPadTop(0);
      setPadBottom(0);
    }
    prevDataLength.current = dataLength;
  }, [dataLength, containerRef, processedDataLength]);

  const resetScroll = useCallback((): void => {
    const el = containerRef.current;
    if (el != null) el.scrollTop = 0;
    setWin({ start: 0, end: Math.min(30, processedDataLength) });
    setPadTop(0);
    setPadBottom(0);
  }, [containerRef, processedDataLength]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>): void => {
    const target = e.currentTarget;
    lastScrollTop.current = target.scrollTop;

    if (scrollRaf.current != null) return;

    scrollRaf.current = requestAnimationFrame(() => {
      if (!virtualizationEnabled) {
        scrollRaf.current = null;
        return;
      }

      const scrollTop = lastScrollTop.current;
      const viewHeight = target.clientHeight;
      const overscan = 8;

      const start = Math.max(0, Math.floor(scrollTop / rowHeightPx) - overscan);
      const visible = Math.ceil(viewHeight / rowHeightPx) + overscan * 2;
      const end = Math.min(processedDataLength, start + visible);

      setWin((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));

      const totalHeight = processedDataLength * rowHeightPx;
      const padT = start * rowHeightPx;
      const visibleHeight = (end - start) * rowHeightPx;
      const padB = Math.max(0, totalHeight - padT - visibleHeight);

      setPadTop(padT);
      setPadBottom(padB);

      scrollRaf.current = null;
    });

    // Infinite scroll — fetch next batch at bottom
    const isBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 2;

    if (
      isBottom &&
      serverFetch != null &&
      !fetchingRef.current &&
      !lockFilter &&
      totalRecords > dataLength
    ) {
      fetchingRef.current = true;
      setServerFetchLoading(true);

      const params: VGridFetchParams = {
        rows: pageSize,
        filters,
        sortField: sort?.field,
        sortOrder: sort?.asc ? 1 : -1,
      };

      void serverFetch(params).then(() => {
        // Nudge scroll up slightly so user isn't stuck at absolute bottom
        // This allows the next scroll-down to trigger properly
        requestAnimationFrame(() => {
          const el = containerRef.current;
          if (el != null && el.scrollTop > 0) {
            el.scrollTop = el.scrollTop - 5;
          }
        });
      }).finally(() => {
        fetchingRef.current = false;
        setServerFetchLoading(false);
      });
    }
  }, [virtualizationEnabled, processedDataLength, rowHeightPx, totalRecords, dataLength, pageSize, sort, filters, lockFilter, serverFetch, containerRef]);

  return { win, padTop, padBottom, serverFetchLoading, handleScroll, resetScroll };
}
