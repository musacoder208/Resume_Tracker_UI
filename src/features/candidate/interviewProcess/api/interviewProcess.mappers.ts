import type {
  RawLookupResponse,
  LookupOption,
  RawCandidateRequisitionResponse,
  CandidateRequisition,
  RawInterviewersResponse,
  RawQuestionsResponse,
  InterviewQuestion,
  RawSnapshotResponse,
  CandidateInterviewSnapshot,
  RawHistoryItem,
  HistoryRound,
  RawPendingRound,
  PendingRound,
  Interviewer,
} from '../types/interviewProcess.types';

/**
 * Postgres BIGINT columns come back from node-postgres as strings (to avoid precision loss),
 * but the same ids embedded inside a JSONB blob (built with to_jsonb() in SQL) arrive as real
 * JSON numbers — so the same id can show up typed differently depending on which endpoint sent
 * it. Every numeric id is coerced through here so equality/dedup checks (Map keys, .includes(),
 * .find()) never silently fail against a same-value-different-type id.
 */
function toNum(value: number | string): number {
  return typeof value === 'number' ? value : Number(value);
}
function toNumOrNull(value: number | string | null | undefined): number | null {
  return value == null ? null : toNum(value);
}

export const mapLookupResponse = (raw: RawLookupResponse): LookupOption[] =>
  (raw.data ?? []).map((item) => ({
    value: String(item.id),
    label: item.name,
    code: item.code,
    id: toNum(item.id),
  }));

export const mapInterviewersResponse = (raw: RawInterviewersResponse): Interviewer[] =>
  (raw.data ?? []).map((item) => ({ id: toNum(item.empid), name: item.empname }));

export const mapCandidateRequisitionResponse = (raw: RawCandidateRequisitionResponse): CandidateRequisition => ({
  candidateId: toNum(raw.data.candidateId),
  jdId: toNum(raw.data.jdId),
  jobTitleId: toNum(raw.data.jobTitleId),
  seniorityId: toNum(raw.data.seniorityId),
});

export const mapQuestionsResponse = (raw: RawQuestionsResponse): InterviewQuestion[] =>
  (raw.data ?? []).map((q) => ({
    questionId: toNum(q.questionId),
    mappingId: toNum(q.mappingId),
    text: q.text,
    controlType: q.controlType,
    isRequired: q.isRequired,
  }));

function zipInterviewers(ids: Array<number | string>, names: string[]): Interviewer[] {
  return ids.map((id, i) => ({ id: toNum(id), name: names[i] ?? String(id) }));
}

function mapPendingRound(raw: RawPendingRound | null): PendingRound | null {
  if (raw == null) return null;
  return {
    roundId: toNum(raw.roundId),
    roundName: raw.roundName,
    interviewers: zipInterviewers(raw.interviewerIds, raw.interviewerNames),
    interviewDatetime: raw.interviewDatetime,
    interviewType: raw.interviewType,
  };
}

function mapHistoryItem(raw: RawHistoryItem): HistoryRound {
  return {
    transId: toNum(raw.transId),
    roundId: toNum(raw.roundId),
    roundName: raw.roundName,
    roundCode: raw.roundCode,
    interviewers: zipInterviewers(raw.interviewerIds, raw.interviewerNames),
    interviewDatetime: raw.interviewDatetime,
    interviewType: raw.interviewType,
    contactStatusId: toNumOrNull(raw.contactStatusId),
    contactStatusName: raw.contactStatusName,
    actionId: toNumOrNull(raw.actionId),
    actionName: raw.actionName,
    actionCode: raw.actionCode,
    nextRoundId: toNumOrNull(raw.nextRoundId),
    nextRoundName: raw.nextRoundName,
    nextInterviewers: zipInterviewers(raw.nextInterviewerIds, raw.nextInterviewerNames),
    nextInterviewDatetime: raw.nextInterviewDatetime,
    nextInterviewType: raw.nextInterviewType,
    answers: raw.answers.map((a) => ({
      questionId: toNum(a.questionId),
      mappingId: toNum(a.mappingId),
      questionText: a.questionText,
      answerText: a.answerText,
    })),
    createdDate: raw.createdDate,
  };
}

export const mapSnapshotResponse = (raw: RawSnapshotResponse): CandidateInterviewSnapshot => ({
  candidateId: toNum(raw.data.candidateId),
  candidateStatus: raw.data.candidateStatus,
  currentContactStatusId: toNumOrNull(raw.data.currentContactStatusId),
  pendingRound: mapPendingRound(raw.data.pendingRound),
  history: (raw.data.history ?? []).map(mapHistoryItem),
  seniorityId: toNumOrNull(raw.data.seniorityId),
});
