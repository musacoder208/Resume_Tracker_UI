import { useMemo, useState, type JSX } from 'react';
import { DataGrid } from '@/components/datagrid/DataGrid';
import { createInitialGridState } from '@/components/datagrid/types/grid.state';
import type { GridState } from '@/components/datagrid/types/grid.state';
import type { GridColumnDef } from '@/components/datagrid/types/grid.types';
import { useT } from '@/i18n/useT';
import type { ApiError } from '@/types/apiError';
import { exportToExcel } from '@/utils/exportToExcel';
import { useGetAiUsageJdProcessesQuery } from '../api/reports.api';
import type { AiUsageJdDetailParams, AiUsageTreeRow } from '../types/reports.types';
import { UsageGridHeader, UsageTreeNameCell } from '../usageGrid';
import { formatProcessLabel, sumTotals } from '../usageGrid/usageGrid.utils';
import { usageColumns } from '../usageGrid/usageGrid.columns';
import { flattenJdProcessRows, usageExportColumns } from '../usageGrid/usageGrid.export';

interface JdProcessGridProps {
  params: AiUsageJdDetailParams;
  /** Selected JD — written on every exported row and in the file name */
  jdName: string;
}

/** JD-level AI calls: main process (module) → sub-process (feature). */
export function JdProcessGrid({ params, jdName }: JdProcessGridProps): JSX.Element {
  const { t } = useT('reports');
  const { data, isFetching, isError, error } = useGetAiUsageJdProcessesQuery(params);
  const [gridState, setGridState] = useState<GridState>(() =>
    createInitialGridState({ pagination: { pageIndex: 0, pageSize: 50 } })
  );
  const [isExporting, setIsExporting] = useState(false);

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

  // All process rows are already loaded — export them as they are
  async function handleExportExcel(): Promise<void> {
    setIsExporting(true);
    try {
      await exportToExcel({
        fileName: t('export.jdProcessesFile', { jdName }),
        sheetName: t('sections.jdProcesses'),
        columns: usageExportColumns(t, jdName, false),
        rows: flattenJdProcessRows(t, rows),
      });
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <UsageGridHeader
        t={t}
        title={t('sections.jdProcesses')}
        totals={totals}
        onExport={() => { void handleExportExcel(); }}
        exporting={isExporting}
        exportDisabled={isFetching || rows.length === 0}
      />
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
