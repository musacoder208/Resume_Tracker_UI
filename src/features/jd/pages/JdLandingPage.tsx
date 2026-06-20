import { useState, useEffect, useMemo, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/containers/PageContainer';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select/Select';
import { DataGrid } from '@/components/datagrid/DataGrid';
import { createInitialGridState } from '@/components/datagrid/types/grid.state';
import type { GridState } from '@/components/datagrid/types/grid.state';
import type { GridColumnDef } from '@/components/datagrid/types/grid.types';
import { useT } from '@/i18n/useT';
import {
  EyeIcon, ArrowUpTrayIcon, PlusIcon, XMarkIcon,
  DocumentTextIcon, CalendarIcon, GlobeAltIcon, BuildingOffice2Icon,
} from '@/icons';
import { useGetMasterDataQuery, useLazyGetAllJDsQuery } from '../api/jd.api';
import { useGetModuleIdQuery } from '@/features/common/api/common.api';
import { JdStatCardSkeleton } from '@/components/ui/loader';
import { StatCard } from '@/components/ui/statCard';
import type { MasterDataItem, JdListItem, GetAllJDsParams, JdSortBy } from '../types/jd.types';
import type { ApiError } from '@/types/apiError';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatExperience(min: number | null, max: number | null): string {
  if (min == null && max == null) return '—';
  if (min != null && max != null) return `${min}–${max} years`;
  if (min != null) return `${min}+ years`;
  return `Up to ${max!} years`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function WorkModelBadge({ value }: { value: string | null }): JSX.Element {
  if (value == null) return <span className="text-xs text-text-muted">—</span>;
  const normalized = value.toLowerCase().replace(/[-\s]/g, '');
  const colorClass =
    normalized === 'remote' || normalized === 'fullyremote'
      ? 'bg-success/10 text-success'
      : normalized === 'hybrid'
      ? 'bg-info/10 text-info'
      : 'bg-surface-muted text-text-muted';
  const display = value.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
      {display}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function JdLandingPage(): JSX.Element {
  const { t } = useT('jd');
  const navigate = useNavigate();

  const [selectedJobTitle, setSelectedJobTitle] = useState<MasterDataItem | null>(null);
  const [selectedSeniority, setSelectedSeniority] = useState<MasterDataItem | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<MasterDataItem | null>(null);
  const [gridState, setGridState] = useState<GridState>(() =>
    createInitialGridState({ pagination: { pageIndex: 0, pageSize: 10 } })
  );

  const { data: moduleId } = useGetModuleIdQuery('JD_MODULE');
  const { data: masterData } = useGetMasterDataQuery();
  const moduleStatuses = moduleId != null ? (masterData?.statuses?.[String(moduleId)] ?? []) : [];
  const [triggerGetAllJDs, { data: jdData, isFetching, isError, error }] = useLazyGetAllJDsQuery();

  useEffect(() => {
    void triggerGetAllJDs({ page: 1, page_size: 10 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function buildParams(state: GridState, jobTitleId?: number, seniorityId?: number, statusId?: number): GetAllJDsParams {
    const sorting = state.sorting[0];
    return {
      ...(jobTitleId != null && { job_title_id: jobTitleId }),
      ...(seniorityId != null && { seniority_id: seniorityId }),
      ...(statusId != null && { status_id: statusId }),
      page: state.pagination.pageIndex + 1,
      page_size: state.pagination.pageSize,
      ...(sorting != null && {
        sort_by: sorting.id as JdSortBy,
        sort_order: sorting.desc ? 'desc' : 'asc',
      }),
    };
  }

  function handleGridStateChange(next: GridState): void {
    setGridState(next);
    void triggerGetAllJDs(buildParams(next, selectedJobTitle?.id, selectedSeniority?.id, selectedStatus?.id));
  }

  function handleSearch(): void {
    const next = { ...gridState, pagination: { ...gridState.pagination, pageIndex: 0 } };
    setGridState(next);
    void triggerGetAllJDs(buildParams(next, selectedJobTitle?.id, selectedSeniority?.id, selectedStatus?.id));
  }

  function handleClear(): void {
    setSelectedJobTitle(null);
    setSelectedSeniority(null);
    setSelectedStatus(null);
    const next = { ...gridState, pagination: { ...gridState.pagination, pageIndex: 0 } };
    setGridState(next);
    void triggerGetAllJDs(buildParams(next));
  }

  const columns = useMemo<GridColumnDef<JdListItem>[]>(() => [
    {
      id: 'no',
      header: t('landing.table.srNo'),
      enableSorting: false,
      cell: ({ row }) => <span className="text-xs text-text-muted">{row.index + 1}</span>,
    },
    {
      id: 'job_title',
      accessorKey: 'job_title',
      header: t('landing.table.jobTitle'),
      cell: ({ row }) => (
        <p className="text-xs font-semibold text-text">{row.original.job_title}</p>
      ),
    },
    {
      id: 'seniority',
      accessorKey: 'seniority',
      header: t('landing.table.seniority'),
      cell: ({ row }) => <span className="text-xs text-text">{row.original.seniority}</span>,
    },
    {
      id: 'work_model',
      accessorKey: 'work_model',
      header: t('landing.table.workType'),
      cell: ({ row }) => <WorkModelBadge value={row.original.work_model} />,
    },
    {
      id: 'min_exp',
      header: t('landing.table.experience'),
      accessorFn: (row) => formatExperience(row.min_exp, row.max_exp),
      cell: ({ row }) => (
        <span className="text-xs text-text">
          {formatExperience(row.original.min_exp, row.original.max_exp)}
        </span>
      ),
    },
    {
      id: 'resumes',
      header: t('landing.table.resumes'),
      enableSorting: false,
      cell: () => <span className="text-xs text-text-muted">—</span>,
    },
    {
      id: 'start_date',
      accessorKey: 'start_date',
      header: t('landing.table.createdDate'),
      cell: ({ row }) => (
        <span className="text-xs text-text-muted">{formatDate(row.original.start_date)}</span>
      ),
    },
    {
      id: 'actions',
      header: t('landing.table.actions'),
      enableSorting: false,
      meta: { pin: 'right' },
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Button
            variant="unstyled"
            size="xs"
            leadingIcon={<EyeIcon className="h-4 w-4" />}
            className="text-xs text-text-muted hover:text-text"
            onClick={() => { navigate(`/jd/create/${row.original.jd_id}`); }}
          >
            {t('actions.view')}
          </Button>
          <Button
            variant="unstyled"
            size="xs"
            leadingIcon={<ArrowUpTrayIcon className="h-4 w-4" />}
            className="text-xs text-text-muted hover:text-text"
            onClick={() => { navigate('/candidate/upload', { state: { jdId: row.original.jd_id.toString() } }); }}
          >
            {t('actions.upload')}
          </Button>
        </div>
      ),
    },
  ], [t, navigate]);

  const counts = jdData?.counts;
  const list = jdData?.list ?? [];

  const countBoxes = [
    { label: t('landing.counts.totalJds'),     value: counts?.totalJds ?? 0,     icon: DocumentTextIcon },
    { label: t('landing.counts.addedThisWeek'),value: counts?.addedThisWeek ?? 0, icon: CalendarIcon },
    { label: t('landing.counts.remoteRoles'),  value: counts?.remoteRoles ?? 0,  icon: GlobeAltIcon },
    { label: t('landing.counts.hybridRoles'),  value: counts?.hybridRoles ?? 0,  icon: BuildingOffice2Icon },
  ];

  return (
    <PageContainer>
      <div className="flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-base font-semibold text-text">{t('landing.title')}</h1>
            <p className="mt-0.5 text-xs text-text-muted">{t('landing.subtitle')}</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            leadingIcon={<PlusIcon className="h-4 w-4" />}
            onClick={() => { navigate('/jd/create'); }}
          >
            {t('actions.createJd')}
          </Button>
        </div>

        {/* Count boxes */}
        {isFetching && jdData == null ? (
          <JdStatCardSkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {countBoxes.map(({ label, value, icon }) => (
              <StatCard key={label} label={label} value={value} icon={icon} />
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3">

          {/* Job Title dropdown */}
          <div className="w-full sm:w-56">
            <label className="text-xs font-medium text-text-muted">{t('fields.jobTitle')}</label>
            <div className="flex items-center gap-1">
              <div className="flex-1 min-w-0">
                <Select<MasterDataItem>
                  value={selectedJobTitle}
                  onChange={setSelectedJobTitle}
                  options={masterData?.jobTitles ?? []}
                  getOptionKey={(opt) => opt.id}
                  renderValue={(opt) => <span className="text-xs text-text">{opt.name}</span>}
                  renderOption={(opt) => <span className="text-xs">{opt.name}</span>}
                  placeholder={<span className="text-xs text-text-muted">{t('landing.allJobTitles')}</span>}
                />
              </div>
              {selectedJobTitle != null && (
                <button
                  type="button"
                  onClick={() => { setSelectedJobTitle(null); }}
                  className="mt-2 rounded-md p-1 text-text-muted hover:bg-surface-muted hover:text-text"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Seniority dropdown */}
          <div className="w-full sm:w-56">
            <label className="text-xs font-medium text-text-muted">{t('fields.seniorityLevel')}</label>
            <div className="flex items-center gap-1">
              <div className="flex-1 min-w-0">
                <Select<MasterDataItem>
                  value={selectedSeniority}
                  onChange={setSelectedSeniority}
                  options={masterData?.seniorities ?? []}
                  getOptionKey={(opt) => opt.id}
                  renderValue={(opt) => <span className="text-xs text-text">{opt.name}</span>}
                  renderOption={(opt) => <span className="text-xs">{opt.name}</span>}
                  placeholder={<span className="text-xs text-text-muted">{t('landing.allSeniorities')}</span>}
                />
              </div>
              {selectedSeniority != null && (
                <button
                  type="button"
                  onClick={() => { setSelectedSeniority(null); }}
                  className="mt-2 rounded-md p-1 text-text-muted hover:bg-surface-muted hover:text-text"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Status dropdown */}
          <div className="w-full sm:w-56">
            <label className="text-xs font-medium text-text-muted">{t('fields.status')}</label>
            <div className="flex items-center gap-1">
              <div className="flex-1 min-w-0">
                <Select<MasterDataItem>
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  options={moduleStatuses}
                  getOptionKey={(opt) => opt.id}
                  renderValue={(opt) => <span className="text-xs text-text">{opt.name}</span>}
                  renderOption={(opt) => <span className="text-xs">{opt.name}</span>}
                  placeholder={<span className="text-xs text-text-muted">{t('landing.allStatuses')}</span>}
                />
              </div>
              {selectedStatus != null && (
                <button
                  type="button"
                  onClick={() => { setSelectedStatus(null); }}
                  className="mt-2 rounded-md p-1 text-text-muted hover:bg-surface-muted hover:text-text"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Search & Clear buttons */}
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSearch}
              disabled={isFetching}
            >
              {t('actions.search')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClear}
              disabled={isFetching}
            >
              {t('actions.clearFilters')}
            </Button>
          </div>

        </div>

        {/* DataGrid */}
        <DataGrid<JdListItem>
          data={list}
          columns={columns}
          totalRows={counts?.totalCount ?? 0}
          state={gridState}
          onStateChange={handleGridStateChange}
          rowId={(row) => String(row.jd_id)}
          loading={isFetching}
          enableSorting
          error={isError && (error as ApiError)?.meta?.kind !== 'auth' ? error : undefined}
          layout={{ widthMode: 'fit' }}
        />

      </div>
    </PageContainer>
  );
}
