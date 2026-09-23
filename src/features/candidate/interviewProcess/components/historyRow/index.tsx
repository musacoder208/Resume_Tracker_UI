import { useState } from 'react';
import type { JSX } from 'react';
import clsx from 'clsx';
import { ChevronDownIcon, ChevronRightIcon, UsersIcon, SparklesIcon } from '@/icons';
import { StatusBadge } from '@/components/ui/statusBadge';
import { formatDisplayDateTime } from '../../utils/dateTime';
import type { HistoryRound, RoundActionCode } from '../../types/interviewProcess.types';

export interface HistoryRowProps {
  round: HistoryRound;
  decisionLabel: (code: RoundActionCode | null) => string;
  decisionVariant: (code: RoundActionCode | null) => 'success' | 'error' | 'warning' | 'neutral';
  interviewersLabel: string;
  noAnswersText: string;
}

export function HistoryRow({
  round,
  decisionLabel,
  decisionVariant,
  interviewersLabel,
  noAnswersText,
}: HistoryRowProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const interviewerNames = round.interviewers.map((i) => i.name).join(', ');

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); }}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-start"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-muted text-primary">
            <UsersIcon className="h-4 w-4" />
          </div>
          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text">{round.roundName}</span>
              {round.interviewType != null && (
                <StatusBadge dot={false} variant="neutral" label={round.interviewType} />
              )}
            </div>
            <span className="truncate text-[11px] text-text-muted">
              {interviewerNames !== '' && `${interviewersLabel}: ${interviewerNames} · `}
              {formatDisplayDateTime(round.interviewDatetime)}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {round.contactStatusName != null && (
            <StatusBadge dot={false} variant="warning" label={round.contactStatusName} />
          )}
          <StatusBadge dot={false} variant={decisionVariant(round.actionCode)} label={decisionLabel(round.actionCode)} />
          {open ? <ChevronDownIcon className="h-4 w-4 text-text-subtle" /> : <ChevronRightIcon className="h-4 w-4 text-text-subtle" />}
        </div>
      </button>

      {open && (
        <div className="flex flex-col gap-4 border-t border-border-muted bg-surface-muted/30 px-4 py-5">
          <div className="flex items-center gap-2">
            <StatusBadge dot={false} variant="neutral" label={round.roundName} />
            <SparklesIcon className="h-3.5 w-3.5 text-primary" />
          </div>
          {round.answers.length === 0 ? (
            <p className="text-xs italic text-text-subtle">{noAnswersText}</p>
          ) : (
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
              {round.answers.map((a) => (
                <div key={a.questionId} className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-text">{a.questionText}</span>
                  <p className={clsx(
                    'min-h-[40px] w-full whitespace-pre-wrap rounded-lg border border-border-muted bg-surface-muted/40 p-3 text-xs',
                    a.answerText.trim() === '' ? 'italic text-text-subtle' : 'text-text'
                  )}>
                    {a.answerText.trim() === '' ? noAnswersText : a.answerText}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
