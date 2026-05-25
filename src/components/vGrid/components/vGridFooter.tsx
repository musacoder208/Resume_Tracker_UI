import type { JSX } from 'react';
import { useT } from '@/i18n/useT';
import { ExcelExportIcon, PdfExportIcon } from '@/icons/svg';
import { vGridTheme } from '../theme/vGridTheme';

interface Props {
  totalRecords: number;
  showing: number;
  selectedCount: number;
  pageSize: number;
  pageSizeOptions: number[];
  onPageSizeChange: (size: number) => void;
  onExportExcel?: () => void;
  onExportPdf?: () => void;
  loading?: boolean;
  position?: 'top' | 'bottom';
  clientMode?: boolean;
}

export function VGridFooter({
  totalRecords,
  showing,
  selectedCount,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  onExportExcel,
  onExportPdf,
  loading,
  position = 'bottom',
  clientMode = false,
}: Props): JSX.Element {
  const { t } = useT('common');

  return (
    <div className={position === 'top' ? vGridTheme.headerBar : vGridTheme.footer}>
      {/* Stats */}
      <div className={vGridTheme.footerStats}>
        Total Records : <b className={vGridTheme.footerStatsValue}>{totalRecords}</b>
        <span className={vGridTheme.footerStatsDivider}>|</span>
        Showing : <b className={vGridTheme.footerStatsValue}>{showing}</b>
        <span className={vGridTheme.footerStatsDivider}>|</span>
        Selected : <b className={vGridTheme.footerStatsValue}>{selectedCount}</b>
        {!clientMode && loading === true && (
          <>
            <span className={vGridTheme.footerStatsDivider}>|</span>
            <span className="flex items-center gap-1 animate-pulse">
              <span className={vGridTheme.loadingSpinner} />
              {t('grid.loading')}
            </span>
          </>
        )}
      </div>

      {/* Bottom: scroll note (server mode only) */}
      {position === 'bottom' && !clientMode && totalRecords > showing && (
        <span className="text-[10px] text-text-subtle">
          Scroll Down To Load More ↓
        </span>
      )}

      {/* Top: page size (server mode only) + export */}
      {position === 'top' && (
        <>
          {!clientMode && (
            <>
              <span className={vGridTheme.footerLabel}>{t('grid.rowsPerPage')}</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className={vGridTheme.footerSelect}
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </>
          )}

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
        </>
      )}
    </div>
  );
}
