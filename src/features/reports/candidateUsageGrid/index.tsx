import { useMemo, useState, type JSX } from 'react';
import { DataGrid } from '@/components/datagrid/DataGrid';
import { createInitialGridState } from '@/components/datagrid/types/grid.state';
import type { GridState } from '@/components/datagrid/types/grid.state';
import type { GridColumnDef } from '@/components/datagrid/types/grid.types';
import { StatusBadge } from '@/components/ui/statusBadge';
import { useT } from '@/i18n/useT';
import type { ApiError } from '@/types/apiError';
import { exportToExcel } from '@/utils/exportToExcel';
import { formatDate } from '@/utils/formatters';
import {
  useGetAiUsageJdCandidatesQuery,
  useLazyGetAiUsageJdCandidatesQuery,
} from '../api/reports.api';
import type { AiUsageJdDetailParams, AiUsageTreeRow } from '../types/reports.types';
import { UsageGridHeader, UsageTreeNameCell } from '../usageGrid';
import { formatProcessLabel, sumTotals } from '../usageGrid/usageGrid.utils';
import { usageColumns } from '../usageGrid/usageGrid.columns';
import { flattenCandidateRows, usageExportColumns } from '../usageGrid/usageGrid.export';

interface CandidateUsageGridProps {
  params: AiUsageJdDetailParams;
  /** Selected JD — written on every exported row and in the file name */
  jdName: string;
}

/** Candidates of the JD: candidate → main process (module) → sub-process (feature). */
export function CandidateUsageGrid({ params, jdName }: CandidateUsageGridProps): JSX.Element {
  const { t } = useT('reports');
  const [gridState, setGridState] = useState<GridState>(() =>
    createInitialGridState({ pagination: { pageIndex: 0, pageSize: 10 } })
  );
  const [isExporting, setIsExporting] = useState(false);

  const { data, isFetching, isError, error } = useGetAiUsageJdCandidatesQuery({
    ...params,
    page: gridState.pagination.pageIndex + 1,
    page_size: gridState.pagination.pageSize,
  });
  const [fetchAllCandidates] = useLazyGetAiUsageJdCandidatesQuery();

  const rows = data?.list ?? [];
  const totals = data?.summary ?? sumTotals(rows);
  const totalCount = data?.totalCount ?? 0;

  // Exports every candidate of the JD, not just the current page
  async function handleExportExcel(): Promise<void> {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const allRows =
        totalCount <= rows.length
          ? rows
          : (await fetchAllCandidates({ ...params, page: 1, page_size: totalCount }).unwrap()).list;
      await exportToExcel({
        fileName: t('export.candidatesFile', { jdName }),
        sheetName: t('export.candidatesSheet'),
        columns: usageExportColumns(t, jdName, true),
        rows: flattenCandidateRows(t, allRows),
      });
    } catch {
      // API errors are shown by apiToastMiddleware
    } finally {
      setIsExporting(false);
    }
  }

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
      <UsageGridHeader
        t={t}
        title={t('sections.candidates', { count: totalCount })}
        totals={totals}
        onExport={() => { void handleExportExcel(); }}
        exporting={isExporting}
        exportDisabled={isFetching || rows.length === 0}
      />
      <DataGrid<AiUsageTreeRow>
        data={rows}
        columns={columns}
        totalRows={totalCount}
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
