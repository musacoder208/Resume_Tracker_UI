import { useMemo, useState, type JSX } from 'react';
import { DataGrid } from '@/components/datagrid/DataGrid';
import { createInitialGridState } from '@/components/datagrid/types/grid.state';
import type { GridState } from '@/components/datagrid/types/grid.state';
import type { GridColumnDef } from '@/components/datagrid/types/grid.types';
import { useT } from '@/i18n/useT';
import type { ApiError } from '@/types/apiError';
import { useGetAiUsageJdProcessesQuery } from '../api/reports.api';
import type { AiUsageJdDetailParams, AiUsageTreeRow } from '../types/reports.types';
import { UsageTotalsLine, UsageTreeNameCell } from '../usageGrid';
import { formatProcessLabel, sumTotals } from '../usageGrid/usageGrid.utils';
import { usageColumns } from '../usageGrid/usageGrid.columns';

interface JdProcessGridProps {
  params: AiUsageJdDetailParams;
}

/** JD-level AI calls: main process (module) → sub-process (feature). */
export function JdProcessGrid({ params }: JdProcessGridProps): JSX.Element {
  const { t } = useT('reports');
  const { data, isFetching, isError, error } = useGetAiUsageJdProcessesQuery(params);
  const [gridState, setGridState] = useState<GridState>(() =>
    createInitialGridState({ pagination: { pageIndex: 0, pageSize: 50 } })
  );

  const rows = data ?? [];
  const totals = sumTotals(rows);

  const columns = useMemo<GridColumnDef<AiUsageTreeRow>[]>(() => [
    {
      id: 'process',
      header: t('table.process'),
      size: 300,
      enableSorting: false,
      cell: ({ row }) => (
        <UsageTreeNameCell row={row} bold={row.original.kind === 'module'}>
          {formatProcessLabel(t, row.original.label)}
        </UsageTreeNameCell>
      ),
    },
    ...usageColumns<AiUsageTreeRow>(t, (r) => (r.kind === 'feature' ? 6 : 4)),
  ], [t]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-text">{t('sections.jdProcesses')}</h3>
        <UsageTotalsLine t={t} totalTokens={totals.totalTokens} totalCost={totals.totalCost} />
      </div>
      <DataGrid<AiUsageTreeRow>
        data={rows}
        columns={columns}
        totalRows={rows.length}
        state={gridState}
        onStateChange={setGridState}
        rowId={(row) => row.id}
        getSubRows={(row) => row.children}
        loading={isFetching}
        error={isError && (error as ApiError)?.meta?.kind !== 'auth' ? error : undefined}
        layout={{ widthMode: 'fit', height: 'auto' }}
      />
    </div>
  );
}
