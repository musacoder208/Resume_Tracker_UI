// ── Raw API shapes (snake_case, as returned by the backend) ───────────────────

export interface RawAiUsageTotals {
  calls: number;
  failed_calls: number;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  total_cost: number | string;
}

export interface RawAiUsageSummary extends RawAiUsageTotals {
  total_jds: number;
  total_candidates: number;
}

export interface RawAiUsageJdRow extends RawAiUsageTotals {
  /** null = calls that could not be linked to any JD ("Unassigned") */
  jd_id: number | null;
  jd_name: string | null;
  created_date: string | null;
  candidate_count: number;
}

export interface RawAiUsageJdsData {
  summary: RawAiUsageSummary;
  list: RawAiUsageJdRow[];
}

export interface RawAiUsageFeature extends RawAiUsageTotals {
  /** audit_records.feature — sub-process */
  feature: string;
}

export interface RawAiUsageProcess extends RawAiUsageTotals {
  /** audit_records.module — main process */
  module: string;
  features: RawAiUsageFeature[];
}

export interface RawAiUsageCandidateRow extends RawAiUsageTotals {
  candidate_id: number;
  full_name: string | null;
  uploaded_date: string | null;
  is_deleted: boolean;
  processes: RawAiUsageProcess[];
}

export interface RawAiUsageCandidatesData {
  total_count: number;
  /** Totals across all candidates of the JD (not just this page) */
  summary?: RawAiUsageTotals;
  list: RawAiUsageCandidateRow[];
}

// ── Mapped shapes (used by the UI) ────────────────────────────────────────────

export interface AiUsageTotals {
  calls: number;
  failedCalls: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  totalCost: number;
}

export interface AiUsageSummary extends AiUsageTotals {
  totalJds: number;
  totalCandidates: number;
}

export interface AiUsageJdRow extends AiUsageTotals {
  jdId: number | null;
  jdName: string | null;
  createdDate: string | null;
  candidateCount: number;
}

export interface AiUsageJdsData {
  summary: AiUsageSummary;
  list: AiUsageJdRow[];
}

export type AiUsageTreeRowKind = 'candidate' | 'module' | 'feature';

/**
 * One row type for every tree grid level:
 * - JD processes grid:  module → feature
 * - Candidates grid:    candidate → module → feature
 * `label` holds the candidate name, or the raw module / feature code.
 */
export interface AiUsageTreeRow extends AiUsageTotals {
  id: string;
  kind: AiUsageTreeRowKind;
  /** Candidate name ('' when the API has none), or the raw module / feature code */
  label: string;
  candidateId?: number;
  uploadedDate?: string | null;
  isDeleted?: boolean;
  children?: AiUsageTreeRow[];
}

export interface AiUsageCandidatesData {
  totalCount: number;
  /** null when the backend sends no summary — the UI then sums the current page */
  summary: AiUsageTotals | null;
  list: AiUsageTreeRow[];
}

// ── Request params ────────────────────────────────────────────────────────────

export interface AiUsageFilterParams {
  /** yyyy-mm-dd, inclusive */
  from_date?: string;
  /** yyyy-mm-dd, inclusive */
  to_date?: string;
  jd_ids?: number[];
}

export interface AiUsageJdDetailParams {
  from_date?: string;
  to_date?: string;
  /** Omitted when `unassigned` is true */
  jd_id?: number;
  /** true = calls that could not be linked to any JD */
  unassigned?: boolean;
}

export interface AiUsageJdCandidatesParams extends AiUsageJdDetailParams {
  page?: number;
  page_size?: number;
}

// ── JD Name filter options (same endpoint as the JD module's dropdown) ────────

export interface RawAiUsageJdOption {
  jd_id: number;
  label: string;
}

export interface AiUsageJdOption {
  jdId: number;
  label: string;
}

// ── Excel export ──────────────────────────────────────────────────────────────

export interface AiUsageExportFile {
  /** Object URL of the downloaded .xlsx blob — revoke after use */
  url: string;
  fileName: string;
}

/** The JD row the user clicked in the JD grid */
export interface SelectedAiUsageJd {
  jdId: number | null;
  jdName: string;
}
