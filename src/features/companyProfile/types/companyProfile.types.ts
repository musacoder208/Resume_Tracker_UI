export type AnswerType = 'FREE_TEXT' | 'SINGLE_ENUM' | 'MULTI_SELECT';
export type QuestionMode = 'initial' | 'clarification' | 'crossfield';

export interface Question {
  text: string;
  field_key: string;
  question_id: string;
  mode: QuestionMode;
  can_be_skipped: boolean;
  allowed_values: string[] | null;
  answer_type: AnswerType;
}

export interface Interaction {
  question_id: string;
  field_key: string;
  question_text: string;
  raw_answer: string;
  mode: QuestionMode;
  allowed_values: string[] | null;
  answer_type: AnswerType;
  can_be_skipped: boolean;
  timestamp: string;
}

export interface ResolvedConflict {
  conflict_id: string;
  [key: string]: unknown;
}

// ── Edit flow ─────────────────────────────────────────────────────────────────

export type EditStep = 'collect_reason' | 'collect_impacted' | 'final_confirm' | 'cancelled';

// next_question in edit responses — final_confirm only sends text + field_key
export interface EditNextQuestion {
  text: string;
  field_key: string;
  question_id?: string;
  mode?: string;
  can_be_skipped?: boolean;
  allowed_values?: string[] | null;
  answer_type?: AnswerType;
}

export interface RawEditQuestionData {
  completed: boolean;
  step: EditStep;
  next_question: EditNextQuestion;
  update_context: Record<string, unknown>;
}

export interface RawUpdateAnswerData {
  completed: boolean;
  cancelled?: boolean;
  step?: EditStep;
  next_question?: EditNextQuestion;
  update_context: Record<string, unknown>;
}

export interface EditQuestionData {
  step: EditStep;
  question: EditNextQuestion;
}

export interface UpdateAnswerData {
  step?: EditStep;
  question?: EditNextQuestion;
  completed: boolean;
  cancelled?: boolean;
  message: string;
}

// ── Raw API response shapes (before mapping) ──────────────────────────────────

interface RawConflictContext {
  resolved_conflict_ids: ResolvedConflict[];
}

interface RawDataBlob {
  interactions: Interaction[];
  conflict_context: RawConflictContext;
}

export interface RawStartData {
  session_id: string;
  next_question: Question | null;
  theory: string | null;
  total_questions_count?: number;
  data_blob: RawDataBlob;
}

export interface RawAnswerData {
  next_question: Question | null;
  theory: string | null;
  data_blob: RawDataBlob;
}

// ── Domain types (flat — what components consume) ─────────────────────────────

export interface StartProfileData {
  session_id: string;
  next_question: Question | null;
  theory: string | null;
  total_questions_count: number;
  resolved_conflict_ids: ResolvedConflict[];
  interactions: Interaction[];
}

export interface AnswerData {
  next_question: Question | null;
  resolved_conflict_ids: ResolvedConflict[];
  interactions: Interaction[];
  completed?: boolean;
  theory?: string;
  message?: string;
}

export interface RawProfileDetailsData {
  theory: string;
}

export interface ProfileDetailsData {
  theory: string | null;
}
