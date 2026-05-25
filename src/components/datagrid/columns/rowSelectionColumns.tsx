import type { ColumnDef } from '@tanstack/react-table';
import { GridCheckbox } from '../helpers/GridCheckbox';
import { GridExpandButton } from '../helpers/GridExpandButton';

export const rowSelectionColumn = <TData,>(): ColumnDef<TData> => ({
  id: '__select',
  size: 36,
  enableSorting: false,
  enableColumnFilter: false,
  enableHiding: false,
  meta: {
    pin: 'left' as const,
    align: 'center' as const,
    cellClassName: 'p-0',
    headerClassName: 'p-0',
  },

  header: ({ table }) => (
    <div
      className="flex h-9 w-full items-center justify-center"
      onClick={(e) => e.stopPropagation()}
    >
      <GridCheckbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
        onChange={(checked) => table.toggleAllPageRowsSelected(checked)}
      />
    </div>
  ),

  cell: ({ row }) => (
    <div
      className="flex h-[28px] w-full items-center justify-center"
      onClick={(e) => e.stopPropagation()}
    >
      <GridCheckbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={(checked) => row.toggleSelected(checked)}
      />
    </div>
  ),
});

export const rowExpansionColumn = <TData,>(): ColumnDef<TData> => ({
  id: '__expand',
  size: 36,
  enableSorting: false,
  enableColumnFilter: false,
  enableHiding: false,
  meta: {
    pin: 'left' as const,
    align: 'center' as const,
    cellClassName: 'p-0',
    headerClassName: 'p-0',
  },

  header: () => null,

  cell: ({ row }) => (
    <div className="flex h-[28px] w-full items-center justify-center">
      <GridExpandButton
        expanded={row.getIsExpanded()}
        onClick={(e) => {
          e.stopPropagation();
          row.toggleExpanded();
        }}
      />
    </div>
  ),
});
