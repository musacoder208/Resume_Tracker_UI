/* @react-compiler-disable */

import { Fragment, type JSX } from 'react';
import clsx from 'clsx';
import { useDataGridContext } from './DataGrid';
import { DataGridCell } from './DataGridCell';
import { GridEmptyState } from './helpers/GridEmptyState';
import { GridLoadingRow } from './helpers/GridLoadingRow';
import { useVirtualizedServerRows } from './hooks/useVirtualizedServerRows';
import { gridTheme } from './theme/gridTheme';

export const DataGridBody = (): JSX.Element => {
  const {
    table,
    scrollContainerRef,
    enableVirtualization,
    enableRowSelection,
    enableRowExpansion,
    loading,
    renderExpandedRow,
  } = useDataGridContext<unknown>();

  const rows = table.getRowModel().rows;
  const visibleColumnCount = table.getVisibleLeafColumns().length;

  const pageIndex = table.getState().pagination.pageIndex;
  const firstRowId = rows[0]?.id ?? '';
  const dataKey = `${pageIndex}-${rows.length}-${firstRowId}`;

  const {
    virtualRows,
    paddingTop,
    paddingBottom,
  } = useVirtualizedServerRows({
    rows,
    parentRef: scrollContainerRef,
    estimateRowHeight: 38,
    overscan: 8,
    dataKey,
  });

  const visibleRows = enableVirtualization ? virtualRows : rows;

  const renderRow = (row: (typeof rows)[number]): JSX.Element => {
    const isSelected: boolean = Boolean(row.getIsSelected());
    const isExpanded: boolean = enableRowExpansion && row.getIsExpanded();

    return (
      <Fragment key={row.id}>
        <tr
          className={clsx(
            gridTheme.tr,
            isSelected && gridTheme.trSelected,
            enableRowSelection && 'cursor-pointer',
          )}
          onClick={enableRowSelection ? () => row.toggleSelected() : undefined}
        >
          {row.getVisibleCells().map((cell) => (
            <DataGridCell key={cell.id} cell={cell} isRowSelected={isSelected} />
          ))}
        </tr>

        {/* Expand detail row */}
        {isExpanded && renderExpandedRow != null && (
          <tr className={gridTheme.expandRow}>
            <td
              colSpan={visibleColumnCount}
              className={gridTheme.expandCell}
            >
              {renderExpandedRow(row)}
            </td>
          </tr>
        )}
      </Fragment>
    );
  };

  let bodyContent: JSX.Element;

  if (loading === true) {
    bodyContent = <GridLoadingRow />;
  } else if (visibleRows.length === 0) {
    bodyContent = <GridEmptyState />;
  } else if (!enableVirtualization) {
    bodyContent = <>{rows.map(renderRow)}</>;
  } else {
    bodyContent = (
      <>
        {paddingTop > 0 && (
          <tr><td colSpan={999} style={{ height: paddingTop }} /></tr>
        )}
        {virtualRows.map(renderRow)}
        {paddingBottom > 0 && (
          <tr><td colSpan={999} style={{ height: paddingBottom }} /></tr>
        )}
      </>
    );
  }

  return (
    <tbody className={gridTheme.tbody}>
      {bodyContent}
    </tbody>
  );
};
