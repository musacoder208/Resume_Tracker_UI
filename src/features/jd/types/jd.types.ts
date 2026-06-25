export type AnswerType = 'FREE_TEXT' | 'SINGLE_ENUM' | 'MULTI_SELECT';
export type QuestionMode = 'initial' | 'clarification' | 'crossfield';
export type EditStep = 'collect_reason' | 'collect_impacted' | 'final_confirm' | 'cancelled';

export interface MasterDataItem {
  id: number;
  name: string;
}

export interface MasterData {
  jobTitles: MasterDataItem[];
  seniorities: MasterDataItem[];
  feedbackStatuses: MasterDataItem[];
  statuses: Record<string, MasterDataItem[]>;
}

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

export interface EditNextQuestion {
  text: string;
  field_key: string;
  question_id?: string;
  mode?: string;
  can_be_skipped?: boolean;
  allowed_values?: string[] | null;
  answer_type?: AnswerType;
}

export interface EditJdQaBody {
  jd_id: number;
  field_key: string;
  answer: string;
  field_values: FieldValues;
  field_progress: Record<string, unknown>;
}

export interface RawEditJdQaData {
  step: EditStep;
  next_question: EditNextQuestion;
}

export interface EditJdQaData {
  step: EditStep;
  question: EditNextQuestion;
}

export interface RawUpdateJdAnswerData {
  completed: boolean;
  cancelled?: boolean;
  step?: EditStep;
  next_question?: EditNextQuestion;
}

export interface UpdateJdAnswerData {
  step?: EditStep;
  question?: EditNextQuestion;
  completed: boolean;
  cancelled?: boolean;
  message: string;
}

// ── Raw API response shapes (before mapping) ──────────────────────────────────

interface RawConflictContext {
  resolved_conflict_ids?: ResolvedConflict[];
}

interface RawDataBlob {
  interactions: Interaction[];
  conflict_context: RawConflictContext;
  field_values?: FieldValues;
  field_progress?: Record<string, unknown>;
}

export interface RawStartJdData {
  session_id: string;
  jd_id?: number;
  next_question: Question | null;
  data_blob: RawDataBlob;
  total_questions_count?: number;
}

export interface RawAnswerJdData {
  jd_id?: number;
  next_question: Question | null;
  theory?: string | null;
  data_blob?: RawDataBlob;
}

export interface RawMasterData {
  industryTypes: MasterDataItem[];
  jobTitles: MasterDataItem[];
  seniorities: MasterDataItem[];
  feedbackStatuses?: MasterDataItem[];
  statuses?: Record<string, MasterDataItem[]>;
}

// ── Domain types (flat — what components consume) ─────────────────────────────

export interface StartJdData {
  session_id: string;
  jdId?: number;
  next_question: Question | null;
  resolved_conflict_ids: ResolvedConflict[];
  interactions: Interaction[];
  field_values?: FieldValues;
  field_progress?: Record<string, unknown>;
  totalQuestionsCount?: number;
}

export interface AnswerJdData {
  jdId?: number;
  message: string;
  next_question: Question | null;
  resolved_conflict_ids: ResolvedConflict[];
  interactions: Interaction[];
  theory?: string;
  field_values?: FieldValues;
  field_progress?: Record<string, unknown>;
}

export interface SubmitJdAnswerBody {
  jd_id?: number;
  answer: string;
  job_title_id: number;
  seniority_id: number;
}

// ── JD Details (view mode) ────────────────────────────────────────────────────

export interface ExperienceYears {
  min: number | null;
  max: number | null;
}

export interface FieldValues {
  role_title?: string;
  department?: string;
  seniority_level?: string;
  employment_type?: string;
  work_model?: string;
  core_responsibilities?: string[];
  required_skills?: string[];
  preferred_skills?: string[];
  experience_years?: ExperienceYears | null;
  education_requirements?: string;
  reporting_structure?: string;
  collaboration_expectations?: string;
  salary_range?: string;
  final_additional_info?: string;
}

export interface JdDetailsDataBlob {
  field_values: FieldValues;
  field_progress?: Record<string, unknown>;
  interactions: Interaction[];
  org_dna_snapshot?: Record<string, unknown>;
}

export interface WeightageCapability {
  weight: number;
  required: string[];
  optional: string[];
  description: string;
}

export interface WeightageJson {
  role_title: string;
  capabilities: Record<string, WeightageCapability>;
  constraints: unknown[];
  total_weight: number;
  generated_from: string[];
}

export interface JdDetails {
  jdId: number;
  jobTitleId: number;
  seniorityId: number;
  jobTitle: string;
  sessionId: string;
  statusName: string;
  statusCode: string;
  theory: string | null;
  dataBlob: JdDetailsDataBlob;
  isWeightage: boolean;
  weightageJson: WeightageJson | null;
  orgDnaSnapshot: Record<string, unknown>;
  total_questions_count?: number;
  totalQuestionsCount?: number;
}

export interface StartJdBody {
  jdId?: number;
  dataBlob: JdDetailsDataBlob;
}

// ── Landing page — getAllJDs ───────────────────────────────────────────────────

export interface JdCounts {
  totalJds: number;
  addedThisWeek: number;
  remoteRoles: number;
  hybridRoles: number;
  draftCount: number;
  inProgressCount: number;
  completedCount: number;
  totalCount: number;
  totalPages: number;
}

export interface JdListItem {
  jd_id: number;
  job_title: string;
  seniority: string;
  min_exp: number | null;
  max_exp: number | null;
  is_active: boolean;
  status_name: string;
  status_id: number;
  start_date: string;
  end_date: string | null;
  work_model: string | null;
  created_by?: string | null;
  created_date?: string | null;
  total_questions_count?: number | null;
  answered_questions_count?: number | null;
}

export interface JdListData {
  counts: JdCounts;
  list: JdListItem[];
}

export type JdSortBy =
  | 'job_title'
  | 'seniority'
  | 'min_exp'
  | 'max_exp'
  | 'status_name'
  | 'work_model'
  | 'start_date';

export interface GetAllJDsParams {
  job_title_id?: number;
  seniority_id?: number;
  status_id?: number;
  page?: number;
  page_size?: number;
  sort_by?: JdSortBy;
  sort_order?: 'asc' | 'desc';
}

// ── Update theory ─────────────────────────────────────────────────────────────

export interface UpdateTheoryBody {
  jd_id: number;
  edit_command: string;
  field_values: FieldValues;
  rendered_text: string;
}

export interface UpdateTheoryData {
  success: boolean;
  message: string;
  rendered_text: string;
  response: string;
  updated_field_values: FieldValues;
  modified_fields: string[];
}

export interface RawUpdateTheoryData {
  rendered_text: string;
  response: string;
  updated_field_values: FieldValues;
  modified_fields: string[];
}

// ── Update Weightage ──────────────────────────────────────────────────────────

export interface UpdateWeightageBody {
  jd_id: number;
  user_command: string;
  field_values: FieldValues;
  current_weights: WeightageJson;
  company_info: Record<string, unknown>;
}

export interface UpdateWeightageData {
  success: boolean;
  message: string;
  weightsUpdated: boolean;
  responseText: string;
}

// ── Generate Weightage ────────────────────────────────────────────────────────

export interface GenerateWeightageBody {
  jd_id: number;
  additional_notes: string;
  field_values: FieldValues;
  field_progress: Record<string, unknown>;
  company_info: Record<string, unknown>;
}

export interface GenerateWeightageData {
  message: string;
}

