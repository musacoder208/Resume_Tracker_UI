import { flexRender, type Cell } from '@tanstack/react-table';
import { GridCellContainer } from './helpers/GridCellContainer';
import type { GridColumnMeta } from './types/grid.types';
import type { JSX } from 'react';
import clsx from 'clsx';
import { gridTheme } from './theme/gridTheme';
import { useDataGridContext } from './DataGrid';

interface DataGridCellProps<TData> {
  cell: Cell<TData, unknown>;
  isRowSelected?: boolean;
}

export const DataGridCell = <TData,>({ cell, isRowSelected }: DataGridCellProps<TData>): JSX.Element => {
  const meta = cell.column.columnDef.meta as GridColumnMeta | undefined;
  const {
    layout,
    lastPinnedColumnId,
    pinnedLeftOffsets,
    firstRightPinnedColumnId,
    pinnedRightOffsets,
  } = useDataGridContext();
  const isFit = layout?.widthMode === 'fit';

  const align = meta?.align;
  const cellClassName = meta?.cellClassName;
  const isPinnedLeft = meta?.pin === 'left';
  const isPinnedRight = meta?.pin === 'right';
  const isLastPinned = cell.column.id === lastPinnedColumnId;
  const isFirstRightPinned = cell.column.id === firstRightPinnedColumnId;

  return (
    <td
      style={{
        width: cell.column.getSize(),
        ...(isPinnedLeft ? { insetInlineStart: pinnedLeftOffsets[cell.column.id] ?? 0 } : {}),
        ...(isPinnedRight ? { insetInlineEnd: pinnedRightOffsets[cell.column.id] ?? 0 } : {}),
      }}
      className={clsx(
        gridTheme.tdBase,
        isFit ? gridTheme.wrap : gridTheme.nowrap,
        align === 'right' && gridTheme.tdNumeric,
        isRowSelected === true && !isPinnedLeft && !isPinnedRight && gridTheme.tdSelected,
        isPinnedLeft && (isRowSelected === true ? gridTheme.tdPinnedSelected : gridTheme.tdPinned),
        isPinnedRight && (isRowSelected === true ? gridTheme.tdPinnedRightSelected : gridTheme.tdPinnedRight),
        isLastPinned && gridTheme.lastPinnedBorder,
        isFirstRightPinned && gridTheme.firstRightPinnedBorder,
        cellClassName,
      )}
    >
      <GridCellContainer align={align}>
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </GridCellContainer>
    </td>
  );
};
