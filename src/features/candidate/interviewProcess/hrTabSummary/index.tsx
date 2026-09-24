import type { JSX } from 'react';
import { useGetCandidateHistoryQuery } from '../api/interviewProcess.api';
import { Stepper } from '../components/stepper';
import { HistoryList } from '../components/historyList';
import { decisionLabel as decisionLabelFor, decisionVariant } from '../utils/labels';

export interface InterviewUpdateSummaryProps {
  candidateId: number;
  t: (key: string) => string;
}

/**
 * Read-only round history for the HR Evaluation tab's "Interview Update" section — display
 * purposes only, no decision/save controls. Those stay exclusive to the Interview Process tab.
 */
export function InterviewUpdateSummary({ candidateId, t }: InterviewUpdateSummaryProps): JSX.Element | null {
  const tp = (key: string): string => t(`details.interviewProcess.${key}`);
  const decisionLabel = (code: Parameters<typeof decisionLabelFor>[1]): string => decisionLabelFor(t, code);

  const { data: snapshot, isLoading } = useGetCandidateHistoryQuery(candidateId, {
    skip: isNaN(candidateId),
  });

  if (isLoading) {
    return <div className="h-16 animate-pulse rounded-xl bg-surface-muted" />;
  }
  if (snapshot == null) return null;

  const hasStarted = snapshot.history.length > 0 || snapshot.pendingRound != null;

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
        {tp('hrTab.title')}
      </h3>

      {!hasStarted ? (
        <p className="text-xs text-text-muted">{tp('hrTab.notStarted')}</p>
      ) : (
        <div className="flex flex-col gap-5">
          <Stepper
            history={snapshot.history}
            pendingRound={snapshot.pendingRound}
            decisionLabel={decisionLabel}
            inProgressLabel={tp('stepper.inProgress')}
          />
          <HistoryList
            rounds={snapshot.history}
            title={tp('history.title')}
            emptyText={tp('emptyHistory')}
            decisionLabel={decisionLabel}
            decisionVariant={decisionVariant}
            interviewersLabel={tp('history.interviewers')}
            noAnswersText={tp('history.noAnswers')}
          />
        </div>
      )}
    </div>
  );
}
