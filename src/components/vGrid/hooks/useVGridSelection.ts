import { useCallback, useMemo } from 'react';
import type { VGridSelectionMode } from '../types/vGrid.types';

interface UseVGridSelectionProps<TData> {
  data: TData[];
  rowKey: keyof TData & string;
  selection: TData[];
  selectionMode: VGridSelectionMode;
  isDataSelectable?: (row: TData) => boolean;
  onSelectionChange: (rows: TData[]) => void;
}

interface UseVGridSelectionReturn<TData> {
  isRowSelected: (row: TData) => boolean;
  toggleRow: (row: TData) => void;
  toggleSelectAll: (checked: boolean) => void;
  isAllSelected: boolean;
}

export function useVGridSelection<TData>({
  data,
  rowKey,
  selection,
  selectionMode,
  isDataSelectable,
  onSelectionChange,
}: UseVGridSelectionProps<TData>): UseVGridSelectionReturn<TData> {
  const selectedKeys = useMemo(
    () => new Set(selection.map((item) => (item as Record<string, unknown>)[rowKey])),
    [selection, rowKey]
  );

  const isRowSelected = useCallback(
    (row: TData): boolean => selectedKeys.has((row as Record<string, unknown>)[rowKey]),
    [selectedKeys, rowKey]
  );

  const toggleRow = useCallback(
    (row: TData): void => {
      const key = (row as Record<string, unknown>)[rowKey];
      if (selectionMode === 'single') {
        onSelectionChange([row]);
        return;
      }
      const isSelected = selectedKeys.has(key);
      if (isSelected) {
        onSelectionChange(selection.filter((r) => (r as Record<string, unknown>)[rowKey] !== key));
      } else {
        onSelectionChange([...selection, row]);
      }
    },
    [selectedKeys, rowKey, selectionMode, selection, onSelectionChange]
  );

  const selectableData = useMemo(
    () => (isDataSelectable != null ? data.filter((d) => isDataSelectable(d)) : data),
    [data, isDataSelectable]
  );

  const isAllSelected = useMemo(() => {
    if (selectableData.length === 0) return false;
    return selectableData.every((row) => selectedKeys.has((row as Record<string, unknown>)[rowKey]));
  }, [selectableData, selectedKeys, rowKey]);

  const toggleSelectAll = useCallback(
    (checked: boolean): void => {
      if (checked) {
        const keySet = new Set(selection.map((item) => (item as Record<string, unknown>)[rowKey]));
        const newSelection = [...selection];
        selectableData.forEach((item) => {
          if (!keySet.has((item as Record<string, unknown>)[rowKey])) {
            newSelection.push(item);
          }
        });
        onSelectionChange(newSelection);
      } else {
        const removeKeys = new Set(selectableData.map((item) => (item as Record<string, unknown>)[rowKey]));
        onSelectionChange(selection.filter((item) => !removeKeys.has((item as Record<string, unknown>)[rowKey])));
      }
    },
    [selection, selectableData, rowKey, onSelectionChange]
  );

  return { isRowSelected, toggleRow, toggleSelectAll, isAllSelected };
}
