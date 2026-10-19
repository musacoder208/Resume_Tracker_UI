import type { JSX } from 'react';
import type { TFunction } from 'i18next';
import clsx from 'clsx';
import type { GridColumnDef } from '@/components/datagrid/types/grid.types';
import type { AiUsageTotals } from '../types/reports.types';
import { formatCost, formatTokens } from './usageGrid.utils';

/** Calls / Failed / Input / Output / Total tokens / Cost columns — same on every grid. */
export function usageColumns<TData extends AiUsageTotals>(
  t: TFunction,
  costDecimals: (row: TData) => 4 | 6 = () => 4
): GridColumnDef<TData>[] {
  const num = (value: number): JSX.Element => <span className="text-xs text-text">{formatTokens(value)}</span>;
  return [
    {
      id: 'calls',
      header: t('table.calls'),
      size: 80,
      enableSorting: false,
      meta: { align: 'right' },
      cell: ({ row }) => num(row.original.calls),
    },
    {
      id: 'failed_calls',
      header: t('table.failed'),
      size: 80,
      enableSorting: false,
      meta: { align: 'right' },
      cell: ({ row }) => (
        <span className={clsx('text-xs', row.original.failedCalls > 0 ? 'font-semibold text-error' : 'text-text-muted')}>
          {formatTokens(row.original.failedCalls)}
        </span>
      ),
    },
    {
      id: 'input_tokens',
      header: t('table.inputTokens'),
      size: 120,
      enableSorting: false,
      meta: { align: 'right' },
      cell: ({ row }) => num(row.original.inputTokens),
    },
    {
      id: 'output_tokens',
      header: t('table.outputTokens'),
      size: 120,
      enableSorting: false,
      meta: { align: 'right' },
      cell: ({ row }) => num(row.original.outputTokens),
    },
    {
      id: 'total_tokens',
      header: t('table.totalTokens'),
      size: 120,
      enableSorting: false,
      meta: { align: 'right' },
      cell: ({ row }) => num(row.original.totalTokens),
    },
    {
      id: 'total_cost',
      header: t('table.cost'),
      size: 110,
      enableSorting: false,
      meta: { align: 'right' },
      cell: ({ row }) => (
        <span className="text-xs font-medium text-text">
          {formatCost(row.original.totalCost, costDecimals(row.original))}
        </span>
      ),
    },
  ];
}
