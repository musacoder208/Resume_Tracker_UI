import type { VGridColumn, VGridSortState } from '../types/vGrid.types';

export function applyClientSort<TData>(
  data: TData[],
  sort: VGridSortState | null,
  columns: VGridColumn<TData>[]
): TData[] {
  if (sort == null) return data;

  const col = columns.find((c) => c.field === sort.field);
  const result = [...data];

  result.sort((a, b) => {
    const aVal = (a as Record<string, unknown>)[sort.field];
    const bVal = (b as Record<string, unknown>)[sort.field];

    // Date sort
    if (col?.filterType === 'date') {
      const aDate = new Date(String(aVal)).getTime();
      const bDate = new Date(String(bVal)).getTime();
      return sort.asc ? aDate - bDate : bDate - aDate;
    }

    // Number sort
    if (col?.filterType === 'number') {
      const aNum = parseFloat(String(aVal));
      const bNum = parseFloat(String(bVal));
      return sort.asc ? aNum - bNum : bNum - aNum;
    }

    // String sort
    const aStr = String(aVal ?? '');
    const bStr = String(bVal ?? '');
    return sort.asc ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });

  return result;
}
