import { useMemo, useState, type JSX } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { addDays, format, setHours, setMinutes, startOfDay } from 'date-fns';
import clsx from 'clsx';
import { env } from '@/config/env';
import { Button, IconButton } from '@/components/ui/button';
import { AutocompleteSelect } from '@/components/ui/autocompleteSelect';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/form/FormField';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
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
import { useT } from '@/i18n/useT';
import {
  candidateActivityApi,
  useGetActivityListQuery,
  useGetSubActivityListQuery,
  useGetAlertListQuery,
  useSaveCandidateActivityMutation,
  useSaveCandidateActivityWithFollowUpMutation,
  useLazyGetPendingFollowUpQuery,
  useSaveCandidateActivityHighlightMutation,
  useGetCandidateActivityQuery,
} from '../api/candidateActivity.api';
import type {
  Activity,
  CandidateActivityItem,
  FollowUpAction,
  GetCandidateActivityParams,
  SaveCandidateActivityWithFollowUpRequest,
} from '../types/candidateActivity.types';

// The API paginates server-side (max page_size 100) but this panel still
// sorts/filters/paginates on the client — so fetch the largest single page
// and treat it as "the dataset". Activities beyond the first 100 won't show.
const HISTORY_PAGE_SIZE = 100;

// Default follow-up activity / sub-activity (created by the save, hidden from
// the Activity dropdown). Needed when editing an existing follow-up row.
const FOLLOW_UP_ACTIVITY_CODE = 'FOLLOW_UP';
const FOLLOW_UP_SUB_ACTIVITY_CODE = 'SCHEDULED_CALL';

// My Action → "Log Activity" opens this tab with ?completeFollowUp=<id>; the next
// save then also completes that follow-up. Without it the panel works as usual.
const COMPLETE_FOLLOW_UP_PARAM = 'completeFollowUp';
const MY_ACTION_PATH = '/my-action';

type EditingKind = 'activity' | 'followUp';

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

// Activity status (tbl_activity_status) → badge color.
function getActivityStatusVariant(statusCode: string | null): StatusBadgeVariant {
  switch (statusCode) {
    case 'PENDING':
      return 'warning';
    case 'COMPLETED':
      return 'success';
    default:
      return 'neutral';
  }
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
    case 'status':
      return (item.statusName ?? '').toLowerCase();
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
  const { t } = useT('candidate');
  const dispatch = useAppDispatch();

  const historyQueryParams = useMemo<GetCandidateActivityParams>(
    () => ({ candidate_id: candidateId, page: 1, page_size: HISTORY_PAGE_SIZE }),
    [candidateId]
  );

  // ── Activity section ──
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedSubActivityId, setSelectedSubActivityId] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  // ── Follow-up section ──
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);
  // ── Edit mode ──
  const [editingItem, setEditingItem] = useState<CandidateActivityItem | null>(null);
  // Name of the edited row's sub-activity — fallback match when its id isn't in the list.
  const [editingSubActivityName, setEditingSubActivityName] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  const { data: activities = [], isLoading: isLoadingActivities } = useGetActivityListQuery();
  const { data: alerts = [], isLoading: isLoadingAlerts } = useGetAlertListQuery();

  const selectedAlert = alerts.find((a) => a.alertId === selectedAlertId) ?? null;

  const { data: subActivities = [], isFetching: isLoadingSubActivities } =
    useGetSubActivityListQuery(selectedActivity?.activityId ?? 0, {
      skip: selectedActivity == null,
    });

  // Derived, not stored — resolves as soon as the matching sub-activity list
  // arrives, whether the id came from a normal selection or from editing a row
  // (matched by id, else by the history row's name).
  const selectedSubActivity =
    subActivities.find((s) => s.subActivityId === selectedSubActivityId) ??
    (editingSubActivityName != null
      ? (subActivities.find((s) => s.subActivityName === editingSubActivityName) ?? null)
      : null);

  // The panel mounts each time the HR Activity tab is opened — refetch then, so the
  // history is current without a page refresh (cached rows show meanwhile).
  const {
    data: history,
    isLoading: isLoadingHistory,
    isFetching: isFetchingHistory,
  } = useGetCandidateActivityQuery(historyQueryParams, { refetchOnMountOrArgChange: true });

  // ── Completing a follow-up (only when opened from My Action) ──
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const completeFollowUpId = Number(searchParams.get(COMPLETE_FOLLOW_UP_PARAM) ?? '');
  const hasCompleteParam = Number.isInteger(completeFollowUpId) && completeFollowUpId > 0;
  // Looked up in the loaded history: still pending → completing mode; otherwise
  // (completed meanwhile / old link) the param is ignored and a notice is shown.
  const completeTarget = hasCompleteParam
    ? (history?.activities.find(
        (a) =>
          a.candidateActivityId === completeFollowUpId &&
          a.activityCode === FOLLOW_UP_ACTIVITY_CODE
      ) ?? null)
    : null;
  const completingFollowUp = completeTarget?.statusCode === 'PENDING' ? completeTarget : null;
  const isCompleteParamStale = hasCompleteParam && history != null && completingFollowUp == null;

  function clearCompleteParam(): void {
    const next = new URLSearchParams(searchParams);
    next.delete(COMPLETE_FOLLOW_UP_PARAM);
    setSearchParams(next, { replace: true });
  }

  const [saveCandidateActivity, { isLoading: isUpdating }] = useSaveCandidateActivityMutation();
  const [saveWithFollowUp, { isLoading: isSavingNew }] =
    useSaveCandidateActivityWithFollowUpMutation();
  const [fetchPendingFollowUp, { isFetching: isCheckingFollowUp }] =
    useLazyGetPendingFollowUpQuery();
  // Save held back while the user decides about an overdue follow-up.
  const [overdueSave, setOverdueSave] = useState<SaveCandidateActivityWithFollowUpRequest | null>(
    null
  );
  const isSaving = isUpdating || isSavingNew || isCheckingFollowUp;
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
    setEditingSubActivityName(null);
  }

  function resetForm(): void {
    setEditingItem(null);
    setSelectedActivity(null);
    setSelectedSubActivityId(null);
    setEditingSubActivityName(null);
    setNotes('');
    setScheduleDate('');
    setScheduleTime('');
    setSelectedAlertId(null);
    setShowErrors(false);
  }

  // A follow-up row is edited in the Follow-up section only; any other row in
  // the Activity section only.
  function handleEditClick(item: CandidateActivityItem): void {
    resetForm();
    setEditingItem(item);
    if (item.activityCode === FOLLOW_UP_ACTIVITY_CODE) {
      const scheduled = item.startDate != null ? parseNaiveDateTime(item.startDate) : null;
      setScheduleDate(scheduled != null ? format(scheduled, 'yyyy-MM-dd') : '');
      setScheduleTime(scheduled != null ? format(scheduled, 'HH:mm') : '');
      setSelectedAlertId(item.alertId);
      return;
    }
    // Map the row back to the master lists (by id, else by name) so the save
    // can send the current activity_code / sub_activity_code.
    const activity =
      activities.find((a) => a.activityId === item.activityId) ??
      activities.find((a) => a.activityName === item.activityName) ??
      null;
    setSelectedActivity(activity);
    setSelectedSubActivityId(item.subActivityId);
    setEditingSubActivityName(item.subActivityName);
    setNotes(item.notes ?? '');
  }

  const editingKind: EditingKind | null =
    editingItem == null
      ? null
      : editingItem.activityCode === FOLLOW_UP_ACTIVITY_CODE
        ? 'followUp'
        : 'activity';
  const isEditing = editingKind != null;
  const showActivitySection = editingKind !== 'followUp';
  const showFollowUpSection = editingKind !== 'activity';

  // A schedule needs both halves — a date with no time (or vice versa) can't be saved.
  const isScheduleIncomplete = (scheduleDate === '') !== (scheduleTime === '');
  const followUpDate = combineToNaiveDateTime(scheduleDate, scheduleTime);
  const hasActivity = selectedActivity != null;
  const hasFollowUp = followUpDate != null;

  const canSave =
    editingKind === 'followUp'
      ? hasFollowUp
      : editingKind === 'activity'
        ? hasActivity
        : hasActivity || hasFollowUp;

  async function submitNew(
    body: SaveCandidateActivityWithFollowUpRequest,
    action: FollowUpAction
  ): Promise<void> {
    try {
      await saveWithFollowUp({ ...body, follow_up_action: action }).unwrap();
      // Success/error toast handled by apiToastMiddleware.
      resetForm();
      // Follow-up completed from My Action → back to the list (refetched via tag)
      if (body.complete_follow_up_id != null) void navigate(MY_ACTION_PATH);
    } catch {
      // error handled by apiToastMiddleware
    }
  }

  // With a follow-up date, first look at this user's pending follow-up:
  //   none    → insert a new one
  //   future  → update it (no popup)
  //   overdue → ask: complete it + insert new (Yes), or update it (No)
  async function submitWithFollowUpCheck(body: SaveCandidateActivityWithFollowUpRequest): Promise<void> {
    // Completing a follow-up from My Action: it is closed by this save, so no
    // pending check / overdue popup — a next follow-up is always a new one.
    if (completingFollowUp != null) {
      await submitNew({ ...body, complete_follow_up_id: completingFollowUp.candidateActivityId }, 'NEW');
      return;
    }
    if (body.follow_up_date == null) {
      await submitNew(body, 'NEW');
      return;
    }
    let pending;
    try {
      pending = await fetchPendingFollowUp(candidateId).unwrap();
    } catch {
      // error handled by apiToastMiddleware
      return;
    }
    if (pending == null) {
      await submitNew(body, 'NEW');
    } else if (pending.isPast) {
      setOverdueSave(body);
    } else {
      await submitNew(body, 'UPDATE_EXISTING');
    }
  }

  function handleOverdueChoice(action: FollowUpAction): void {
    if (overdueSave == null) return;
    const body = overdueSave;
    setOverdueSave(null);
    void submitNew(body, action);
  }

  // Save (new): activity row and/or follow-up row in one call.
  async function saveNew(): Promise<void> {
    if (isScheduleIncomplete) {
      setShowErrors(true);
      toastService.info(t('activityPanel.hints.scheduleIncomplete'));
      return;
    }
    if (selectedAlert != null && !hasFollowUp) {
      setShowErrors(true);
      toastService.info(t('activityPanel.hints.alertNeedsDate'));
      return;
    }
    await submitWithFollowUpCheck({
      candidate_id: candidateId,
      activity_code: selectedActivity?.activityCode,
      sub_activity_code: selectedActivity != null ? selectedSubActivity?.subActivityCode : undefined,
      notes: selectedActivity != null && notes.trim() !== '' ? notes.trim() : undefined,
      alert_id: hasFollowUp ? selectedAlert?.alertId : undefined,
      follow_up_date: followUpDate,
    });
  }

  // "Call Tomorrow": saves only a follow-up for tomorrow at the configured time —
  // the Activity section is ignored.
  async function saveCallTomorrow(): Promise<void> {
    await submitWithFollowUpCheck({
      candidate_id: candidateId,
      alert_id: selectedAlert?.alertId,
      follow_up_date: toNaiveDateTimeString(getCallTomorrowDate(env.CALL_TOMORROW_TIME)),
    });
  }

  // Update (edit): only the edited row, through the existing update endpoint.
  async function saveEdit(item: CandidateActivityItem, kind: EditingKind): Promise<void> {
    if (kind === 'followUp') {
      if (followUpDate == null) {
        setShowErrors(true);
        toastService.info(t('activityPanel.hints.scheduleIncomplete'));
        return;
      }
      try {
        await saveCandidateActivity({
          candidate_activity_id: item.candidateActivityId,
          candidate_id: candidateId,
          activity_code: FOLLOW_UP_ACTIVITY_CODE,
          sub_activity_code: FOLLOW_UP_SUB_ACTIVITY_CODE,
          notes: item.notes ?? undefined,
          start_date: followUpDate,
          alert_id: selectedAlert?.alertId,
        }).unwrap();
        resetForm();
      } catch {
        // error handled by apiToastMiddleware
      }
      return;
    }

    if (selectedActivity == null) return;
    try {
      // Keep the row's own schedule / alert (older rows may have them) — only
      // the Activity section is edited here.
      await saveCandidateActivity({
        candidate_activity_id: item.candidateActivityId,
        candidate_id: candidateId,
        activity_code: selectedActivity.activityCode,
        sub_activity_code: selectedSubActivity?.subActivityCode,
        notes: notes.trim() === '' ? undefined : notes.trim(),
        start_date:
          item.startDate != null
            ? toNaiveDateTimeString(parseNaiveDateTime(item.startDate))
            : undefined,
        alert_id: item.alertId ?? undefined,
      }).unwrap();
      resetForm();
    } catch {
      // error handled by apiToastMiddleware
    }
  }

  function handleSave(): void {
    if (editingItem != null && editingKind != null) {
      void saveEdit(editingItem, editingKind);
    } else {
      void saveNew();
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
      header: t('activityPanel.columns.activity'),
      size: 110,
      minSize: 110,
      cell: ({ row }) => <span className="font-medium text-text">{row.original.activityName}</span>,
    },
    {
      id: 'sub_activity',
      header: t('activityPanel.columns.subActivity'),
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
      id: 'status',
      header: t('activityPanel.columns.status'),
      size: 110,
      minSize: 110,
      cell: ({ row }) => {
        const { statusName, statusCode } = row.original;
        if (statusName == null) return <span className="text-text-muted">—</span>;
        return <StatusBadge label={statusName} variant={getActivityStatusVariant(statusCode)} />;
      },
    },
    {
      id: 'type',
      header: t('activityPanel.columns.type'),
      size: 100,
      minSize: 100,
      cell: ({ row }) => (
        <span
          className={clsx(
            'rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide',
            getTypeTagClasses(row.original.activityType)
          )}
        >
          {row.original.activityType}
        </span>
      ),
    },
    {
      id: 'notes',
      header: t('activityPanel.columns.notes'),
      enableSorting: false,
      size: 300,
      minSize: 260,
      cell: ({ row }) => (
        <span className="block whitespace-normal text-text-muted">{row.original.notes ?? '—'}</span>
      ),
    },
    {
      id: 'start_date',
      header: t('activityPanel.columns.scheduled'),
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
      header: t('activityPanel.columns.alert'),
      size: 90,
      minSize: 90,
      cell: ({ row }) => <span className="text-text-muted">{row.original.alertName ?? '—'}</span>,
    },
    {
      id: 'logged',
      header: t('activityPanel.columns.createdDate'),
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
      header: t('activityPanel.columns.actions'),
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
            title={t('activityPanel.actions.edit')}
            aria-label={t('activityPanel.actions.edit')}
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
      header: t('activityPanel.columns.highlight'),
      enableSorting: false,
      size: 56,
      minSize: 56,
      meta: { pin: 'right', align: 'center' },
      cell: ({ row }) => {
        const item = row.original;
        const isToggling = togglingId === item.candidateActivityId;
        const label = item.isHighlighted
          ? t('activityPanel.actions.removeHighlight')
          : t('activityPanel.actions.highlight');
        return (
          <IconButton
            variant="unstyled"
            circular
            disabled={isToggling}
            title={label}
            ariaLabel={label}
            onClick={() => {
              void handleToggleHighlight(item);
            }}
            className={clsx(
              'h-6 w-6 transition-colors disabled:cursor-not-allowed disabled:opacity-40',
              item.isHighlighted ? 'text-warning' : 'text-text-muted hover:text-warning'
            )}
            icon={<StarIcon className="h-4 w-4" fill={item.isHighlighted ? 'currentColor' : 'none'} />}
          />
        );
      },
    },
  ];

  const title =
    editingKind === 'followUp'
      ? t('activityPanel.editFollowUpTitle')
      : editingKind === 'activity'
        ? t('activityPanel.editActivityTitle')
        : t('activityPanel.logTitle');

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-5">
        <span className="text-xs font-bold uppercase tracking-wide text-text-muted">{title}</span>

        {/* Opened from My Action → this save also completes the follow-up */}
        {!isEditing && completingFollowUp != null && (
          <div className="flex flex-col gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-text">
              {completingFollowUp.startDate != null
                ? t('activityPanel.completingFollowUp.message', {
                    date: format(parseNaiveDateTime(completingFollowUp.startDate), 'd MMM yyyy, h:mm a'),
                  })
                : t('activityPanel.completingFollowUp.messageNoDate')}
            </p>
            <Button variant="secondary" size="xs" onClick={clearCompleteParam} disabled={isSaving}>
              {t('activityPanel.completingFollowUp.cancel')}
            </Button>
          </div>
        )}
        {isCompleteParamStale && (
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface-muted/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-text-muted">{t('activityPanel.completingFollowUp.alreadyCompleted')}</p>
            <Button variant="secondary" size="xs" onClick={clearCompleteParam}>
              {t('activityPanel.completingFollowUp.dismiss')}
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* ── Activity section ── */}
          {showActivitySection && (
            <section className="flex flex-col gap-4 rounded-lg border border-border-muted p-4">
              <h3 className="text-sm font-semibold text-text">{t('activityPanel.sections.activity')}</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label={t('activityPanel.fields.activity')}>
                  <AutocompleteSelect
                    value={selectedActivity != null ? String(selectedActivity.activityId) : ''}
                    onChange={(value) => {
                      handleActivityChange(
                        activities.find((a) => String(a.activityId) === value) ?? null
                      );
                    }}
                    options={activityOptions}
                    placeholder={t('activityPanel.placeholders.activity')}
                    disabled={isLoadingActivities}
                  />
                </FormField>

                <FormField label={t('activityPanel.fields.subActivity')}>
                  <AutocompleteSelect
                    value={selectedSubActivity != null ? String(selectedSubActivity.subActivityId) : ''}
                    onChange={(value) => {
                      setSelectedSubActivityId(value === '' ? null : Number(value));
                      setEditingSubActivityName(null);
                    }}
                    options={subActivityOptions}
                    placeholder={t('activityPanel.placeholders.subActivity')}
                    disabled={selectedActivity == null || isLoadingSubActivities}
                  />
                </FormField>
              </div>

              <FormField label={t('activityPanel.fields.notes')}>
                <Textarea
                  value={notes}
                  rows={3}
                  onChange={(e) => {
                    setNotes(e.target.value);
                  }}
                  placeholder={t('activityPanel.placeholders.notes')}
                  className="resize-y text-xs"
                />
              </FormField>
            </section>
          )}

          {/* ── Follow-up section ── */}
          {showFollowUpSection && (
            <section className="flex flex-col gap-4 rounded-lg border border-border-muted p-4">
              <h3 className="text-sm font-semibold text-text">{t('activityPanel.sections.followUp')}</h3>

              <FormField label={t('activityPanel.fields.followUpDate')}>
                <div className="flex flex-wrap items-center gap-2">
                  <CalendarPicker
                    value={scheduleDate}
                    onChange={setScheduleDate}
                    placeholder={t('activityPanel.placeholders.date')}
                    hasError={showErrors && (isScheduleIncomplete || (selectedAlert != null && !hasFollowUp)) && scheduleDate === ''}
                  />
                  <TimePicker
                    value={scheduleTime}
                    onChange={setScheduleTime}
                    placeholder={t('activityPanel.placeholders.time')}
                    hasError={showErrors && (isScheduleIncomplete || (selectedAlert != null && !hasFollowUp)) && scheduleTime === ''}
                  />
                </div>
                {(scheduleDate !== '' || scheduleTime !== '') && (
                  <Button
                    variant="unstyled"
                    size="xs"
                    onClick={() => {
                      setScheduleDate('');
                      setScheduleTime('');
                    }}
                    className="self-start px-0 text-xs font-medium text-text-muted hover:text-text"
                  >
                    {t('activityPanel.actions.clearSchedule')}
                  </Button>
                )}
              </FormField>

              <FormField label={t('activityPanel.fields.alert')}>
                <AutocompleteSelect
                  value={selectedAlert != null ? String(selectedAlert.alertId) : ''}
                  onChange={(value) => {
                    setSelectedAlertId(value === '' ? null : Number(value));
                  }}
                  options={alertOptions}
                  placeholder={t('activityPanel.placeholders.alert')}
                  disabled={isLoadingAlerts}
                />
              </FormField>

              {!isEditing && (
                <Button
                  variant="unstyled"
                  size="sm"
                  onClick={() => {
                    void saveCallTomorrow();
                  }}
                  disabled={isSaving}
                  title={t('activityPanel.actions.callTomorrowTitle', { time: env.CALL_TOMORROW_TIME })}
                  className="self-start px-0 font-medium text-primary underline underline-offset-2 hover:text-primary-hover"
                >
                  {t('activityPanel.actions.callTomorrow')}
                </Button>
              )}
            </section>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-muted">
            {canSave ? t('activityPanel.hints.ready') : t('activityPanel.hints.selectSomething')}
          </p>
          <div className="flex items-center gap-2">
            {isEditing && (
              <Button variant="secondary" size="md" onClick={resetForm} disabled={isSaving}>
                {t('activityPanel.actions.cancel')}
              </Button>
            )}
            <Button variant="primary" size="md" onClick={handleSave} disabled={!canSave || isSaving}>
              {isSaving
                ? t('activityPanel.actions.saving')
                : isEditing
                  ? t('activityPanel.actions.update')
                  : t('activityPanel.actions.save')}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-text">{t('activityPanel.history.title')}</h2>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {historyItems.length}
          </span>
        </div>

        {!isLoadingHistory && historyItems.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-8 text-center">
            <InboxArrowDownIcon className="h-6 w-6 text-text-muted" />
            <p className="text-sm text-text-muted">{t('activityPanel.history.empty')}</p>
            <p className="text-xs text-text-subtle">{t('activityPanel.history.emptyHint')}</p>
          </div>
        ) : (
          <DataGrid<CandidateActivityItem>
            data={pagedItems}
            columns={columns}
            totalRows={sortedItems.length}
            state={gridState}
            onStateChange={setGridState}
            rowId={(row) => String(row.candidateActivityId)}
            loading={isFetchingHistory}
            enableSorting
            getRowClassName={(row) =>
              row.isHighlighted ? 'bg-warning-subtle hover:bg-warning-subtle' : undefined
            }
            layout={{ widthMode: 'fit' }}
          />
        )}
      </div>

      {/* Overdue follow-up: Yes = complete it + new, No = update it, X = save nothing */}
      <ConfirmModal
        open={overdueSave != null}
        onClose={() => {
          setOverdueSave(null);
        }}
        onCancel={() => {
          handleOverdueChoice('UPDATE_EXISTING');
        }}
        onConfirm={() => {
          handleOverdueChoice('COMPLETE_AND_NEW');
        }}
        title={t('activityPanel.overdueFollowUp.title')}
        message={t('activityPanel.overdueFollowUp.message')}
        question={t('activityPanel.overdueFollowUp.question')}
        cancelLabel={t('activityPanel.overdueFollowUp.no')}
        confirmLabel={t('activityPanel.overdueFollowUp.yes')}
      />
    </div>
  );
}
