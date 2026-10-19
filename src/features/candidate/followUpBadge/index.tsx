import type { JSX } from 'react';
import clsx from 'clsx';
import { format, isToday } from 'date-fns';
import { BellIcon } from '@/icons';
import { useT } from '@/i18n/useT';

interface FollowUpBadgeProps {
  /** Naive local date-time of the pending follow-up (no time zone) */
  date: string | null;
  isOverdue: boolean;
}

// follow_up_date is stored without a time zone — read it as literal local time,
// ignoring any 'Z' / offset the API may attach.
function parseNaiveDateTime(value: string): Date {
  return new Date(value.replace(/Z$|[+-]\d{2}:?\d{2}$/i, ''));
}

// Pending follow-up marker on the candidate list (grid + card):
// red = date/time passed, amber = today or upcoming.
export function FollowUpBadge({ date, isOverdue }: FollowUpBadgeProps): JSX.Element {
  const { t } = useT('candidate');
  const parsed = date != null ? parseNaiveDateTime(date) : null;

  const label =
    parsed == null
      ? t('followUpBadge.noDate')
      : isOverdue
        ? t('followUpBadge.overdue', { date: format(parsed, 'd MMM, h:mm a') })
        : isToday(parsed)
          ? t('followUpBadge.today', { time: format(parsed, 'h:mm a') })
          : t('followUpBadge.upcoming', { date: format(parsed, 'd MMM, h:mm a') });

  return (
    <span
      title={parsed != null ? t('followUpBadge.title', { date: format(parsed, 'd MMM yyyy, h:mm a') }) : undefined}
      className={clsx(
        'inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium',
        isOverdue ? 'bg-error/10 text-error' : 'bg-warning/10 text-warning'
      )}
    >
      <BellIcon className="h-3 w-3 shrink-0" />
      {label}
    </span>
  );
}
