import { useMemo, useState, type JSX } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { PageContainer } from '@/components/containers/PageContainer';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/statusBadge';
import { useConfirm } from '@/components/ui/confirm/ConfirmProvider';
import { DataGrid } from '@/components/datagrid/DataGrid';
import { createInitialGridState } from '@/components/datagrid/types/grid.state';
import type { GridState } from '@/components/datagrid/types/grid.state';
import type { GridColumnDef } from '@/components/datagrid/types/grid.types';
import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InboxArrowDownIcon,
  StarIcon,
  XMarkIcon,
} from '@/icons';
import { Select } from '@/components/ui/select/Select';
import { CalendarPicker } from '@/features/candidate/interviewProcess/components/calendarPicker';
import { useGetMasterDataQuery } from '@/features/jd/api/jd.api';
import {
  useGetCallbackRequestListQuery,
  useMarkCandidateActivityCompletedMutation,
} from '../api/candidateActivity.api';
import type {
  CallbackRequestItem,
  CallbackStatusCode,
  GetCallbackRequestListParams,
} from '../types/candidateActivity.types';
import {
  getCallbackStatusBadge,
  isCallbackCompleted,
  isCallbackPending,
  parseNaiveDateTime,
} from '../utils/callbackDate';

interface ActivityStatusOption {
  id: number;
  name: string;
  code: string;
}

interface AppliedFilters {
  statusCode: CallbackStatusCode | null; // null = all statuses
  startDate: string; // 'YYYY-MM-DD', '' = all dates
}

// The list opens on Pending callbacks; Reset returns to this.
const DEFAULT_FILTERS: AppliedFilters = { statusCode: 'PENDING', startDate: '' };

// Extra dropdown option ahead of the master-data statuses — sends no status_code.
const ALL_STATUSES_OPTION: ActivityStatusOption = { id: 0, name: 'All Statuses', code: 'ALL' };

export function UserDashboardPage(): JSX.Element {
  const navigate = useNavigate();
  const confirm = useConfirm();

  // Same flow as the JD list: pick filters, then Apply. Reset restores the defaults.
  // The status is held by code so the default applies before master data loads.
  const [selectedStatusCode, setSelectedStatusCode] = useState<CallbackStatusCode | null>(
    DEFAULT_FILTERS.statusCode
  );
  const [selectedDate, setSelectedDate] = useState(DEFAULT_FILTERS.startDate);
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>(DEFAULT_FILTERS);
  const [gridState, setGridState] = useState<GridState>(() =>
    createInitialGridState({ pagination: { pageIndex: 0, pageSize: 10 } })
  );

  const { data: masterData } = useGetMasterDataQuery();
  const statusOptions = useMemo(
    () => [ALL_STATUSES_OPTION, ...(masterData?.activityStatuses ?? [])],
    [masterData]
  );
  // null (all statuses) shows the "All Statuses" option as selected.
  const selectedStatus =
    statusOptions.find((s) => s.code === (selectedStatusCode ?? ALL_STATUSES_OPTION.code)) ?? null;

  // Changing the params refetches automatically; filters + paging are server-side.
  const queryParams = useMemo<GetCallbackRequestListParams>(
    () => ({
      ...(appliedFilters.statusCode != null && { status_code: appliedFilters.statusCode }),
      ...(appliedFilters.startDate !== '' && { start_date: appliedFilters.startDate }),
      page: gridState.pagination.pageIndex + 1,
      page_size: gridState.pagination.pageSize,
    }),
    [appliedFilters, gridState.pagination]
  );

  const { data, isLoading, isFetching, isError, refetch } =
    useGetCallbackRequestListQuery(queryParams);
  const [markCompleted] = useMarkCandidateActivityCompletedMutation();

  const [completingId, setCompletingId] = useState<number | null>(null);

  const callbacks = useMemo(() => data?.callbacks ?? [], [data]);
  const totalCount = data?.pagination.totalCount ?? 0;
  // Empty-state wording: the default view (Pending, any date) vs. a narrowed search.
  const isDefaultView =
    appliedFilters.statusCode === DEFAULT_FILTERS.statusCode &&
    appliedFilters.startDate === DEFAULT_FILTERS.startDate;
  const hasFilters = appliedFilters.statusCode != null || appliedFilters.startDate !== '';

  function handleStatusChange(option: ActivityStatusOption | null): void {
    setSelectedStatusCode(
      option == null || option.code === ALL_STATUSES_OPTION.code
        ? null
        : (option.code as CallbackStatusCode)
    );
  }

  function goToFirstPage(): void {
    setGridState((prev) => ({ ...prev, pagination: { ...prev.pagination, pageIndex: 0 } }));
  }

  function handleApply(): void {
    setAppliedFilters({ statusCode: selectedStatusCode, startDate: selectedDate });
    goToFirstPage();
  }

  function handleReset(): void {
    setSelectedStatusCode(DEFAULT_FILTERS.statusCode);
    setSelectedDate(DEFAULT_FILTERS.startDate);
    setAppliedFilters(DEFAULT_FILTERS);
    goToFirstPage();
  }

  // Success/error toasts handled by apiToastMiddleware; the current page refetches
  // via the 'CandidateActivity' tag, so the row and count update on their own.
  async function handleMarkCompleted(item: CallbackRequestItem): Promise<void> {
    const ok = await confirm({
      title: 'Mark this callback as completed?',
      description: `The callback for ${item.fullName} will be marked as completed.`,
      confirmText: 'Mark Completed',
      cancelText: 'Cancel',
      variant: 'info',
      hideShortcutHint: true,
    });
    if (!ok) return;

    setCompletingId(item.candidateActivityId);
    try {
      await markCompleted({ candidate_activity_id: item.candidateActivityId }).unwrap();
      // With the Pending filter on, completing the last row of a page would leave it
      // empty — step back one page instead.
      if (
        appliedFilters.statusCode === 'PENDING' &&
        callbacks.length === 1 &&
        gridState.pagination.pageIndex > 0
      ) {
        setGridState((prev) => ({
          ...prev,
          pagination: { ...prev.pagination, pageIndex: prev.pagination.pageIndex - 1 },
        }));
      }
    } catch {
      // error handled by apiToastMiddleware
    } finally {
      setCompletingId(null);
    }
  }

  const columns: GridColumnDef<CallbackRequestItem>[] = [
    {
      id: 'candidate',
      header: 'Candidate',
      size: 170,
      minSize: 150,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-1.5">
            {item.isHighlighted && (
              <StarIcon className="h-4 w-4 shrink-0 text-warning" fill="currentColor" />
            )}
            <Link
              to={`/candidate/${item.candidateId}`}
              className="font-medium text-text hover:text-primary hover:underline"
            >
              {item.fullName}
            </Link>
          </div>
        );
      },
    },
    {
      id: 'jd',
      header: 'Job Description',
      size: 170,
      minSize: 150,
      cell: ({ row }) => {
        const { jdName } = row.original;
        if (jdName == null || jdName === '') return <span className="text-text-muted">—</span>;
        return <span className="block whitespace-normal text-text">{jdName}</span>;
      },
    },
    {
      id: 'phone',
      header: 'Phone',
      size: 120,
      minSize: 110,
      cell: ({ row }) => {
        const { phone } = row.original;
        if (phone == null || phone === '') return <span className="text-text-muted">—</span>;
        return (
          <a href={`tel:${phone}`} className="text-primary hover:underline">
            {phone}
          </a>
        );
      },
    },
    {
      id: 'callback_date',
      header: 'Callback Date',
      size: 150,
      minSize: 140,
      cell: ({ row }) => {
        const { callbackDate } = row.original;
        return (
          <span className="text-text-muted">
            {callbackDate != null
              ? format(parseNaiveDateTime(callbackDate), 'd MMM yyyy, h:mm a')
              : 'No date'}
          </span>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      size: 100,
      minSize: 100,
      cell: ({ row }) => {
        const badge = getCallbackStatusBadge(row.original);
        return <StatusBadge label={badge.label} variant={badge.variant} />;
      },
    },
    {
      id: 'notes',
      header: 'Notes',
      size: 180,
      minSize: 150,
      cell: ({ row }) => {
        const { notes } = row.original;
        if (notes == null || notes === '') return <span className="text-text-muted">—</span>;
        return (
          <span className="block max-w-[220px] truncate text-text-muted" title={notes}>
            {notes}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      size: 120,
      minSize: 120,
      meta: { pin: 'right', align: 'center' },
      cell: ({ row }) => {
        const item = row.original;
        const isCompleting = completingId === item.candidateActivityId;
        return (
          <div className="flex items-center justify-center gap-1">
            {isCallbackPending(item) ? (
              <Button
                variant="unstyled"
                size="xs"
                circular
                title="Mark as Completed"
                aria-label="Mark as Completed"
                disabled={isCompleting}
                className="text-success hover:text-success disabled:cursor-not-allowed disabled:opacity-50"
                leadingIcon={
                  isCompleting ? (
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircleIcon className="h-4 w-4" />
                  )
                }
                onClick={() => {
                  void handleMarkCompleted(item);
                }}
              />
            ) : isCallbackCompleted(item) ? (
              <span className="rounded-full bg-success-subtle px-2 py-0.5 text-[10px] font-semibold text-success">
                Completed
              </span>
            ) : (
              <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold text-text-muted">
                {item.statusName}
              </span>
            )}
            <Button
              variant="unstyled"
              size="xs"
              circular
              title="View Candidate Profile"
              aria-label="View Candidate Profile"
              className="text-text-muted hover:text-primary"
              leadingIcon={<ArrowTopRightOnSquareIcon className="h-4 w-4" />}
              onClick={() => {
                void navigate(`/candidate/${item.candidateId}`);
              }}
            />
          </div>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">My Actions</h1>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-text">Callback Requests</h2>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {totalCount}
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3">
          {/* Status dropdown */}
          <div className="w-full sm:w-56">
            <label className="text-xs font-medium text-text-muted">Status</label>
            <div className="flex items-center gap-1">
              <div className="min-w-0 flex-1">
                <Select<ActivityStatusOption>
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  options={statusOptions}
                  getOptionKey={(opt) => opt.code}
                  renderValue={(opt) => <span className="text-xs text-text">{opt.name}</span>}
                  renderOption={(opt) => <span className="text-xs">{opt.name}</span>}
                  placeholder={<span className="text-xs text-text-muted">All Statuses</span>}
                />
              </div>
              {selectedStatusCode != null && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStatusCode(null);
                  }}
                  className="mt-2 rounded-md p-1 text-text-muted hover:bg-surface-muted hover:text-text"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Callback date picker */}
          <div className="w-full sm:w-56">
            <label className="text-xs font-medium text-text-muted">Callback Date</label>
            <div className="flex items-center gap-1">
              <div className="mt-1 min-w-0 flex-1">
                <CalendarPicker
                  value={selectedDate}
                  onChange={setSelectedDate}
                  placeholder="All Dates"
                  className="w-full"
                />
              </div>
              {selectedDate !== '' && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDate('');
                  }}
                  className="mt-2 rounded-md p-1 text-text-muted hover:bg-surface-muted hover:text-text"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Apply & Reset buttons */}
          <div className="mt-2 flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={handleApply} disabled={isFetching}>
              Apply
            </Button>
            <Button variant="secondary" size="sm" onClick={handleReset} disabled={isFetching}>
              Reset
            </Button>
          </div>
        </div>

        {isError && data == null ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-error/30 bg-error/5 p-8 text-center">
            <ExclamationCircleIcon className="h-6 w-6 text-error" />
            <p className="text-sm text-error">Couldn't load your callback requests.</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                void refetch();
              }}
            >
              Retry
            </Button>
          </div>
        ) : !isLoading && callbacks.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-8 text-center">
            <InboxArrowDownIcon className="h-6 w-6 text-text-muted" />
            {isDefaultView ? (
              <>
                <p className="text-sm text-text-muted">No pending callbacks 🎉</p>
                <p className="text-xs text-text-subtle">
                  Callback requests you log in HR Activity will show up here.
                </p>
              </>
            ) : hasFilters ? (
              <p className="text-sm text-text-muted">No callbacks match these filters.</p>
            ) : (
              <>
                <p className="text-sm text-text-muted">No callbacks yet.</p>
                <p className="text-xs text-text-subtle">
                  Callback requests you log in HR Activity will show up here.
                </p>
              </>
            )}
          </div>
        ) : (
          <DataGrid<CallbackRequestItem>
            data={callbacks}
            columns={columns}
            totalRows={totalCount}
            state={gridState}
            onStateChange={setGridState}
            rowId={(row) => String(row.candidateActivityId)}
            loading={isFetching}
            getRowClassName={(row) =>
              row.isOverdue ? 'bg-error-subtle hover:bg-error-subtle' : undefined
            }
            layout={{ widthMode: 'fit' }}
          />
        )}
      </div>
    </PageContainer>
  );
}
