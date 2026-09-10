import { useMemo, type JSX } from 'react';
import { DataGrid } from '@/components/datagrid/DataGrid';
import { createInitialGridState } from '@/components/datagrid/types/grid.state';
import type { GridState } from '@/components/datagrid/types/grid.state';
import type { GridColumnDef } from '@/components/datagrid/types/grid.types';
import { Button } from '@/components/ui/button';
import { EyeIcon } from '@/icons';
import { useT } from '@/i18n/useT';
import type { CandidateListItem } from '../types/candidate.types';
import { HrStatusIcon } from '../hrStatusIcon';

const fmt = (n: number): number => parseFloat(n.toFixed(2));

// DataGrid's shared table hook always runs with manualSorting: true (same as
// the JD grid) — it never sorts data itself, it trusts whatever order it's
// given. So "client-side sorting" means sorting the array ourselves before
// handing it to DataGrid, rather than sending sort_by/sort_order to the API.
// Nulls sort last regardless of direction so unscored candidates don't jump
// to the top on a descending score sort.
type SortableColumn = 'fullName' | 'currentJobTitle' | 'email' | 'phone' | 'totalExperience' | 'finalScore';

const SORT_ACCESSORS: Record<SortableColumn, (c: CandidateListItem) => string | number | null> = {
  fullName: (c) => c.fullName,
  currentJobTitle: (c) => c.currentJobTitle,
  email: (c) => c.email,
  phone: (c) => c.phone,
  totalExperience: (c) => c.totalExperience,
  finalScore: (c) => c.finalScore,
};

function isSortableColumn(key: string): key is SortableColumn {
  return key in SORT_ACCESSORS;
}

function compareCandidates(a: CandidateListItem, b: CandidateListItem, key: SortableColumn, desc: boolean): number {
  const av = SORT_ACCESSORS[key](a);
  const bv = SORT_ACCESSORS[key](b);
  if (av == null && bv == null) return 0;
  if (av == null) return 1;
  if (bv == null) return -1;
  const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
  return desc ? -cmp : cmp;
}

interface CandidateGridViewProps {
  candidates: CandidateListItem[];
  totalRows: number;
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  isFetching: boolean;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onView: (candidate: CandidateListItem) => void;
}

// Table/grid alternative to CandidateListCard, reusing the same shared
// DataGrid component the JD Landing page uses. Pagination is server-driven
// (via the URL-based `page` state CandidateSearchPage already owns), but
// sorting is applied entirely client-side on the current page's rows — no
// sort param is sent to the API. That also means sorting only reorders the
// rows on the currently loaded page, not the full result set across pages,
// since only one page of data is ever loaded at a time.
//
// The score column intentionally shows only the number (or "-" when unscored)
// — no verdict badge/"Pending Scoring" label. That richer presentation stays
// in CandidateListCard for the card view; it is not duplicated here.
export function CandidateGridView({
  candidates,
  totalRows,
  page,
  pageSize,
  sortBy,
  sortOrder,
  isFetching,
  onPageChange,
  onSortChange,
  onView,
}: CandidateGridViewProps): JSX.Element {
  const { t } = useT('candidate');

  const sortedCandidates = useMemo(() => {
    if (!isSortableColumn(sortBy)) return candidates;
    return [...candidates].sort((a, b) => compareCandidates(a, b, sortBy, sortOrder === 'desc'));
  }, [candidates, sortBy, sortOrder]);

  const gridState = useMemo<GridState>(
    () => createInitialGridState({
      pagination: { pageIndex: page - 1, pageSize },
      sorting: sortBy !== '' ? [{ id: sortBy, desc: sortOrder === 'desc' }] : [],
    }),
    [page, pageSize, sortBy, sortOrder],
  );

  function handleStateChange(next: GridState): void {
    const nextPage = next.pagination.pageIndex + 1;
    if (nextPage !== page) onPageChange(nextPage);

    const nextSort = next.sorting[0];
    const nextSortBy = nextSort?.id ?? '';
    const nextSortOrder: 'asc' | 'desc' = nextSort?.desc ? 'desc' : 'asc';
    if (nextSortBy !== sortBy || nextSortOrder !== sortOrder) onSortChange(nextSortBy, nextSortOrder);
  }

  const columns = useMemo<GridColumnDef<CandidateListItem>[]>(() => [
    {
      id: 'srNo',
      header: t('grid.srNo'),
      enableSorting: false,
      size: 48,
      minSize: 48,
      meta: { align: 'center' },
      cell: ({ row }) => (
        <span className="text-xs text-text-muted">{(page - 1) * pageSize + row.index + 1}</span>
      ),
    },
    {
      id: 'hrStatus',
      header: t('grid.status'),
      enableSorting: false,
      size: 56,
      minSize: 56,
      meta: { align: 'center' },
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <HrStatusIcon code={row.original.hrStatusCode} label={row.original.hrStatusLabel} />
        </div>
      ),
    },
    {
      id: 'fullName',
      accessorKey: 'fullName',
      header: t('grid.name'),
      cell: ({ row }) => <span className="text-xs font-semibold text-text">{row.original.fullName}</span>,
    },
    {
      id: 'currentJobTitle',
      accessorKey: 'currentJobTitle',
      header: t('grid.jobTitle'),
      cell: ({ row }) => <span className="text-xs text-text">{row.original.currentJobTitle !== '' ? row.original.currentJobTitle : '—'}</span>,
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: t('grid.email'),
      cell: ({ row }) => (
        <span className="truncate text-xs text-text">{row.original.email !== '' ? row.original.email : '—'}</span>
      ),
    },
    {
      id: 'phone',
      accessorKey: 'phone',
      header: t('grid.mobile'),
      cell: ({ row }) => <span className="text-xs text-text">{row.original.phone !== '' ? row.original.phone : '—'}</span>,
    },
    {
      id: 'totalExperience',
      accessorKey: 'totalExperience',
      header: t('grid.experience'),
      cell: ({ row }) => (
        <span className="text-xs text-text">{row.original.totalExperience} {t('listCard.exp')}</span>
      ),
    },
    {
      id: 'finalScore',
      accessorKey: 'finalScore',
      header: t('grid.score'),
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-text">
          {row.original.finalScore != null ? `${fmt(row.original.finalScore)}%` : '-'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: t('grid.actions'),
      enableSorting: false,
      size: 56,
      minSize: 56,
      meta: { pin: 'right', align: 'center' },
      cell: ({ row }) => (
        <Button
          variant="unstyled"
          size="xs"
          circular
          title={t('actions.view')}
          aria-label={t('actions.view')}
          className="text-text-muted hover:text-primary"
          leadingIcon={<EyeIcon className="h-4 w-4" />}
          onClick={() => { onView(row.original); }}
        />
      ),
    },
  ], [t, page, pageSize, onView]);

  return (
    <DataGrid<CandidateListItem>
      data={sortedCandidates}
      columns={columns}
      totalRows={totalRows}
      state={gridState}
      onStateChange={handleStateChange}
      rowId={(row) => String(row.candidateId)}
      loading={isFetching}
      enableSorting
      layout={{ widthMode: 'fit' }}
    />
  );
}
