import type { JSX, ReactNode } from 'react';
import type { Row } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import clsx from 'clsx';
import { GridExpandButton } from '@/components/datagrid/helpers/GridExpandButton';
import { gridTheme } from '@/components/datagrid/theme/gridTheme';
import { Button } from '@/components/ui/button';
import { ArrowDownTrayIcon } from '@/icons';
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

// ── Grid header: title on the left, totals + Export Excel button on the right ──

interface UsageGridHeaderProps {
  t: TFunction;
  title: string;
  /** Omit to hide the totals line */
  totals?: { totalTokens: number; totalCost: number };
  onExport: () => void;
  exporting?: boolean;
  exportDisabled?: boolean;
}

export function UsageGridHeader({
  t,
  title,
  totals,
  onExport,
  exporting = false,
  exportDisabled = false,
}: UsageGridHeaderProps): JSX.Element {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="text-sm font-semibold text-text">{title}</h3>
      <div className="flex flex-wrap items-center gap-3">
        {totals != null && (
          <UsageTotalsLine t={t} totalTokens={totals.totalTokens} totalCost={totals.totalCost} />
        )}
        <Button
          variant="secondary"
          size="sm"
          leadingIcon={<ArrowDownTrayIcon className="h-4 w-4" />}
          onClick={onExport}
          disabled={exportDisabled || exporting}
        >
          {exporting ? t('actions.exporting') : t('actions.exportExcel')}
        </Button>
      </div>
    </div>
  );
}
