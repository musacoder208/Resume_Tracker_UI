import { useMemo, useState, type JSX, type ReactNode } from 'react';
import { format } from 'date-fns';
import { BaseModal } from '@/components/modals/BaseModal';
import { Button } from '@/components/ui/button';
import { AutocompleteSelect } from '@/components/ui/autocompleteSelect';
import { toastService } from '@/components/ui/toast/toastService';
import { CalendarPicker } from '@/features/candidate/interviewProcess/components/calendarPicker';
import { TimePicker } from '@/features/candidate/interviewProcess/components/timePicker';
import {
  useGetActivityListQuery,
  useGetAlertListQuery,
  useSaveCandidateActivityMutation,
} from '../api/candidateActivity.api';
import type { CallbackRequestItem } from '../types/candidateActivity.types';
import { parseNaiveDateTime } from '../utils/callbackDate';

interface RescheduleCallbackModalProps {
  /** The callback being rescheduled — the parent keys this modal by its id. */
  item: CallbackRequestItem;
  onClose: () => void;
  /** Runs after the new callback activity is saved. */
  onRescheduled: (item: CallbackRequestItem) => Promise<void> | void;
}

export function RescheduleCallbackModal({
  item,
  onClose,
  onRescheduled,
}: RescheduleCallbackModalProps): JSX.Element {
  // Prefilled from the callback being rescheduled.
  const current = item.callbackDate != null ? parseNaiveDateTime(item.callbackDate) : null;
  const [date, setDate] = useState(() => (current != null ? format(current, 'yyyy-MM-dd') : ''));
  const [time, setTime] = useState(() => (current != null ? format(current, 'HH:mm') : ''));
  const [notes, setNotes] = useState(item.notes ?? '');
  const [alertId, setAlertId] = useState<number | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  const { data: alerts = [], isLoading: isLoadingAlerts } = useGetAlertListQuery();
  // The callback row has ids/names only — the save needs the activity code.
  const { data: activities = [] } = useGetActivityListQuery();
  const activityCode =
    activities.find((a) => a.activityId === item.activityId)?.activityCode ??
    activities.find((a) => a.activityName === item.activityName)?.activityCode ??
    null;
  const [saveCandidateActivity, { isLoading: isSaving }] = useSaveCandidateActivityMutation();

  const alertOptions = useMemo(
    () => alerts.map((a) => ({ value: String(a.alertId), label: a.alertName })),
    [alerts]
  );

  async function handleSave(): Promise<void> {
    if (activityCode == null) {
      toastService.info('Activity details are still loading. Please try again.');
      return;
    }
    if (date === '' || time === '') {
      setShowErrors(true);
      toastService.info('Please select both a date and a time for the callback.');
      return;
    }

    try {
      // candidate_activity_id is null on purpose — rescheduling inserts a new
      // callback activity instead of updating the existing one.
      await saveCandidateActivity({
        candidate_activity_id: null,
        candidate_id: item.candidateId,
        activity_code: activityCode,
        sub_activity_code: item.subActivityCode ?? undefined,
        notes: notes.trim() === '' ? undefined : notes.trim(),
        start_date: `${date}T${time}:00`,
        alert_id: alertId ?? undefined,
      }).unwrap();

      // Success/error toast handled by apiToastMiddleware.
      await onRescheduled(item);
      onClose();
    } catch {
      // error handled by apiToastMiddleware
    }
  }

  return (
    <BaseModal
      open
      title="Reschedule Callback"
      onClose={isSaving ? undefined : onClose}
      size="lg"
      disableBackdropClose={isSaving}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="md" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              void handleSave();
            }}
            disabled={isSaving}
          >
            {isSaving ? 'Saving…' : 'Reschedule'}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-lg bg-surface-muted/60 px-3 py-2 text-xs text-text-muted">
          <span className="font-semibold text-text">{item.fullName}</span>
          {item.phone != null && <span> · {item.phone}</span>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Activity">
            <ReadOnlyValue value={item.activityName} />
          </Field>
          <Field label="Sub-Activity">
            <ReadOnlyValue value={item.subActivityName} />
          </Field>
        </div>

        <Field label="Callback Date & Time">
          <div className="flex flex-wrap items-center gap-2">
            <CalendarPicker
              value={date}
              onChange={setDate}
              placeholder="Select date"
              hasError={showErrors && date === ''}
            />
            <TimePicker
              value={time}
              onChange={setTime}
              placeholder="Select time"
              hasError={showErrors && time === ''}
            />
          </div>
        </Field>

        <Field label="Alert">
          <AutocompleteSelect
            value={alertId != null ? String(alertId) : ''}
            onChange={(value) => {
              setAlertId(value === '' ? null : Number(value));
            }}
            options={alertOptions}
            placeholder="Select alert…"
            disabled={isLoadingAlerts}
          />
        </Field>

        <Field label="Notes">
          <textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
            }}
            placeholder="Add any context about this callback…"
            className="min-h-[64px] w-full resize-y rounded-lg border border-border-muted bg-surface-muted/40 p-3 text-xs text-text placeholder:text-text-muted"
          />
        </Field>
      </div>
    </BaseModal>
  );
}

function ReadOnlyValue({ value }: { value: string }): JSX.Element {
  return (
    <div className="rounded-lg border border-border-muted bg-surface-muted/40 px-3 py-2 text-xs text-text">
      {value}
    </div>
  );
}

// Same field wrapper as the HR Activity form, so both share one look.
function Field({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-text-muted">{label}</span>
      {children}
    </div>
  );
}
