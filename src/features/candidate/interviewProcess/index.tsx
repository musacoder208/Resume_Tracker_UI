import type { JSX } from 'react';
import type { TFunction } from 'i18next';
import { StatusBadge } from '@/components/ui/statusBadge';
import type { StatusBadgeVariant } from '@/components/ui/statusBadge';
import { AlertBanner } from '@/components/ui/alertBanner';
import { useGetCandidateHistoryQuery } from './api/interviewProcess.api';
import { Stepper } from './components/stepper';
import { RoundForm } from './components/roundForm';
import { HistoryList } from './components/historyList';
import { decisionLabel as decisionLabelFor, decisionVariant } from './utils/labels';
import type { CandidateStatus } from './types/interviewProcess.types';

export interface InterviewProcessTabProps {
  candidateId: number;
  /** Actually the candidate's jobTitleId (from the requisition endpoint) — that's what GET /questions expects as its jdId param. */
  jdId: number | null;
  /** Resolved by the caller via GET /candidates/:candidateId/requisition, since the history endpoint does not return it. */
  seniorityId: number | null;
  t: TFunction;
}

const STATUS_VARIANT: Record<CandidateStatus, StatusBadgeVariant> = {
  Pending: 'neutral',
  Shortlisted: 'info',
  'In Interview Process': 'info',
  Selected: 'success',
  Rejected: 'error',
  Hold: 'warning',
};

export function InterviewProcessTab({ candidateId, jdId, seniorityId, t }: InterviewProcessTabProps): JSX.Element {
  const tp = (key: string, opts?: Record<string, unknown>): string => t(`details.interviewProcess.${key}`, opts);
  const decisionLabel = (code: Parameters<typeof decisionLabelFor>[1]): string => decisionLabelFor(t, code);

  const {
    data: snapshot,
    isLoading,
    isError,
  } = useGetCandidateHistoryQuery(candidateId, {
    skip: isNaN(candidateId),
    refetchOnMountOrArgChange: true,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-muted" />
        ))}
      </div>
    );
  }

  if (isError || snapshot == null) {
    return <p className="text-xs text-error">{tp('errors.fetchFailed')}</p>;
  }

  const isTerminal = snapshot.candidateStatus === 'Selected' || snapshot.candidateStatus === 'Rejected';

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-text-muted">{tp('status')}</span>
        <StatusBadge
          label={tp(`statusLabels.${snapshot.candidateStatus}`)}
          variant={STATUS_VARIANT[snapshot.candidateStatus]}
        />
      </div>

      {(snapshot.history.length > 0 || snapshot.pendingRound != null) && (
        <div className="rounded-xl border border-border bg-surface p-6">
          <Stepper
            history={snapshot.history}
            pendingRound={snapshot.pendingRound}
            decisionLabel={decisionLabel}
            inProgressLabel={tp('stepper.inProgress')}
          />
        </div>
      )}

      {isTerminal ? (
        <AlertBanner
          dismissible={false}
          variant={snapshot.candidateStatus === 'Selected' ? 'info' : 'warning'}
          title={snapshot.candidateStatus === 'Selected' ? tp('terminal.selectedTitle') : tp('terminal.rejectedTitle')}
          description={snapshot.candidateStatus === 'Selected' ? tp('terminal.selectedDesc') : tp('terminal.rejectedDesc')}
        />
      ) : (
        <RoundForm
          key={`${snapshot.pendingRound?.roundId ?? 'new'}-${snapshot.history.length}`}
          candidateId={candidateId}
          jdId={jdId}
          seniorityId={seniorityId}
          snapshot={snapshot}
          t={t}
        />
      )}

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
  );
}
