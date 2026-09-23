import type { JSX } from 'react';
import clsx from 'clsx';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@/icons';
import { formatDisplayDateTime } from '../../utils/dateTime';
import type { HistoryRound, PendingRound, RoundActionCode } from '../../types/interviewProcess.types';

export interface StepperProps {
  history: HistoryRound[];
  pendingRound: PendingRound | null;
  decisionLabel: (code: RoundActionCode | null) => string;
  inProgressLabel: string;
}

const POSITIVE_CODES: RoundActionCode[] = ['SHORTLISTED', 'MOVE_TO_NEXT_ROUND', 'FINAL_SELECT'];

/**
 * Timeline built only from rounds actually attempted so far (from history, in the order
 * they happened), plus the currently pending round — never a fixed numbered template,
 * since round order is not fixed and any round can be repeated.
 */
export function Stepper({ history, pendingRound, decisionLabel, inProgressLabel }: StepperProps): JSX.Element {
  const journeyIds: number[] = [];
  history.forEach((h) => {
    if (!journeyIds.includes(h.roundId)) journeyIds.push(h.roundId);
  });
  if (pendingRound != null && !journeyIds.includes(pendingRound.roundId)) {
    journeyIds.push(pendingRound.roundId);
  }

  return (
    <div className="flex items-start overflow-x-auto pb-1">
      {journeyIds.map((roundId, i) => {
        const attempts = history.filter((h) => h.roundId === roundId);
        const latest = attempts[attempts.length - 1];
        const isCurrent = pendingRound != null && pendingRound.roundId === roundId;
        const roundName = isCurrent ? pendingRound.roundName : (latest?.roundName ?? '');

        let circle: JSX.Element;
        let labelClass = 'text-xs font-semibold text-text';
        let sub: JSX.Element;
        let connectorClass = 'border-t-2 border-dashed border-border-muted';

        if (isCurrent) {
          circle = (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs font-bold text-white ring-4 ring-primary-subtle">
              {i + 1}
            </div>
          );
          labelClass = 'text-xs font-bold text-primary';
          const attemptTag = attempts.length > 0 ? ` (${attempts.length + 1})` : '';
          sub = <span className="text-[10px] font-semibold text-primary">{inProgressLabel}</span>;
          return (
            <StepCell
              key={roundId}
              circle={circle}
              label={roundName + attemptTag}
              labelClass={labelClass}
              sub={sub}
              showConnector={i < journeyIds.length - 1}
              connectorClass={connectorClass}
            />
          );
        }

        const code = latest?.actionCode ?? null;
        if (code != null && POSITIVE_CODES.includes(code)) {
          circle = (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-success bg-success-subtle text-success">
              <CheckCircleIcon className="h-5 w-5" />
            </div>
          );
          sub = <span className="text-[10px] text-text-muted">{decisionLabel(code)} · {formatDisplayDateTime(latest.createdDate).split(' · ')[0]}</span>;
          connectorClass = 'bg-success';
        } else if (code === 'REJECTED') {
          circle = (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-error bg-error-subtle text-error">
              <XCircleIcon className="h-5 w-5" />
            </div>
          );
          labelClass = 'text-xs font-semibold text-error';
          sub = <span className="text-[10px] text-error">{decisionLabel(code)}</span>;
          connectorClass = 'bg-error';
        } else if (code === 'HOLD') {
          circle = (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-warning bg-warning-subtle text-warning">
              <ClockIcon className="h-5 w-5" />
            </div>
          );
          labelClass = 'text-xs font-semibold text-warning';
          sub = <span className="text-[10px] text-warning">{decisionLabel(code)}</span>;
        } else {
          circle = (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border-muted bg-surface-muted text-text-muted text-xs font-bold">
              {i + 1}
            </div>
          );
          sub = <span className="text-[10px] text-text-muted">—</span>;
        }

        return (
          <StepCell
            key={roundId}
            circle={circle}
            label={roundName}
            labelClass={labelClass}
            sub={sub}
            showConnector={i < journeyIds.length - 1}
            connectorClass={connectorClass}
          />
        );
      })}
    </div>
  );
}

function StepCell({
  circle,
  label,
  labelClass,
  sub,
  showConnector,
  connectorClass,
}: {
  circle: JSX.Element;
  label: string;
  labelClass: string;
  sub: JSX.Element;
  showConnector: boolean;
  connectorClass: string;
}): JSX.Element {
  return (
    <>
      <div className="flex w-[140px] shrink-0 flex-col items-center gap-2 text-center">
        {circle}
        <span className={labelClass}>{label}</span>
        {sub}
      </div>
      {showConnector && <div className={clsx('mt-5 h-0.5 flex-grow', connectorClass)} />}
    </>
  );
}
