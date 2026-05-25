import type { SortingState } from '@tanstack/react-table';
import type { JSX } from 'react';
import clsx from 'clsx';

interface GridSortIndicatorProps {
  sorting: SortingState;
  columnId: string;
}

export const GridSortIndicator = ({
  sorting,
  columnId,
}: GridSortIndicatorProps): JSX.Element => {
  const entry = sorting.find((s) => s.id === columnId);
  const isAsc = entry != null && !entry.desc;
  const isDesc = entry != null && entry.desc;
  const isActive = entry != null;

  return (
    <span
      className={clsx(
        'flex-shrink-0 inline-flex items-center',
        isActive ? 'text-primary' : 'text-text-subtle',
      )}
    >
      <svg viewBox="0 0 12 14" width="12" height="12" fill="currentColor" aria-hidden="true">
        <path
          className={clsx('transition-opacity', isAsc ? 'opacity-100' : 'opacity-25')}
          d="M6 1L2 6h8L6 1z"
        />
        <path
          className={clsx('transition-opacity', isDesc ? 'opacity-100' : 'opacity-25')}
          d="M6 13L2 8h8l-4 5z"
        />
      </svg>
    </span>
  );
};
