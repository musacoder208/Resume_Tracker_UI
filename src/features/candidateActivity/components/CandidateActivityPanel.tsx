import { useMemo, useState, type JSX, type ReactNode } from 'react';
import { addDays, format, setHours, setMinutes, startOfDay } from 'date-fns';
import clsx from 'clsx';
import { env } from '@/config/env';
import { Button } from '@/components/ui/button';
import { AutocompleteSelect } from '@/components/ui/autocompleteSelect';
import { toastService } from '@/components/ui/toast/toastService';
import { CalendarPicker } from '@/features/candidate/interviewProcess/components/calendarPicker';
import { TimePicker } from '@/features/candidate/interviewProcess/components/timePicker';
import { StatusBadge, type StatusBadgeVariant } from '@/components/ui/statusBadge';
import { DataGrid } from '@/components/datagrid/DataGrid';
import { createInitialGridState } from '@/components/datagrid/types/grid.state';
import type { GridState } from '@/components/datagrid/types/grid.state';
import type { GridColumnDef } from '@/components/datagrid/types/grid.types';
import { InboxArrowDownIcon, PencilIcon, StarIcon } from '@/icons';
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
import type {
  Activity,
  CandidateActivityItem,
  GetCandidateActivityParams,
} from '../types/candidateActivity.types';

// The API paginates server-side (max page_size 100) but this panel still
// sorts/filters/paginates on the client — so fetch the largest single page
// and treat it as "the dataset". Activities beyond the first 100 won't show.
const HISTORY_PAGE_SIZE = 100;

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

// The Interview Process pickers work on separate "YYYY-MM-DD" / "HH:mm" strings —
// joined here into the same naive (no timezone) value toNaiveDateTimeString produces.
function combineToNaiveDateTime(date: string, time: string): string | undefined {
  if (date === '' || time === '') return undefined;
  return `${date}T${time}:00`;
}

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

// The grid is manually sorted/paginated (this panel's data is a small,
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

export function CandidateActivityPanel({ candidateId }: { candidateId: number }): JSX.Element {
  const dispatch = useAppDispatch();

  const historyQueryParams = useMemo<GetCandidateActivityParams>(
    () => ({ candidate_id: candidateId, page: 1, page_size: HISTORY_PAGE_SIZE }),
    [candidateId]
  );

  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedSubActivityId, setSelectedSubActivityId] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showErrors, setShowErrors] = useState(false);

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
    useGetCandidateActivityQuery(historyQueryParams);

  const [saveCandidateActivity, { isLoading: isSaving }] = useSaveCandidateActivityMutation();
  const [saveCandidateActivityHighlight] = useSaveCandidateActivityHighlightMutation();
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // AutocompleteSelect works on string values/labels.
  const activityOptions = useMemo(
    () => activities.map((a) => ({ value: String(a.activityId), label: a.activityName })),
    [activities]
  );
  const subActivityOptions = useMemo(
    () => subActivities.map((s) => ({ value: String(s.subActivityId), label: s.subActivityName })),
    [subActivities]
  );
  const alertOptions = useMemo(
    () => alerts.map((a) => ({ value: String(a.alertId), label: a.alertName })),
    [alerts]
  );

  function handleActivityChange(activity: Activity | null): void {
    setSelectedActivity(activity);
    setSelectedSubActivityId(null);
  }

  function resetForm(): void {
    setEditingId(null);
    setSelectedActivity(null);
    setSelectedSubActivityId(null);
    setNotes('');
    setScheduleDate('');
    setScheduleTime('');
    setSelectedAlertId(null);
    setShowErrors(false);
  }

  function handleEditClick(item: CandidateActivityItem): void {
    const activity = activities.find((a) => a.activityId === item.activityId) ?? null;
    setEditingId(item.candidateActivityId);
    setSelectedActivity(activity);
    setSelectedSubActivityId(item.subActivityId);
    setNotes(item.notes ?? '');
    const scheduled = item.startDate != null ? parseNaiveDateTime(item.startDate) : null;
    setScheduleDate(scheduled != null ? format(scheduled, 'yyyy-MM-dd') : '');
    setScheduleTime(scheduled != null ? format(scheduled, 'HH:mm') : '');
    setSelectedAlertId(item.alertId);
    setShowErrors(false);
  }

  const canSave = selectedActivity != null;
  const isEditing = editingId != null;
  // A schedule needs both halves — a date with no time (or vice versa) can't be saved.
  const isScheduleIncomplete = (scheduleDate === '') !== (scheduleTime === '');

  // Shared by the Save/Update button and the "Call Tomorrow" shortcut — the
  // shortcut just overrides the start date with tomorrow at the configured time.
  async function saveActivity(startDateOverride?: Date): Promise<void> {
    if (selectedActivity == null) return;

    if (startDateOverride == null && isScheduleIncomplete) {
      setShowErrors(true);
      toastService.info('Please select both a date and a time for the schedule.');
      return;
    }

    const effectiveStartDate =
      startDateOverride != null
        ? toNaiveDateTimeString(startDateOverride)
        : combineToNaiveDateTime(scheduleDate, scheduleTime);

    try {
      await saveCandidateActivity({
        candidate_activity_id: editingId ?? undefined,
        candidate_id: candidateId,
        activity_id: selectedActivity.activityId,
        sub_activity_id: selectedSubActivity?.subActivityId,
        notes: notes.trim() === '' ? undefined : notes.trim(),
        start_date: effectiveStartDate,
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
          historyQueryParams,
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
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wide text-text-muted">
            {isEditing ? 'Edit Activity' : 'Log Activity'}
          </span>
          {isEditing && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              Editing entry #{editingId}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Activity">
            <AutocompleteSelect
              value={selectedActivity != null ? String(selectedActivity.activityId) : ''}
              onChange={(value) => {
                handleActivityChange(activities.find((a) => String(a.activityId) === value) ?? null);
              }}
              options={activityOptions}
              placeholder="Select activity…"
              disabled={isLoadingActivities}
            />
          </Field>

          <Field label="Sub-Activity">
            <AutocompleteSelect
              value={selectedSubActivity != null ? String(selectedSubActivity.subActivityId) : ''}
              onChange={(value) => {
                setSelectedSubActivityId(value === '' ? null : Number(value));
              }}
              options={subActivityOptions}
              placeholder="Select sub-activity…"
              disabled={selectedActivity == null || isLoadingSubActivities}
            />
          </Field>

          <Field label="Schedular">
            <div className="flex items-center gap-2">
              <CalendarPicker
                value={scheduleDate}
                onChange={setScheduleDate}
                placeholder="Select date"
                hasError={showErrors && isScheduleIncomplete && scheduleDate === ''}
              />
              <TimePicker
                value={scheduleTime}
                onChange={setScheduleTime}
                placeholder="Select time"
                hasError={showErrors && isScheduleIncomplete && scheduleTime === ''}
              />
            </div>
            {(scheduleDate !== '' || scheduleTime !== '') && (
              <button
                type="button"
                onClick={() => {
                  setScheduleDate('');
                  setScheduleTime('');
                }}
                className="self-start text-[11px] font-medium text-text-muted hover:text-text"
              >
                Clear schedule
              </button>
            )}
          </Field>

          <Field label="Alert">
            <AutocompleteSelect
              value={selectedAlert != null ? String(selectedAlert.alertId) : ''}
              onChange={(value) => {
                setSelectedAlertId(value === '' ? null : Number(value));
              }}
              options={alertOptions}
              placeholder="Select alert…"
              disabled={isLoadingAlerts}
            />
          </Field>
        </div>

        <Field label="Notes">
          <textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
            }}
            placeholder="Add any context about this activity…"
            className="min-h-[64px] w-full resize-y rounded-lg border border-border-muted bg-surface-muted/40 p-3 text-xs text-text placeholder:text-text-muted"
          />
        </Field>

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
              <Button variant="secondary" size="md" onClick={resetForm} disabled={isSaving}>
                Cancel
              </Button>
            )}
            <Button
              variant="primary"
              size="md"
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

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
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
  );
}

// Same field wrapper as the Interview Process round form, so both tabs share one look.
function Field({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-text-muted">{label}</span>
      {children}
    </div>
  );
}
