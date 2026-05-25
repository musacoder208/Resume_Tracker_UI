import type { JSX } from 'react';
import { useT } from '@/i18n/useT';
import { useDataGridContext } from './DataGrid';
import { gridTheme } from './theme/gridTheme';
import { FilterClearIcon } from '@/icons/svg';

interface DataGridToolbarProps {
  loading?: boolean;
  error?: unknown;
  totalRows: number;
}

export const DataGridToolbar = ({
  loading,
  error,
  totalRows,
}: DataGridToolbarProps): JSX.Element => {
  const { t } = useT('common');
  const { table, enableRowSelection } = useDataGridContext();

  if (error !== undefined && error !== null) {
    return (
      <div className="px-3 py-2 text-xs text-error border-b border-border">
        {t('grid.failedToLoad')}
      </div>
    );
  }

  const columnFilters = table.getState().columnFilters;
  const hasActiveFilters = columnFilters.length > 0;

  const visibleRows = table.getRowModel().rows.length;
  const selectedRows = enableRowSelection
    ? Object.keys(table.getState().rowSelection).length
    : null;

  const clearAllFilters = (): void => {
    table.resetColumnFilters();
  };

  return (
    <div className={gridTheme.toolbar}>
      {/* Left — stats */}
      <div className="flex items-center gap-1 text-[11px] text-text-muted">
        <span>
          {t('grid.total')} : <b className="font-semibold text-primary">{totalRows}</b>
        </span>
        <span className="text-text-subtle mx-1.5">|</span>
        <span>
          {t('grid.showing')} : <b className="font-semibold text-primary">{visibleRows}</b>
        </span>
        {selectedRows !== null && (
          <>
            <span className="text-text-subtle mx-1.5">|</span>
            <span>
              {t('grid.selected')} : <b className="font-semibold text-primary">{selectedRows}</b>
            </span>
          </>
        )}
        {loading === true && (
          <>
            <span className="text-text-subtle mx-1.5">|</span>
            <span>{t('grid.loading')}</span>
          </>
        )}
      </div>

      {/* Right — clear filters */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="inline-flex items-center gap-1.5 rounded border border-border bg-transparent px-2 py-0.5 text-[11px] font-medium text-text-muted transition-colors hover:border-error hover:text-error hover:bg-error-subtle"
        >
          <FilterClearIcon />
          {t('grid.clearFilters')}
        </button>
      )}
    </div>
  );
};
