/* @react-compiler-disable */

import { flexRender } from '@tanstack/react-table';
import { useDataGridContext } from './DataGrid';
import { GridSortIndicator } from './helpers/GridSortIndicator';
import { Fragment, type JSX } from 'react';
import { GridAdvancedColumnFilter } from './helpers/GridAdvancedColumnFilter';
import { gridTheme } from './theme/gridTheme';
import type { GridColumnMeta } from './types/grid.types';
import clsx from 'clsx';

export const DataGridHeader = (): JSX.Element => {
  const {
    table,
    layout,
    enableColumnFilters,
    enableSorting,
    lastPinnedColumnId,
    pinnedLeftOffsets,
    firstRightPinnedColumnId,
    pinnedRightOffsets,
  } = useDataGridContext<unknown>();
  const sorting = table.getState().sorting;

  const isFit = layout?.widthMode === 'fit';

  return (
    <thead>
      {table.getHeaderGroups().map((group) => (
        <Fragment key={group.id}>
          {/* Header row */}
          <tr className={gridTheme.headerRow}>
            {group.headers.map((header) => {
              const canSort: boolean = enableSorting && header.column.getCanSort();
              const meta = header.column.columnDef.meta as GridColumnMeta | undefined;
              const isPinnedLeft = meta?.pin === 'left';
              const isPinnedRight = meta?.pin === 'right';
              const isLastPinned = header.column.id === lastPinnedColumnId;
              const isFirstRightPinned = header.column.id === firstRightPinnedColumnId;

              return (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  style={{
                    width: header.getSize(),
                    ...(isPinnedLeft ? { insetInlineStart: pinnedLeftOffsets[header.column.id] ?? 0 } : {}),
                    ...(isPinnedRight ? { insetInlineEnd: pinnedRightOffsets[header.column.id] ?? 0 } : {}),
                  }}
                  className={clsx(
                    gridTheme.thBase,
                    isFit ? gridTheme.wrap : gridTheme.nowrap,
                    meta?.align === 'right' ? 'text-end' : meta?.align === 'center' ? 'text-center' : 'text-start',
                    isPinnedLeft && gridTheme.thPinned,
                    isPinnedRight && gridTheme.thPinnedRight,
                    isLastPinned && gridTheme.lastPinnedBorder,
                    isFirstRightPinned && gridTheme.firstRightPinnedBorder,
                    meta?.headerClassName,
                  )}
                >
                  {header.isPlaceholder !== true ? (
                    <div
                      className={canSort === true
                        ? 'flex items-center gap-1 cursor-pointer select-none'
                        : 'flex items-center gap-1'}
                      onClick={canSort === true ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <span className="truncate">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </span>
                      {canSort === true && (
                        <GridSortIndicator sorting={sorting} columnId={header.column.id} />
                      )}
                    </div>
                  ) : null}
                </th>
              );
            })}
          </tr>

          {/* Filter row — inside thead, scrolls with header as a unit */}
          {enableColumnFilters && (
            <tr className={gridTheme.filterRow}>
              {group.headers.map((header) => {
                const canFilter: boolean = header.column.getCanFilter();
                const meta = header.column.columnDef.meta as GridColumnMeta | undefined;
                const isPinnedLeft = meta?.pin === 'left';
                const isPinnedRight = meta?.pin === 'right';
                const isLastPinned = header.column.id === lastPinnedColumnId;
                const isFirstRightPinned = header.column.id === firstRightPinnedColumnId;

                return (
                  <th
                    key={`${header.id}-filter`}
                    colSpan={header.colSpan}
                    style={{
                      width: header.getSize(),
                      ...(isPinnedLeft ? { insetInlineStart: pinnedLeftOffsets[header.column.id] ?? 0 } : {}),
                      ...(isPinnedRight ? { insetInlineEnd: pinnedRightOffsets[header.column.id] ?? 0 } : {}),
                    }}
                    className={clsx(
                      gridTheme.filterCell,
                      isPinnedLeft && gridTheme.thPinnedFilter,
                      isPinnedRight && gridTheme.thPinnedRightFilter,
                      isLastPinned && gridTheme.lastPinnedBorder,
                      isFirstRightPinned && gridTheme.firstRightPinnedBorder,
                    )}
                  >
                    {canFilter === true && header.isPlaceholder === false ? (
                      <GridAdvancedColumnFilter column={header.column} />
                    ) : null}
                  </th>
                );
              })}
            </tr>
          )}
        </Fragment>
      ))}
    </thead>
  );
};
