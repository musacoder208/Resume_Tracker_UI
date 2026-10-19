import { useMemo, useState, type JSX } from 'react';
import { DataGrid } from '@/components/datagrid/DataGrid';
import { createInitialGridState } from '@/components/datagrid/types/grid.state';
import type { GridState } from '@/components/datagrid/types/grid.state';
import type { GridColumnDef } from '@/components/datagrid/types/grid.types';
import { StatusBadge } from '@/components/ui/statusBadge';
import { useT } from '@/i18n/useT';
import type { ApiError } from '@/types/apiError';
import { formatDate } from '@/utils/formatters';
import { useGetAiUsageJdCandidatesQuery } from '../api/reports.api';
import type { AiUsageJdDetailParams, AiUsageTreeRow } from '../types/reports.types';
import { UsageTotalsLine, UsageTreeNameCell } from '../usageGrid';
import { formatProcessLabel, sumTotals } from '../usageGrid/usageGrid.utils';
import { usageColumns } from '../usageGrid/usageGrid.columns';

interface CandidateUsageGridProps {
  params: AiUsageJdDetailParams;
}

/** Candidates of the JD: candidate → main process (module) → sub-process (feature). */
export function CandidateUsageGrid({ params }: CandidateUsageGridProps): JSX.Element {
  const { t } = useT('reports');
  const [gridState, setGridState] = useState<GridState>(() =>
    createInitialGridState({ pagination: { pageIndex: 0, pageSize: 10 } })
  );

  const { data, isFetching, isError, error } = useGetAiUsageJdCandidatesQuery({
    ...params,
    page: gridState.pagination.pageIndex + 1,
    page_size: gridState.pagination.pageSize,
  });

  const rows = data?.list ?? [];
  const totals = data?.summary ?? sumTotals(rows);

  const columns = useMemo<GridColumnDef<AiUsageTreeRow>[]>(() => [
    {
      id: 'name',
      header: t('table.candidateProcess'),
      size: 300,
      enableSorting: false,
      cell: ({ row }) => {
        const r = row.original;
        if (r.kind !== 'candidate') {
          return (
            <UsageTreeNameCell row={row} bold={r.kind === 'module'}>
              {formatProcessLabel(t, r.label)}
            </UsageTreeNameCell>
          );
        }
        return (
          <UsageTreeNameCell row={row} bold>
            {r.label !== '' ? r.label : t('unknownCandidate', { id: r.candidateId })}
            {r.isDeleted === true && <StatusBadge label={t('deleted')} variant="error" dot={false} />}
          </UsageTreeNameCell>
        );
      },
    },
    {
      id: 'uploaded_date',
      header: t('table.uploadedDate'),
      size: 140,
      enableSorting: false,
      cell: ({ row }) =>
        row.original.kind === 'candidate' ? (
          <span className="text-xs text-text-muted">{formatDate(row.original.uploadedDate)}</span>
        ) : null,
    },
    ...usageColumns<AiUsageTreeRow>(t, (r) => (r.kind === 'feature' ? 6 : 4)),
  ], [t]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-text">
          {t('sections.candidates', { count: data?.totalCount ?? 0 })}
        </h3>
        <UsageTotalsLine t={t} totalTokens={totals.totalTokens} totalCost={totals.totalCost} />
      </div>
      <DataGrid<AiUsageTreeRow>
        data={rows}
        columns={columns}
        totalRows={data?.totalCount ?? 0}
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
