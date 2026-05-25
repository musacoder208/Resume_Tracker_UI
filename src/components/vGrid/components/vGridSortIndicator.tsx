import type { JSX } from 'react';
import type { VGridSortState } from '../types/vGrid.types';
import clsx from 'clsx';

interface Props {
  sort: VGridSortState | null;
  field: string;
}

export function VGridSortIndicator({ sort, field }: Props): JSX.Element {
  const isActive = sort?.field === field;
  const isAsc = isActive && sort.asc;
  const isDesc = isActive && !sort.asc;

  return (
    <span
      className={clsx(
        'flex-shrink-0 inline-flex items-center ms-1',
        isActive ? 'text-primary' : 'text-text-subtle',
      )}
    >
      <svg viewBox="0 0 12 14" width="10" height="10" fill="currentColor" aria-hidden="true">
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
}
