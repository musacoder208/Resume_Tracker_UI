import { useMemo, useState, type JSX } from 'react';
import { addDays, format, setHours, setMinutes, startOfDay } from 'date-fns';
import clsx from 'clsx';
import { env } from '@/config/env';
import { PageContainer } from '@/components/containers/PageContainer';
import { Textarea } from '@/components/ui/textarea/Textarea';
import { DateTimePicker } from '@/components/ui/dateTimePicker/DateTimePicker';
import { Button } from '@/components/ui/button';
import { StatusBadge, type StatusBadgeVariant } from '@/components/ui/statusBadge';
import { DataGrid } from '@/components/datagrid/DataGrid';
import { createInitialGridState } from '@/components/datagrid/types/grid.state';
import type { GridState } from '@/components/datagrid/types/grid.state';
import type { GridColumnDef } from '@/components/datagrid/types/grid.types';
import { InboxArrowDownIcon, SparklesIcon, PencilIcon, StarIcon } from '@/icons';
import { useAppDispatch } from '@/hooks/reduxHooks';
import {
  candidateActivityApi,
  useGetActivityListQuery,
  useGetSubActivityListQuery,
  useGetAlertListQuery,
  useSaveCandidateActivityMutation,
  useSaveCandidateActivityHighlightMutation,
  useGetCandidateActivityQuery,
} from '../api/candidateActivity.api';
import type { Activity, CandidateActivityItem } from '../types/candidateActivity.types';

// Hardcoded because this is a standalone test page with no real candidate
// context. When this flow moves into the candidate details page, the id
// will come from the route instead.
const TEST_CANDIDATE_ID = 1;

// The API paginates server-side (max page_size 100) but this page still
// sorts/filters/paginates on the client — so fetch the largest single page
// and treat it as "the dataset". Activities beyond the first 100 won't show.
const HISTORY_QUERY_PARAMS = { candidate_id: TEST_CANDIDATE_ID, page: 1, page_size: 100 };

// start_date is stored as `timestamp without time zone` — the backend keeps
// whatever clock value it's given, with no timezone conversion. Date.toISOString()
// would convert to UTC first, shifting the picked wall-clock time (e.g. 5:30 AM IST
// becomes 00:00 UTC, which the backend then stores literally as 12:00 AM). Format
// the picker's local value directly instead, so what's picked is what gets stored.
function toNaiveDateTimeString(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss");
}

// Reads start_date back the same way it was sent — as literal local
// wall-clock digits — regardless of any 'Z'/offset suffix the API response
// might attach to a value that's actually timezone-naive in the database.
function parseNaiveDateTime(value: string): Date {
  return new Date(value.replace(/Z$|[+-]\d{2}:?\d{2}$/i, ''));
}

// Tomorrow at the configured "HH:mm" time (VITE_CALL_TOMORROW_TIME), falling
// back to 09:30 if the env value is malformed.
function getCallTomorrowDate(time: string): Date {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  const hours = match != null ? Number(match[1]) : 9;
  const minutes = match != null ? Number(match[2]) : 30;
  const valid = hours <= 23 && minutes <= 59;
  return setMinutes(
    setHours(addDays(startOfDay(new Date()), 1), valid ? hours : 9),
    valid ? minutes : 30
  );
}

// Same native <select> classes as the candidate list page's filter
// dropdowns, so dropdowns look identical across pages.
const FIELD_SELECT_CLASSES =
  'w-full rounded-md border border-border bg-surface py-1.5 ps-3 pe-8 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary';

// Purely cosmetic — maps a sub-activity's wording to a status color.
function getStatusVariant(label: string): StatusBadgeVariant {
  const value = label.toLowerCase();
  if (value.includes('not') || value.includes('fail') || value.includes('reject')) return 'error';
  if (value.includes('callback') || value.includes('schedule') || value.includes('follow'))
    return 'warning';
  if (
    value.includes('connect') ||
    value.includes('sent') ||
    value.includes('complete') ||
    value.includes('calculat') ||
    value.includes('save') ||
    value.includes('upload')
  ) {
    return 'success';
  }
  return 'neutral';
}

// Purely cosmetic — colors the User/System tag in line with the timeline icon colors.
function getTypeTagClasses(activityType: string): string {
  return activityType.toLowerCase() === 'system'
    ? 'bg-slate-500/10 text-slate-600'
    : 'bg-primary/10 text-primary';
}

// The grid is manually sorted/paginated (this page's data is a small,
// already-fetched array, not a server-driven page) — sort by the clicked
// column ourselves before slicing to the current page.
function getSortValue(item: CandidateActivityItem, columnId: string): string | number {
  switch (columnId) {
    case 'activity':
      return item.activityName.toLowerCase();
    case 'sub_activity':
      return (item.subActivityName ?? '').toLowerCase();
    case 'type':
      return item.activityType.toLowerCase();
    case 'notes':
      return (item.notes ?? '').toLowerCase();
    case 'start_date':
      return item.startDate != null ? parseNaiveDateTime(item.startDate).getTime() : -Infinity;
    case 'alert':
      return item.alertId ?? -Infinity;
    case 'logged':
      return new Date(item.createdDate).getTime();
    default:
      return '';
  }
}

function sortItems(
  items: CandidateActivityItem[],
  sorting: GridState['sorting']
): CandidateActivityItem[] {
  const rule = sorting[0];
  if (rule == null) return items;
  const sorted = [...items].sort((a, b) => {
    const valueA = getSortValue(a, rule.id);
    const valueB = getSortValue(b, rule.id);
    if (valueA < valueB) return -1;
    if (valueA > valueB) return 1;
    return 0;
  });
  return rule.desc ? sorted.reverse() : sorted;
}

export function CandidateActivityTestPage(): JSX.Element {
  const dispatch = useAppDispatch();

  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedSubActivityId, setSelectedSubActivityId] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: activities = [], isLoading: isLoadingActivities } = useGetActivityListQuery();
  const { data: alerts = [], isLoading: isLoadingAlerts } = useGetAlertListQuery();

  const selectedAlert = alerts.find((a) => a.alertId === selectedAlertId) ?? null;

  const { data: subActivities = [], isFetching: isLoadingSubActivities } =
    useGetSubActivityListQuery(selectedActivity?.activityId ?? 0, {
      skip: selectedActivity == null,
    });

  // Derived, not stored — resolves as soon as the matching sub-activity list
  // arrives, whether the id came from a normal selection or from editing a row.
  const selectedSubActivity =
    subActivities.find((s) => s.subActivityId === selectedSubActivityId) ?? null;

  const { data: history, isLoading: isLoadingHistory } =
    useGetCandidateActivityQuery(HISTORY_QUERY_PARAMS);

  const [saveCandidateActivity, { isLoading: isSaving }] = useSaveCandidateActivityMutation();
  const [saveCandidateActivityHighlight] = useSaveCandidateActivityHighlightMutation();
  const [togglingId, setTogglingId] = useState<number | null>(null);

  function handleActivityChange(activity: Activity | null): void {
    setSelectedActivity(activity);
    setSelectedSubActivityId(null);
  }

  function resetForm(): void {
    setEditingId(null);
    setSelectedActivity(null);
    setSelectedSubActivityId(null);
    setNotes('');
    setStartDate(undefined);
    setSelectedAlertId(null);
  }

  function handleEditClick(item: CandidateActivityItem): void {
    const activity = activities.find((a) => a.activityId === item.activityId) ?? null;
    setEditingId(item.candidateActivityId);
    setSelectedActivity(activity);
    setSelectedSubActivityId(item.subActivityId);
    setNotes(item.notes ?? '');
    setStartDate(item.startDate != null ? parseNaiveDateTime(item.startDate) : undefined);
    setSelectedAlertId(item.alertId);
  }

  const canSave = selectedActivity != null;
  const isEditing = editingId != null;

  // Shared by the Save/Update button and the "Call Tomorrow" shortcut — the
  // shortcut just overrides the start date with tomorrow at the configured time.
  async function saveActivity(startDateOverride?: Date): Promise<void> {
    if (selectedActivity == null) return;

    const effectiveStartDate = startDateOverride ?? startDate;

    try {
      await saveCandidateActivity({
        candidate_activity_id: editingId ?? undefined,
        candidate_id: TEST_CANDIDATE_ID,
        activity_id: selectedActivity.activityId,
        sub_activity_id: selectedSubActivity?.subActivityId,
        notes: notes.trim() === '' ? undefined : notes.trim(),
        start_date:
          effectiveStartDate != null ? toNaiveDateTimeString(effectiveStartDate) : undefined,
        alert_id: selectedAlert?.alertId,
      }).unwrap();

      // Success/error toast handled by apiToastMiddleware.
      resetForm();
    } catch {
      // error handled by apiToastMiddleware
    }
  }

  async function handleToggleHighlight(item: CandidateActivityItem): Promise<void> {
    setTogglingId(item.candidateActivityId);
    try {
      const result = await saveCandidateActivityHighlight({
        candidate_activity_id: item.candidateActivityId,
      }).unwrap();

      // Per the API contract, patch the cached list directly from the
      // response instead of refetching the whole history.
      dispatch(
        candidateActivityApi.util.updateQueryData(
          'getCandidateActivity',
          HISTORY_QUERY_PARAMS,
          (draft) => {
            const target = draft.activities.find(
              (a) => a.candidateActivityId === item.candidateActivityId
            );
            if (target != null) target.isHighlighted = result.data.is_highlighted;
          }
        )
      );
    } catch {
      // error handled by apiToastMiddleware
    } finally {
      setTogglingId(null);
    }
  }

  const historyItems = useMemo(() => history?.activities ?? [], [history]);

  const [gridState, setGridState] = useState<GridState>(() =>
    createInitialGridState({ pagination: { pageIndex: 0, pageSize: 10 } })
  );

  const sortedItems = useMemo(
    () => sortItems(historyItems, gridState.sorting),
    [historyItems, gridState.sorting]
  );

  const pagedItems = useMemo(() => {
    const { pageIndex, pageSize } = gridState.pagination;
    const start = pageIndex * pageSize;
    return sortedItems.slice(start, start + pageSize);
  }, [sortedItems, gridState.pagination]);

  const columns: GridColumnDef<CandidateActivityItem>[] = [
    {
      id: 'activity',
      header: 'Activity',
      size: 110,
      minSize: 110,
      cell: ({ row }) => <span className="font-medium text-text">{row.original.activityName}</span>,
    },
    {
      id: 'sub_activity',
      header: 'Sub-Activity',
      size: 130,
      minSize: 130,
      cell: ({ row }) => {
        const { subActivityName } = row.original;
        if (subActivityName == null) return <span className="text-text-muted">—</span>;
        return (
          <StatusBadge
            label={subActivityName}
            variant={getStatusVariant(subActivityName)}
            dot={false}
          />
        );
      },
    },
    {
      id: 'type',
      header: 'Activity Type',
      size: 100,
      minSize: 100,
      cell: ({ row }) => (
        <span
          className={clsx(
            'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
            getTypeTagClasses(row.original.activityType)
          )}
        >
          {row.original.activityType}
        </span>
      ),
    },
    {
      id: 'notes',
      header: 'Notes',
      enableSorting: false,
      size: 160,
      minSize: 160,
      cell: ({ row }) => (
        <span className="block whitespace-normal text-text-muted">{row.original.notes ?? '—'}</span>
      ),
    },
    {
      id: 'start_date',
      header: 'Scheduled',
      size: 130,
      minSize: 130,
      cell: ({ row }) => (
        <span className="text-text-muted">
          {row.original.startDate != null
            ? format(parseNaiveDateTime(row.original.startDate), 'd MMM yyyy, h:mm a')
            : '—'}
        </span>
      ),
    },
    {
      id: 'alert',
      header: 'Alert',
      size: 90,
      minSize: 90,
      cell: ({ row }) => (
        <span className="text-text-muted">{row.original.alertName ?? '—'}</span>
      ),
    },
    {
      id: 'logged',
      header: 'Created Date',
      size: 130,
      minSize: 130,
      cell: ({ row }) => (
        <span className="text-text-muted">
          {format(new Date(row.original.createdDate), 'd MMM yyyy, h:mm a')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      size: 56,
      minSize: 56,
      meta: { pin: 'right', align: 'center' },
      cell: ({ row }) => {
        const item = row.original;
        return (
          <Button
            variant="unstyled"
            size="xs"
            circular
            title="Edit"
            aria-label="Edit"
            className="text-text-muted hover:text-text"
            leadingIcon={<PencilIcon className="h-4 w-4" />}
            onClick={() => {
              handleEditClick(item);
            }}
          />
        );
      },
    },
    {
      id: 'highlight',
      header: 'Highlight',
      enableSorting: false,
      size: 56,
      minSize: 56,
      meta: { pin: 'right', align: 'center' },
      cell: ({ row }) => {
        const item = row.original;
        const isToggling = togglingId === item.candidateActivityId;
        return (
          <button
            type="button"
            disabled={isToggling}
            title={item.isHighlighted ? 'Remove highlight' : 'Highlight this row'}
            aria-label="Toggle highlight"
            onClick={() => {
              void handleToggleHighlight(item);
            }}
            className={clsx(
              'flex h-6 w-6 items-center justify-center rounded-full transition-colors',
              'disabled:cursor-not-allowed disabled:opacity-40',
              item.isHighlighted ? 'text-warning' : 'text-text-muted hover:text-warning'
            )}
          >
            <StarIcon className="h-4 w-4" fill={item.isHighlighted ? 'currentColor' : 'none'} />
          </button>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <div className="mx-auto flex max-w-5xl flex-col gap-6 pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <SparklesIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-text">Candidate Activity (Test)</h1>
            <p className="text-sm text-text-muted">
              Standalone test page for candidate activity tracking. Candidate ID is hardcoded to{' '}
              {TEST_CANDIDATE_ID}.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text">
              {isEditing ? 'Edit Activity' : 'Log Activity'}
            </h2>
            {isEditing && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                Editing entry #{editingId}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-text">Activity</label>
              <select
                value={selectedActivity?.activityId ?? ''}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  handleActivityChange(activities.find((a) => a.activityId === id) ?? null);
                }}
                disabled={isLoadingActivities}
                className={FIELD_SELECT_CLASSES}
              >
                <option value="">Select activity…</option>
                {activities.map((a) => (
                  <option key={a.activityId} value={a.activityId}>
                    {a.activityName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-text">Sub-Activity</label>
              <select
                value={selectedSubActivity?.subActivityId ?? ''}
                onChange={(e) => {
                  setSelectedSubActivityId(e.target.value === '' ? null : Number(e.target.value));
                }}
                disabled={selectedActivity == null || isLoadingSubActivities}
                className={FIELD_SELECT_CLASSES}
              >
                <option value="">Select sub-activity…</option>
                {subActivities.map((s) => (
                  <option key={s.subActivityId} value={s.subActivityId}>
                    {s.subActivityName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Textarea
            label="Notes"
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
            }}
            rows={3}
            placeholder="Add any context about this activity…"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-text">Schedular</label>
              <DateTimePicker
                mode="datetime"
                value={startDate}
                onChange={setStartDate}
                placeholder="Select date & time…"
                showClearButton
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-text">Alert</label>
              <select
                value={selectedAlert?.alertId ?? ''}
                onChange={(e) => {
                  setSelectedAlertId(e.target.value === '' ? null : Number(e.target.value));
                }}
                disabled={isLoadingAlerts}
                className={FIELD_SELECT_CLASSES}
              >
                <option value="">Select alert…</option>
                {alerts.map((a) => (
                  <option key={a.alertId} value={a.alertId}>
                    {a.alertName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <p className="text-xs text-text-muted">
              {canSave ? 'Ready to save.' : 'Select an activity to enable save.'}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  void saveActivity(getCallTomorrowDate(env.CALL_TOMORROW_TIME));
                }}
                disabled={!canSave || isSaving}
                title={`Save with start date tomorrow at ${env.CALL_TOMORROW_TIME}`}
                className="mr-2 text-sm font-medium text-primary underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-40"
              >
                Call Tomorrow
              </button>
              {isEditing && (
                <Button variant="secondary" onClick={resetForm} disabled={isSaving}>
                  Cancel
                </Button>
              )}
              <Button
                variant="primary"
                onClick={() => {
                  void saveActivity();
                }}
                disabled={!canSave || isSaving}
              >
                {isSaving ? 'Saving…' : isEditing ? 'Update Activity' : 'Save Activity'}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-text">Activity History</h2>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {historyItems.length}
            </span>
          </div>

          {!isLoadingHistory && historyItems.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-8 text-center">
              <InboxArrowDownIcon className="h-6 w-6 text-text-muted" />
              <p className="text-sm text-text-muted">No activity logged yet.</p>
              <p className="text-xs text-text-subtle">
                Activities you save above will show up here.
              </p>
            </div>
          ) : (
            <DataGrid<CandidateActivityItem>
              data={pagedItems}
              columns={columns}
              totalRows={sortedItems.length}
              state={gridState}
              onStateChange={setGridState}
              rowId={(row) => String(row.candidateActivityId)}
              loading={isLoadingHistory}
              enableSorting
              getRowClassName={(row) =>
                row.isHighlighted ? 'bg-warning-subtle hover:bg-warning-subtle' : undefined
              }
              layout={{ widthMode: 'fit' }}
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
}
