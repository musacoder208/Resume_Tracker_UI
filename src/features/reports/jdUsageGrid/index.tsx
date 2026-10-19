import { useMemo, useState, type JSX } from 'react';
import { DataGrid } from '@/components/datagrid/DataGrid';
import { createInitialGridState } from '@/components/datagrid/types/grid.state';
import type { GridState } from '@/components/datagrid/types/grid.state';
import type { GridColumnDef } from '@/components/datagrid/types/grid.types';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n/useT';
import { formatDate } from '@/utils/formatters';
import type { AiUsageJdRow, SelectedAiUsageJd } from '../types/reports.types';
import { formatTokens } from '../usageGrid/usageGrid.utils';
import { usageColumns } from '../usageGrid/usageGrid.columns';

interface JdUsageGridProps {
  data: AiUsageJdRow[];
  loading: boolean;
  error?: unknown;
  selectedJd: SelectedAiUsageJd | null;
  onSelectJd: (jd: SelectedAiUsageJd) => void;
}

const jdRowKey = (jdId: number | null): string => (jdId == null ? 'unassigned' : String(jdId));

export function JdUsageGrid({ data, loading, error, selectedJd, onSelectJd }: JdUsageGridProps): JSX.Element {
  const { t } = useT('reports');
  const [gridState, setGridState] = useState<GridState>(() =>
    createInitialGridState({ pagination: { pageIndex: 0, pageSize: 50 } })
  );

  const columns = useMemo<GridColumnDef<AiUsageJdRow>[]>(() => [
    {
      id: 'no',
      header: t('table.srNo'),
      size: 56,
      enableSorting: false,
      meta: { align: 'center' },
      cell: ({ row }) => <span className="text-xs text-text-muted">{row.index + 1}</span>,
    },
    {
      id: 'jd_name',
      header: t('table.jdName'),
      size: 260,
      enableSorting: false,
      cell: ({ row }) => {
        const jdName = row.original.jdName ?? t('unassigned');
        return (
          <Button
            variant="unstyled"
            size="xs"
            onClick={() => { onSelectJd({ jdId: row.original.jdId, jdName }); }}
            className="truncate font-semibold text-primary underline underline-offset-2 hover:text-primary-hover"
          >
            {jdName}
          </Button>
        );
      },
    },
    {
      id: 'created_date',
      header: t('table.createdDate'),
      size: 140,
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-xs text-text-muted">{formatDate(row.original.createdDate)}</span>
      ),
    },
    {
      id: 'candidate_count',
      header: t('table.candidates'),
      size: 100,
      enableSorting: false,
      meta: { align: 'right' },
      cell: ({ row }) => <span className="text-xs text-text">{formatTokens(row.original.candidateCount)}</span>,
    },
    ...usageColumns<AiUsageJdRow>(t),
  ], [t, onSelectJd]);

  const selectedKey = selectedJd != null ? jdRowKey(selectedJd.jdId) : null;

  return (
    <DataGrid<AiUsageJdRow>
      data={data}
      columns={columns}
      totalRows={data.length}
      state={gridState}
      onStateChange={setGridState}
      rowId={(row) => jdRowKey(row.jdId)}
      loading={loading}
      error={error}
      layout={{ widthMode: 'fit', height: 'auto' }}
      getRowClassName={(row) => (jdRowKey(row.jdId) === selectedKey ? 'bg-primary-subtle' : undefined)}
    />
  );
}
