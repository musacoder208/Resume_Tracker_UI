import { useMemo, type JSX } from 'react';
import clsx from 'clsx';
import { useT } from '@/i18n/useT';
import { Button } from '@/components/ui/button';
import { SelectNative } from '@/components/ui/select';
import { ChevronLeftIcon, ChevronRightIcon } from '@/icons';

export interface PaginationProps {
  /** Current page, 1-based */
  page: number;
  pageSize: number;
  /** Total rows across all pages */
  totalCount: number;
  pageSizeOptions: readonly number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  disabled?: boolean;
  className?: string;
}

type PageItem = number | 'ellipsis';

// First, last, current and its neighbours — gaps collapse into an ellipsis.
function getPageItems(current: number, total: number): PageItem[] {
  const visible = [...new Set([1, total, current - 1, current, current + 1])]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const items: PageItem[] = [];
  let prev = 0;
  for (const p of visible) {
    if (prev > 0 && p - prev > 1) items.push('ellipsis');
    items.push(p);
    prev = p;
  }
  return items;
}

export function Pagination({
  page,
  pageSize,
  totalCount,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
  disabled = false,
  className,
}: PaginationProps): JSX.Element {
  const { t } = useT('common');

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);
  const pageItems = useMemo(() => getPageItems(page, totalPages), [page, totalPages]);

  return (
    <div
      className={clsx(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
        <span>
          {totalCount === 0 ? (
            t('grid.noRecords')
          ) : (
            <>
              {t('grid.showing')}{' '}
              <b className="font-semibold text-text">
                {from}–{to}
              </b>{' '}
              {t('grid.of')} <b className="font-semibold text-text">{totalCount}</b>
            </>
          )}
        </span>

        <label className="flex items-center gap-1.5">
          <span className="whitespace-nowrap">{t('grid.rowsPerPage')}</span>
          <SelectNative
            value={pageSize}
            disabled={disabled}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
            }}
            className="py-1! ps-2! pe-7! text-xs!"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </SelectNative>
        </label>
      </div>

      <nav className="flex flex-wrap items-center gap-1">
        <Button
          variant="secondary"
          size="xs"
          disabled={disabled || page <= 1}
          aria-label={t('grid.previousPage')}
          onClick={() => {
            onPageChange(page - 1);
          }}
          leadingIcon={<ChevronLeftIcon className="h-3.5 w-3.5 rtl:-scale-x-100" />}
        />

        {pageItems.map((item, idx) =>
          item === 'ellipsis' ? (
            <span key={`ellipsis-${String(idx)}`} className="px-1 text-xs text-text-muted">
              …
            </span>
          ) : (
            <Button
              key={item}
              variant={item === page ? 'primary' : 'secondary'}
              size="xs"
              disabled={disabled}
              aria-current={item === page ? 'page' : undefined}
              className="min-w-7"
              onClick={() => {
                if (item !== page) onPageChange(item);
              }}
            >
              {item}
            </Button>
          )
        )}

        <Button
          variant="secondary"
          size="xs"
          disabled={disabled || page >= totalPages}
          aria-label={t('grid.nextPage')}
          onClick={() => {
            onPageChange(page + 1);
          }}
          leadingIcon={<ChevronRightIcon className="h-3.5 w-3.5 rtl:-scale-x-100" />}
        />
      </nav>
    </div>
  );
}
