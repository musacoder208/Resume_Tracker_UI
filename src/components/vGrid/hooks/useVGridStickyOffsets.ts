import { useLayoutEffect, useState } from 'react';
import type { RefObject } from 'react';
import type { VGridColumn } from '../types/vGrid.types';

interface UseVGridStickyOffsetsProps<TData> {
  tableRef: RefObject<HTMLTableElement | null>;
  columns: VGridColumn<TData>[];
  data: unknown[];
  hasSelectionColumn: boolean;
  hasExpansionColumn: boolean;
}

interface UseVGridStickyOffsetsReturn {
  pinnedOffsets: Record<string, number>;
  lastFrozenField: string | null;
}

export function useVGridStickyOffsets<TData>({
  tableRef,
  columns,
  data,
  hasSelectionColumn,
  hasExpansionColumn,
}: UseVGridStickyOffsetsProps<TData>): UseVGridStickyOffsetsReturn {
  const [pinnedOffsets, setPinnedOffsets] = useState<Record<string, number>>({});

  const frozenFields = columns.filter((c) => c.frozen).map((c) => c.field);
  const lastFrozenField = frozenFields.length > 0 ? frozenFields[frozenFields.length - 1] : null;

  useLayoutEffect(() => {
    const tableEl = tableRef.current;
    if (tableEl == null || frozenFields.length === 0) return;

    const headerRow = tableEl.querySelector('thead tr');
    if (headerRow == null) return;

    const thElements = headerRow.querySelectorAll('th');
    const offsets: Record<string, number> = {};

    // Count how many special columns precede user data columns
    const specialCols = (hasExpansionColumn ? 1 : 0) + (hasSelectionColumn ? 1 : 0);
    let cumulative = 0;

    // Sum widths of special columns (expand + checkbox)
    for (let i = 0; i < specialCols && i < thElements.length; i++) {
      cumulative += thElements[i].offsetWidth;
    }

    // Now measure frozen data columns
    for (let i = 0; i < frozenFields.length; i++) {
      const thIdx = specialCols + i;
      if (thIdx >= thElements.length) break;
      offsets[frozenFields[i]] = cumulative;
      cumulative += thElements[thIdx].offsetWidth;
    }

    setPinnedOffsets(offsets);
  }, [frozenFields.join(','), data.length, hasSelectionColumn, hasExpansionColumn]);

  return { pinnedOffsets, lastFrozenField };
}
