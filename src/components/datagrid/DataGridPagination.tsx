import { useMemo, type JSX } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@/icons';
import { ExcelExportIcon, PdfExportIcon } from '@/icons/svg';
import { useT } from '@/i18n/useT';
import { useDataGridContext } from './DataGrid';
import { gridTheme } from './theme/gridTheme';

interface DataGridPaginationProps {
  totalRows: number;
  onExportExcel?: () => void;
  onExportPdf?: () => void;
  showStats?: boolean;
  position?: 'top' | 'bottom';
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const DataGridPagination = ({
  totalRows,
  onExportExcel,
  onExportPdf,
  showStats = false,
  position = 'bottom',
}: DataGridPaginationProps): JSX.Element => {
  const { table, enableRowSelection } = useDataGridContext<unknown>();
  const { t } = useT('common');
  const { pageIndex, pageSize } = table.getState().pagination;

  const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));
  const canPrev = pageIndex > 0;
  const canNext = pageIndex < pageCount - 1;

  const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalRows);
  const showing = totalRows === 0 ? 0 : to - from + 1;

  const selectedCount = Object.keys(table.getState().rowSelection).length;

  const pages = useMemo((): (number | '...')[] => {
    const current = pageIndex + 1;
    const visible = new Set(
      [1, pageCount, current, current - 1, current + 1].filter((p) => p >= 1 && p <= pageCount)
    );
    const sorted = [...visible].sort((a, b) => a - b);

    const result: (number | '...')[] = [];
    let prev = 0;
    for (const p of sorted) {
      if (prev > 0 && p - prev > 1) {
        result.push('...');
      }
      result.push(p);
      prev = p;
    }
    return result;
  }, [pageCount, pageIndex]);

  const goToPage = (p: number): void => {
    table.setPageIndex(p - 1);
  };

  const handlePageSizeChange = (newSize: number): void => {
    table.setPagination({ pageIndex: 0, pageSize: newSize });
  };

  return (
    <div className={position === 'top' ? gridTheme.pagination : gridTheme.paginationBottom}>

      {/* Stats — plain text with pipe dividers */}
      {showStats && (
        <div className={gridTheme.paginationStats}>
          Total Records : <b className={gridTheme.paginationStatsValue}>{totalRows}</b>
          <span className={gridTheme.paginationStatsDivider}>|</span>
          Showing : <b className={gridTheme.paginationStatsValue}>{showing}</b>
          {enableRowSelection && (
            <>
              <span className={gridTheme.paginationStatsDivider}>|</span>
              Selected : <b className={gridTheme.paginationStatsValue}>{selectedCount}</b>
            </>
          )}
        </div>
      )}

      {/* Simple showing info (when no stats) */}
      {!showStats && (
        <span className={gridTheme.paginationInfo}>
          {totalRows === 0 ? (
            t('grid.noRecords')
          ) : (
            <>
              {t('grid.showing')} <b className="text-primary font-semibold">{from}–{to}</b> {t('grid.of')} <b className="text-primary font-semibold">{totalRows}</b>
            </>
          )}
        </span>
      )}

      {/* Page buttons */}
      <div className="flex items-center gap-[3px]">
        <button
          type="button"
          className={gridTheme.paginationButton}
          disabled={!canPrev}
          onClick={() => table.previousPage()}
          aria-label={t('grid.previousPage')}
        >
          <ChevronLeftIcon className="h-2.5 w-2.5" aria-hidden="true" />
        </button>

        {pages.map((p, idx) =>
          p === '...' ? (
            <span key={`ell-${idx}`} className="px-0.5 text-[10px] text-text-subtle">…</span>
          ) : (
            <button
              key={p}
              type="button"
              className={p === pageIndex + 1 ? gridTheme.paginationButtonActive : gridTheme.paginationButton}
              onClick={() => goToPage(p)}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          className={gridTheme.paginationButton}
          disabled={!canNext}
          onClick={() => table.nextPage()}
          aria-label={t('grid.nextPage')}
        >
          <ChevronRightIcon className="h-2.5 w-2.5" aria-hidden="true" />
        </button>
      </div>

      {/* Page size */}
      <span className={gridTheme.paginationLabel}>{t('grid.rowsPerPage')}</span>
      <select
        value={pageSize}
        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
        className={gridTheme.paginationSizeSelect}
      >
        {PAGE_SIZE_OPTIONS.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>

      {/* Export buttons — right end after pagination */}
      {(onExportExcel != null || onExportPdf != null) && (
        <div className="flex items-center gap-1 ms-1 border-s border-border-muted ps-2">
          {onExportExcel != null && (
            <button
              type="button"
              onClick={onExportExcel}
              className="flex h-[20px] w-[20px] items-center justify-center rounded text-success hover:bg-success/10 transition-colors"
              title="Export Excel"
            >
              <ExcelExportIcon className="h-4 w-4" />
            </button>
          )}
          {onExportPdf != null && (
            <button
              type="button"
              onClick={onExportPdf}
              className="flex h-[20px] w-[20px] items-center justify-center rounded text-error hover:bg-error/10 transition-colors"
              title="Export PDF"
            >
              <PdfExportIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

    </div>
  );
};
