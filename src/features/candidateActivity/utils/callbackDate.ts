import { isToday } from 'date-fns';
import type { StatusBadgeVariant } from '@/components/ui/statusBadge';
import type { CallbackRequestItem } from '../types/candidateActivity.types';

// callback_date is the activity's start_date — a timezone-naive column. Read it
// back as literal wall-clock digits (same as the HR Activity history grid),
// ignoring any 'Z'/offset suffix the API response attaches.
export function parseNaiveDateTime(value: string): Date {
  return new Date(value.replace(/Z$|[+-]\d{2}:?\d{2}$/i, ''));
}

type CallbackDueStatus = 'overdue' | 'today' | 'upcoming' | 'noDate';

interface CallbackStatusBadge {
  label: string;
  variant: StatusBadgeVariant;
}

export function isCallbackPending(item: CallbackRequestItem): boolean {
  return item.statusCode === 'PENDING';
}

export function isCallbackCompleted(item: CallbackRequestItem): boolean {
  return item.statusCode === 'COMPLETED';
}

// Overdue comes from the backend's is_overdue as-is; the client only splits the
// remaining pending callbacks into Today / Upcoming.
function getCallbackDueStatus(item: CallbackRequestItem): CallbackDueStatus {
  if (item.isOverdue) return 'overdue';
  if (item.callbackDate == null) return 'noDate';
  return isToday(parseNaiveDateTime(item.callbackDate)) ? 'today' : 'upcoming';
}

const dueStatusBadge: Record<CallbackDueStatus, CallbackStatusBadge> = {
  overdue: { label: 'Overdue', variant: 'error' },
  today: { label: 'Today', variant: 'warning' },
  upcoming: { label: 'Upcoming', variant: 'info' },
  noDate: { label: 'No date', variant: 'neutral' },
};

// PENDING → due state (Overdue / Today / Upcoming / No date), COMPLETED → Completed,
// any other status from the master → its own name, so a new status is never
// mislabelled as Completed.
export function getCallbackStatusBadge(item: CallbackRequestItem): CallbackStatusBadge {
  if (isCallbackPending(item)) return dueStatusBadge[getCallbackDueStatus(item)];
  if (isCallbackCompleted(item)) return { label: 'Completed', variant: 'success' };
  return { label: item.statusName, variant: 'neutral' };
}
