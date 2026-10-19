import type { JSX, ReactNode } from 'react';
import type { Row } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import clsx from 'clsx';
import { GridExpandButton } from '@/components/datagrid/helpers/GridExpandButton';
import { gridTheme } from '@/components/datagrid/theme/gridTheme';
import { depthIndentClass, formatCost, formatTokens } from './usageGrid.utils';

// ── Tree name cell ────────────────────────────────────────────────────────────
// Rows are nested via DataGrid `getSubRows`. The built-in expansion column shows
// a "+" on every row, so the tree grids draw their own button here, only on rows
// that have children, indented by depth.

interface UsageTreeNameCellProps<TData> {
  row: Row<TData>;
  children: ReactNode;
  bold?: boolean;
}

export function UsageTreeNameCell<TData>({ row, children, bold = false }: UsageTreeNameCellProps<TData>): JSX.Element {
  const canExpand = row.subRows.length > 0;
  return (
    <div className={clsx('flex items-center gap-2', depthIndentClass(row.depth))}>
      {canExpand ? (
        <GridExpandButton
          expanded={row.getIsExpanded()}
          onClick={(e) => {
            e.stopPropagation();
            row.toggleExpanded();
          }}
        />
      ) : (
        <span className="w-4 shrink-0" />
      )}
      <span className={clsx('flex min-w-0 items-center gap-2 truncate text-xs text-text', bold && 'font-semibold')}>
        {children}
      </span>
    </div>
  );
}

// ── "Total Tokens : x | Total Cost : $y" line above a grid ────────────────────

interface UsageTotalsLineProps {
  t: TFunction;
  totalTokens: number;
  totalCost: number;
}

export function UsageTotalsLine({ t, totalTokens, totalCost }: UsageTotalsLineProps): JSX.Element {
  return (
    <div className={gridTheme.paginationStats}>
      {t('totals.totalTokens')} : <b className={gridTheme.paginationStatsValue}>{formatTokens(totalTokens)}</b>
      <span className={gridTheme.paginationStatsDivider}>|</span>
      {t('totals.totalCost')} : <b className={gridTheme.paginationStatsValue}>{formatCost(totalCost)}</b>
    </div>
  );
}
