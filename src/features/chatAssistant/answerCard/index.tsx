import { useMemo, useState } from 'react';
import { DataGrid } from '@/components/datagrid/DataGrid';
import { createInitialGridState } from '@/components/datagrid/types/grid.state';
import type { GridColumnDef } from '@/components/datagrid/types/grid.types';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer/MarkdownRenderer';
import { Button } from '@/components/ui/button';
import { ArrowDownTrayIcon, ChevronDownIcon, ChevronUpIcon } from '@/icons';
import { useT } from '@/i18n/useT';
import { exportToExcel, type ExcelColumn } from '@/utils/exportToExcel';
import type { ChatResponse, ChatResult, ChatResultRow, ChatExportRow } from '../types/chatAssistant.types';
import { ResponseDetails } from '../responseDetails';

const PAGE_SIZE = 10;
const EMPTY_CELL = '—';

interface AnswerCardProps {
  response: ChatResponse;
}

/** status "answer": message + result table + details (collapsed) + how it was calculated */
export function AnswerCard({ response }: AnswerCardProps) {
  const { t } = useT('chatAssistant');
  const [showHow, setShowHow] = useState(false);
  const [exporting, setExporting] = useState(false);
  const result = response.result;
  const summary = result?.summary ?? '';
  const canExport = response.needExcel && result != null && result.columns.length > 0 && result.exportRows.length > 0;

  // Builds the .xlsx in the browser from every row Python sent (same column names as the table)
  async function handleExportExcel(): Promise<void> {
    if (result == null) return;
    setExporting(true);
    try {
      const columns: ExcelColumn<ChatExportRow>[] = result.columns.map((column) => ({
        header: column.label,
        value: (row) => row[column.key],
      }));
      await exportToExcel({
        // en-CA formats the date as YYYY-MM-DD
        fileName: t('answer.exportFileName', { date: new Date().toLocaleDateString('en-CA') }),
        sheetName: t('answer.exportSheetName'),
        columns,
        rows: result.exportRows,
      });
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {response.message !== '' && <MarkdownRenderer content={response.message} />}
      {summary !== '' && summary !== response.message && <MarkdownRenderer content={summary} />}

      {result != null && result.columns.length > 0 && result.rows.length > 0 && <ResultTable result={result} />}

      {canExport && (
        <div className="flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            leadingIcon={<ArrowDownTrayIcon className="size-4" aria-hidden="true" />}
            disabled={exporting}
            onClick={() => { void handleExportExcel(); }}
          >
            {exporting ? t('answer.exporting') : t('answer.exportExcel')}
          </Button>
        </div>
      )}

      {result != null && result.rowCount > result.rows.length && (
        <p className="text-xs text-text-muted">
          {t('answer.rowsShown', {
            shown: result.rows.length.toLocaleString(),
            total: result.rowCount.toLocaleString(),
          })}
        </p>
      )}
      {result?.truncated === true && (
        <p className="text-xs text-warning-text">
          {t('answer.truncated', { shown: result.rows.length.toLocaleString() })}
        </p>
      )}

      <ResponseDetails
        correctionReason={response.needsCorrection ? response.correctionReason : ''}
        assumptions={response.assumptions}
        notes={response.notes}
      />

      {result != null && result.howCalculated !== '' && (
        <div>
          <Button
            variant="unstyled"
            size="xs"
            className="gap-1 px-0 text-primary hover:text-primary-hover"
            aria-expanded={showHow}
            onClick={() => { setShowHow((v) => !v); }}
            trailingIcon={
              showHow
                ? <ChevronUpIcon className="size-4" aria-hidden="true" />
                : <ChevronDownIcon className="size-4" aria-hidden="true" />
            }
          >
            {showHow ? t('answer.hideHowCalculated') : t('answer.howCalculated')}
          </Button>
          {showHow && (
            <p className="mt-1 whitespace-pre-wrap rounded-md bg-surface-muted px-3 py-2 text-xs text-text-muted">
              {result.howCalculated}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface ResultTableProps {
  result: ChatResult;
}

function ResultTable({ result }: ResultTableProps) {
  const [gridState, setGridState] = useState(() =>
    createInitialGridState({ pagination: { pageIndex: 0, pageSize: PAGE_SIZE } })
  );

  const columns = useMemo<GridColumnDef<ChatResultRow>[]>(
    () =>
      result.columns.map((column) => ({
        id: column.key,
        header: column.label,
        enableSorting: false,
        accessorFn: (row) => row[column.key],
        cell: ({ row }) => {
          const value = row.original[column.key];
          return value === ''
            ? <span className="text-xs text-text-disabled">{EMPTY_CELL}</span>
            : <span className="text-xs text-text">{value}</span>;
        },
      })),
    [result.columns]
  );

  // DataGrid paginates manually (server-side) — the rows of the current page are cut here
  const pagedRows = useMemo(() => {
    const { pageIndex, pageSize } = gridState.pagination;
    const start = pageIndex * pageSize;
    return result.rows.slice(start, start + pageSize);
  }, [result.rows, gridState.pagination]);

  return (
    <DataGrid<ChatResultRow>
      data={pagedRows}
      columns={columns}
      totalRows={result.rows.length}
      state={gridState}
      onStateChange={setGridState}
      rowId={(row) => String(result.rows.indexOf(row))}
      showToolbar={false}
      // 'content' keeps natural column widths and scrolls sideways — results can have 15+ columns
      layout={{ widthMode: 'content', height: 'auto' }}
    />
  );
}
