import type { ApiResponse } from '@/types/apiResponse';

// ── Enums (per backend contract) ────────────────────────────────────────────

export type RoundActionCode =
  | 'SHORTLISTED'
  | 'MOVE_TO_NEXT_ROUND'
  | 'FINAL_SELECT'
  | 'HOLD'
  | 'REJECTED';

export type InterviewModeCode = 'ONLINE' | 'OFFLINE';

export type ContactStatusCode =
  | 'CONNECTED'
  | 'UNREACHABLE'
  | 'CALLBACK_REQUESTED'
  | 'NOT_INTERESTED';

export type CandidateStatus =
  | 'Pending'
  | 'Shortlisted'
  | 'In Interview Process'
  | 'Selected'
  | 'Rejected'
  | 'Hold';

export const PRE_SCREENING_ROUND_CODE = 'PRE_SCREENING';

// ── Lookups (GET /rounds, /interview-modes, /contact-statuses, /round-actions) ──

export interface RawLookupItem {
  id: number;
  name: string;
  code: string;
}

export type RawLookupResponse = ApiResponse<RawLookupItem[]>;

export interface LookupOption {
  value: string;
  label: string;
  code: string;
  id: number;
}

// ── Candidate requisition (GET /candidates/:candidateId/requisition) ───────
// Called alongside GET /candidate/getCandidateDetails/:id to resolve the
// jobTitleId + seniorityId needed for GET /questions (the interview-process
// history response doesn't carry either).

export interface RawCandidateRequisition {
  candidateId: number;
  companyId: number;
  jdId: number;
  jobTitleId: number;
  seniorityId: number;
}

export type RawCandidateRequisitionResponse = ApiResponse<RawCandidateRequisition>;

export interface CandidateRequisition {
  candidateId: number;
  jdId: number;
  jobTitleId: number;
  seniorityId: number;
}

// ── Interviewers (GET /interviewers) ────────────────────────────────────────

export interface RawInterviewerItem {
  empid: number;
  empname: string;
}

export type RawInterviewersResponse = ApiResponse<RawInterviewerItem[]>;

// ── Questions (GET /questions) ──────────────────────────────────────────────

export type QuestionControlType = 'textbox' | 'textarea';

export interface RawQuestionItem {
  questionId: number;
  mappingId: number;
  text: string;
  controlType: QuestionControlType;
  isRequired: boolean;
}

export type RawQuestionsResponse = ApiResponse<RawQuestionItem[]>;

export interface InterviewQuestion {
  questionId: number;
  mappingId: number;
  text: string;
  controlType: QuestionControlType;
  isRequired: boolean;
}

export interface GetQuestionsParams {
  jdId: number;
  seniorityId: number;
  roundId: number;
  actionId: number;
}

// ── Candidate interview snapshot (GET history, POST contact-status, POST rounds) ──

export interface Interviewer {
  id: number;
  name: string;
}

export interface RawPendingRound {
  roundId: number;
  roundName: string;
  interviewerIds: number[];
  interviewerNames: string[];
  interviewDatetime: string | null;
  interviewType: InterviewModeCode | null;
}

export interface PendingRound {
  roundId: number;
  roundName: string;
  interviewers: Interviewer[];
  interviewDatetime: string | null;
  interviewType: InterviewModeCode | null;
}

export interface RawHistoryAnswer {
  questionId: number;
  mappingId: number;
  questionText: string;
  answerText: string;
}

export interface HistoryAnswer {
  questionId: number;
  mappingId: number;
  questionText: string;
  answerText: string;
}

export interface RawHistoryItem {
  transId: number;
  roundId: number;
  roundName: string;
  roundCode: string;
  interviewerIds: number[];
  interviewerNames: string[];
  interviewDatetime: string | null;
  interviewType: InterviewModeCode | null;
  contactStatusId: number | null;
  contactStatusName: string | null;
  actionId: number | null;
  actionName: string | null;
  actionCode: RoundActionCode | null;
  nextRoundId: number | null;
  nextRoundName: string | null;
  nextInterviewerIds: number[];
  nextInterviewerNames: string[];
  nextInterviewDatetime: string | null;
  nextInterviewType: InterviewModeCode | null;
  answers: RawHistoryAnswer[];
  createdDate: string;
}

export interface HistoryRound {
  transId: number;
  roundId: number;
  roundName: string;
  roundCode: string;
  interviewers: Interviewer[];
  interviewDatetime: string | null;
  interviewType: InterviewModeCode | null;
  contactStatusId: number | null;
  contactStatusName: string | null;
  actionId: number | null;
  actionName: string | null;
  actionCode: RoundActionCode | null;
  nextRoundId: number | null;
  nextRoundName: string | null;
  nextInterviewers: Interviewer[];
  nextInterviewDatetime: string | null;
  nextInterviewType: InterviewModeCode | null;
  answers: HistoryAnswer[];
  createdDate: string;
}

/**
 * seniorityId is not yet returned by the backend (confirmed gap — the /questions
 * endpoint needs it, but no candidate-scoped response currently carries it).
 * Modelled here as optional/nullable so the UI degrades gracefully (dynamic
 * question block shows an "unavailable" message) until it's added.
 */
export interface RawCandidateInterviewSnapshot {
  candidateId: number;
  candidateStatus: CandidateStatus;
  currentContactStatusId: number | null;
  pendingRound: RawPendingRound | null;
  history: RawHistoryItem[];
  seniorityId?: number | null;
}

export type RawSnapshotResponse = ApiResponse<RawCandidateInterviewSnapshot>;

export interface CandidateInterviewSnapshot {
  candidateId: number;
  candidateStatus: CandidateStatus;
  currentContactStatusId: number | null;
  pendingRound: PendingRound | null;
  history: HistoryRound[];
  seniorityId: number | null;
}

// ── Request payloads ─────────────────────────────────────────────────────────

export interface SaveContactStatusRequest {
  candidateId: number;
  transId?: number;
  roundId: number;
  contactStatusId: number;
}

export interface SaveRoundAnswer {
  questionId: number;
  mappingId: number;
  answerText: string;
}

export interface SaveRoundNextRound {
  roundId: number;
  interviewerIds: number[];
  interviewDatetime: string;
  interviewType: InterviewModeCode;
}

export interface SaveRoundRequest {
  candidateId: number;
  roundId: number;
  interviewerIds: number[];
  interviewDatetime?: string;
  interviewType?: InterviewModeCode;
  actionId: number;
  answers: SaveRoundAnswer[];
  nextRound?: SaveRoundNextRound;
}
