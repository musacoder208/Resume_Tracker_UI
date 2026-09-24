import type { JSX } from 'react';
import { HistoryRow } from '../historyRow';
import type { HistoryRound, RoundActionCode } from '../../types/interviewProcess.types';

export interface HistoryListProps {
  rounds: HistoryRound[];
  title: string;
  emptyText: string;
  decisionLabel: (code: RoundActionCode | null) => string;
  decisionVariant: (code: RoundActionCode | null) => 'success' | 'error' | 'warning' | 'neutral';
  interviewersLabel: string;
  noAnswersText: string;
}

export function HistoryList({
  rounds,
  title,
  emptyText,
  decisionLabel,
  decisionVariant,
  interviewersLabel,
  noAnswersText,
}: HistoryListProps): JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[11px] font-bold uppercase tracking-wide text-text-muted">{title}</span>
      {rounds.length === 0 ? (
        <div className="flex min-h-[100px] items-center justify-center rounded-xl border border-dashed border-border bg-surface">
          <p className="text-xs text-text-muted">{emptyText}</p>
        </div>
      ) : (
        rounds.map((round) => (
          <HistoryRow
            key={round.transId}
            round={round}
            decisionLabel={decisionLabel}
            decisionVariant={decisionVariant}
            interviewersLabel={interviewersLabel}
            noAnswersText={noAnswersText}
          />
        ))
      )}
    </div>
  );
}
