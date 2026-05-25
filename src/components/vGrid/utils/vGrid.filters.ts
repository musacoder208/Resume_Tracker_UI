import type { VGridColumn, VGridFilterOperator } from '../types/vGrid.types';

export function applyClientFilters<TData>(
  data: TData[],
  columns: VGridColumn<TData>[],
  columnFilters: Record<string, string>
): TData[] {
  return data.filter((row) =>
    columns.every((col) => {
      const rawFilter = columnFilters[col.field];
      if (rawFilter == null || rawFilter === '') return true;

      const cellValue = (row as Record<string, unknown>)[col.field];
      if (cellValue === null || cellValue === undefined) return false;

      // Date
      if (col.filterType === 'date') {
        try {
          const cellDate = new Date(String(cellValue)).setHours(0, 0, 0, 0);
          const filterDate = new Date(rawFilter).setHours(0, 0, 0, 0);
          return cellDate === filterDate;
        } catch {
          return false;
        }
      }

      // Number
      if (col.filterType === 'number') {
        const parsedCell = Number(cellValue);
        const parsedFilter = Number(rawFilter);
        if (Number.isNaN(parsedCell) || Number.isNaN(parsedFilter)) return false;

        if (rawFilter.includes('.')) {
          const d = rawFilter.split('.')[1].length;
          return parsedCell.toFixed(d) === parsedFilter.toFixed(d);
        }
        return String(parsedCell).startsWith(String(parsedFilter));
      }

      // Text (default: contains)
      return String(cellValue).toLowerCase().includes(rawFilter.trim().toLowerCase());
    })
  );
}

export function matchesOperator(
  cellValue: unknown,
  filterValue: string | number | Date | null,
  operator: VGridFilterOperator
): boolean {
  if (operator === 'noFilter' || filterValue == null || filterValue === '') return true;

  const strVal = String(filterValue).toLowerCase().trim();
  const strCell = String(cellValue ?? '').toLowerCase().trim();
  const numVal = Number(filterValue);
  const numCell = Number(cellValue);

  switch (operator) {
    case 'contains': return strCell.includes(strVal);
    case 'notContains': return !strCell.includes(strVal);
    case 'startsWith': return strCell.startsWith(strVal);
    case 'endsWith': return strCell.endsWith(strVal);
    case 'equals': return strCell === strVal;
    case 'notEquals': return strCell !== strVal;
    case 'lt': return !isNaN(numCell) && !isNaN(numVal) && numCell < numVal;
    case 'lte': return !isNaN(numCell) && !isNaN(numVal) && numCell <= numVal;
    case 'gt': return !isNaN(numCell) && !isNaN(numVal) && numCell > numVal;
    case 'gte': return !isNaN(numCell) && !isNaN(numVal) && numCell >= numVal;
    case 'dateIs': return String(cellValue) === String(filterValue);
    case 'dateIsNot': return String(cellValue) !== String(filterValue);
    case 'dateBefore': return new Date(String(cellValue)) < new Date(String(filterValue));
    case 'dateAfter': return new Date(String(cellValue)) > new Date(String(filterValue));
    default: return true;
  }
}
