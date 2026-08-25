export type CandidateTab = 'success' | 'duplicate' | 'incomplete';

// ── Raw API types (used only in mappers) ──────────────────────────────────────

export interface RawFieldValue<T> {
  value: T;
  evidence: string | null;
  confidence: number;
}

export interface RawEducationEntry {
  degree: string;
  field_of_study: string | null;
  institution: string;
  start_date: string | null;
  end_date: string | null;
}

export interface RawExperienceEntry {
  company: string;
  position: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  tech_used: string[] | null;
  key_responsibilities: string[];
}

export interface RawPersonalInfo {
  full_name: RawFieldValue<string>;
  email: RawFieldValue<string>;
  phone: RawFieldValue<string>;
  location: RawFieldValue<string>;
  linkedin_url: RawFieldValue<string | null>;
  github_url: RawFieldValue<string | null>;
  portfolio_links: RawFieldValue<string[] | string | null>;
}

export interface RawProfessionalInfo {
  job_title: RawFieldValue<string>;
  current_company: RawFieldValue<string>;
  total_years_experience: RawFieldValue<number>;
  education: RawFieldValue<RawEducationEntry[]>;
  technical_stack_and_tools: RawFieldValue<string[]>;
  core_skills: RawFieldValue<string[]>;
  soft_skills: RawFieldValue<string[]>;
  Experience: { value: RawExperienceEntry[]; confidence?: number };
  key_responsibilities: RawFieldValue<string[]>;
}

export interface RawPositionRelevance {
  match: boolean;
  position_title: string;
  resume_job_title: string;
  reason: string;
}

export interface RawCandidateItem {
  filename: string;
  status: string;
  isSelected?: boolean;
  personal_info: RawPersonalInfo;
  professional_info: RawProfessionalInfo;
  position_relevance: RawPositionRelevance | null;
  resume_file_path: string;
}

export interface RawDuplicateItem extends RawCandidateItem {
  reason: string;
}

export interface RawUploadResumesResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    status: string;
    successExtraction: RawCandidateItem[];
    duplicate: RawDuplicateItem[];
    incomplete: RawCandidateItem[];
  };
}

// ── Domain types (used by components) ────────────────────────────────────────

export interface CandidateEducation {
  degree: string;
  fieldOfStudy: string | null;
  institution: string;
  startDate: string | null;
  endDate: string | null;
}

export interface CandidateWorkHistory {
  company: string;
  position: string;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  techUsed: string[];
  keyResponsibilities: string[];
}

interface CandidateBase {
  filename: string;
  name: string;
  jobTitle: string;
  currentCompany: string;
  totalExperienceYears: number;
  email: string;
  phone: string;
  location: string;
  isSelected: boolean;
  allSkills: string[];
  education: CandidateEducation[];
  workHistory: CandidateWorkHistory[];
  resumeFilePath: string;
}

export interface SuccessCandidate extends CandidateBase {
  topSkills: string[];
  linkedinUrl: string | null;
  githubUrl: string | null;
  keyResponsibilities: string[];
}

export interface DuplicateCandidate extends SuccessCandidate {
  duplicateReason: string;
}

export interface IncompleteCandidate extends CandidateBase {
  reviewReason: string;
}

export interface CandidateDrawerData {
  name: string;
  jobTitle: string;
  currentCompany: string;
  totalExperienceYears: number;
  email: string;
  phone: string;
  location: string;
  allSkills: string[];
  education: CandidateEducation[];
  workHistory: CandidateWorkHistory[];
  resumeFilePath: string;
}

export interface UploadResumesResult {
  successCandidates: SuccessCandidate[];
  duplicateCandidates: DuplicateCandidate[];
  incompleteCandidates: IncompleteCandidate[];
  rawItems: {
    successExtraction: RawCandidateItem[];
    duplicate: RawDuplicateItem[];
    incomplete: RawCandidateItem[];
  };
}

export interface UploadResumesRequest {
  positionTitle: string;
  jdId: number;
  files: File[];
}

export interface CandidateSavePayload {
  successCandidates: SuccessCandidate[];
  duplicateCandidates: DuplicateCandidate[];
  incompleteCandidates: IncompleteCandidate[];
}

export interface ProcessingSummary {
  total: number;
  success: number;
  duplicate: number;
  incomplete: number;
}

// ── Candidate List types ──────────────────────────────────────────────────────

export interface RawCandidateListSummary {
  active_jds: number;
  strong_match: number;
  avg_match_score: number;
  pending_scoring: number;
  total_candidates: number;
  scored_candidates: number;
}

export interface RawCandidateListItem {
  candidate_id: number;
  jd_id: number;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  current_job_title: string;
  current_company: string;
  total_experience: number;
  degree: string;
  final_score: number | null;
  verdict: string | null;
  technical_skills: string[];
}

export interface RawPagination {
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface Pagination {
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface RawCandidateListResponse {
  success: boolean;
  data: {
    summary: RawCandidateListSummary;
    candidates: RawCandidateListItem[];
    pagination?: RawPagination;
  };
}

export interface CandidateListSummary {
  activeJds: number;
  strongMatch: number;
  avgMatchScore: number;
  pendingScoring: number;
  totalCandidates: number;
  scoredCandidates: number;
}

export interface CandidateListItem {
  candidateId: number;
  jdId: number;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  currentJobTitle: string;
  currentCompany: string;
  totalExperience: number;
  degree: string;
  finalScore: number | null;
  verdict: string | null;
  technicalSkills: string[];
}

export interface CandidateListResult {
  summary: CandidateListSummary;
  candidates: CandidateListItem[];
  pagination?: Pagination;
}

export interface CandidateListParams {
  jd_id?: string;
  search_text?: string;
  verdict?: string;
  experience_range?: string;
  status_id?: string;
  page?: number;
  page_size?: number;
}

export interface SaveCandidatesRequest {
  jd_id: number;
  candidates: RawCandidateItem[];
}

export interface SaveCandidatesResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    status: string;
    saved_count: number;
    candidate_ids: Array<number | string>;
  };
  meta: {
    requestId: string;
    timestamp: string;
  };
}

export interface UpdateCandidateScoreRequest {
  jd_id: number;
  candidate_ids: number[];
}

export interface UpdateCandidateScoreResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    total_scored: number;
  };
  meta: {
    requestId: string;
    timestamp: string;
  };
}

// ── Candidate Detail API Types ────────────────────────────────────────────────

export interface RawCandidateDetailPersonal {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_links: string[];
}

export interface RawCandidateDetailProfessional {
  current_company: string;
  current_job_title: string;
  total_experience: number;
}

export interface RawCandidateDetailResume {
  file_name: string;
  file_path: string;
}

export interface RawCandidateDetailSkills {
  technical: string[];
  soft: string[];
  core: string[];
}

export interface RawCandidateDetailEducation {
  degree: string;
  field_of_study: string;
  institution_name: string;
}

export interface RawCandidateDetailExperience {
  job_title: string;
  company_name: string;
  start_date: string | null;
  end_date: string | null;
  responsibilities: string[];
}

export interface RawScoreGroupBreakdown {
  group_score_id: number;
  group_key: string;
  group_name: string;
  weight: number;
  group_score: number;
  final_contribution: number;
  present_required: string[];
  missing_required: string[];
  optional_present: string[];
  optional_missing: string[];
  hr_feedback: { feedback_type_id: number; user_feedback: string } | null;
}

export interface RawCandidateDetailScore {
  score_id: number;
  base_score: number;
  final_score: number;
  verdict: string;
  group_breakdown: RawScoreGroupBreakdown[];
}

export interface RawCandidateDetailResponse {
  success: boolean;
  data: {
    candidate_id: number;
    personal_info: RawCandidateDetailPersonal;
    professional_info: RawCandidateDetailProfessional;
    resume: RawCandidateDetailResume;
    skills: RawCandidateDetailSkills;
    education: RawCandidateDetailEducation[];
    experience: RawCandidateDetailExperience[];
    score: RawCandidateDetailScore | null;
    meta?: {
      jd_id?: number;
      created_date?: string;
    };
  };
}

// ── Upload Status types ───────────────────────────────────────────────────────

export interface RawUploadStatusCandidate {
  candidate_id: number;
  full_name: string;
  email: string | null;
  phone: string | null;
  current_job_title: string | null;
  upload_status: string;
  status_code: string | null;
  reason: string | null;
  created_date: string;
}

export interface RawUploadStatusResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    complete: RawUploadStatusCandidate[];
    duplicate: RawUploadStatusCandidate[];
    incomplete: RawUploadStatusCandidate[];
  };
}

export interface UploadStatusCandidate {
  candidateId: number;
  fullName: string;
  email: string | null;
  phone: string | null;
  currentJobTitle: string | null;
  uploadStatus: 'complete' | 'duplicate' | 'incomplete';
  statusCode: string | null;
  reason: string | null;
  createdDate: string;
}

export interface UploadStatusResult {
  complete: UploadStatusCandidate[];
  duplicate: UploadStatusCandidate[];
  incomplete: UploadStatusCandidate[];
}

// ── Candidate Detail Domain Types ─────────────────────────────────────────────

export interface CandidateDetailScoreGroup {
  groupScoreId: number;
  groupKey: string;
  groupName: string;
  weight: number;
  groupScore: number;
  finalContribution: number;
  presentRequired: string[];
  missingRequired: string[];
  optionalPresent: string[];
  optionalMissing: string[];
  hrFeedback: { feedbackTypeId: number; userFeedback: string } | null;
}

export interface CandidateDetailScore {
  scoreId: number;
  baseScore: number;
  finalScore: number;
  verdict: string;
  groupBreakdown: CandidateDetailScoreGroup[];
}

export interface CandidateDetailEducation {
  degree: string;
  fieldOfStudy: string;
  institutionName: string;
}

export interface CandidateDetailExperience {
  jobTitle: string;
  companyName: string;
  startDate: string | null;
  endDate: string | null;
  responsibilities: string[];
}

export interface CandidateDetail {
  candidateId: number;
  personal: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    githubUrl: string | null;
    linkedinUrl: string | null;
    portfolioLinks: string[];
  };
  professional: {
    currentCompany: string;
    currentJobTitle: string;
    totalExperience: number;
  };
  resume: {
    fileName: string;
    filePath: string;
  };
  skills: {
    technical: string[];
    soft: string[];
    core: string[];
  };
  education: CandidateDetailEducation[];
  experience: CandidateDetailExperience[];
  score: CandidateDetailScore | null;
  jdId: number | null;
  jdTitle: string | null;
}

// ── HR Questions ──────────────────────────────────────────────────────────────

export interface RawHRQuestionOption {
  option_id: number;
  option_label: string;
  option_value: string;
}

export interface RawHRAnswerItem {
  question_id: number;
  question_key: string;
  question_text: string;
  input_type: string;
  is_required: boolean;
  display_order: number;
  group: { group_id: number; group_name: string } | null;
  options: RawHRQuestionOption[];
  answer_text: string | null;
}

export interface RawHRAnswersResponse {
  success: boolean;
  data: RawHRAnswerItem[];
}

export interface HRQuestionOption {
  optionId: number;
  optionLabel: string;
  optionValue: string;
}

export type HRInputType = 'textbox' | 'textarea' | 'single_select' | 'multi_select';

export interface HRAnswerQuestion {
  questionId: number;
  questionKey: string;
  questionText: string;
  inputType: HRInputType;
  isRequired: boolean;
  displayOrder: number;
  groupId: number | null;
  groupName: string | null;
  options: HRQuestionOption[];
  answerText: string | null;
}

// ── Save HR Answers ───────────────────────────────────────────────────────────

export interface SaveHRAnswerItem {
  question_key: string;
  answer_text: string;
}

export interface SaveHRAnswersRequest {
  candidate_id: number;
  answers: SaveHRAnswerItem[];
}

// ── Update Candidate Info ─────────────────────────────────────────────────────

export interface UpdateCandidateInfoRequest {
  candidate_id: number;
  email: string;
  phone: string;
  total_experience: number;
}

// ── Save HR Feedback ──────────────────────────────────────────────────────────

export interface SaveHRFeedbackItem {
  group_score_id: number;
  feedback_type_id: number;
  user_feedback: string;
}

export interface SaveHRFeedbackRequest {
  candidate_id: number;
  feedbacks: SaveHRFeedbackItem[];
}
