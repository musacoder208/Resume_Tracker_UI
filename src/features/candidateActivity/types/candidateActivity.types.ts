// ── Raw API types (used only in mappers) ──────────────────────────────────────

export interface RawActivity {
  activity_id: number;
  activity_code: string;
  activity_name: string;
  activity_type: string;
}

export interface RawActivityListResponse {
  success: boolean;
  data: RawActivity[];
}

export interface RawSubActivity {
  sub_activity_id: number;
  activity_id: number;
  sub_activity_code: string;
  sub_activity_name: string;
}

export interface RawSubActivityListResponse {
  success: boolean;
  data: RawSubActivity[];
}

export interface RawAlert {
  alert_id: number;
  alert_name: string;
}

export interface RawAlertListResponse {
  success: boolean;
  data: RawAlert[];
}

export interface RawCandidateActivityItem {
  candidate_activity_id: number;
  candidate_id: number;
  activity_id: number;
  activity_name: string;
  sub_activity_id: number | null;
  sub_activity_name: string | null;
  activity_type: string;
  notes: string | null;
  start_date: string | null;
  alert_id: number | null;
  alert_name: string | null;
  is_highlighted: boolean;
  // Activity status — needed to complete the previous pending activity on a new save.
  status_id?: number | null;
  status_code?: string | null;
  status_name?: string | null;
  created_by: number;
  created_date: string;
}

export interface RawCandidateActivityPagination {
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface RawGetCandidateActivityResponse {
  success: boolean;
  data: {
    activities: RawCandidateActivityItem[];
    pagination: RawCandidateActivityPagination;
  };
}

export interface GetCandidateActivityParams {
  candidate_id: number;
  page?: number;
  page_size?: number;
}

// ── Domain types (used by components) ────────────────────────────────────────

export interface Activity {
  activityId: number;
  activityCode: string;
  activityName: string;
  activityType: string;
}

export interface SubActivity {
  subActivityId: number;
  activityId: number;
  subActivityCode: string;
  subActivityName: string;
}

export interface Alert {
  alertId: number;
  alertName: string;
}

export interface CandidateActivityItem {
  candidateActivityId: number;
  candidateId: number;
  activityId: number;
  activityName: string;
  subActivityId: number | null;
  subActivityName: string | null;
  activityType: string;
  notes: string | null;
  startDate: string | null;
  alertId: number | null;
  alertName: string | null;
  isHighlighted: boolean;
  statusId: number | null;
  statusCode: string | null;
  statusName: string | null;
  createdBy: number;
  createdDate: string;
}

export interface CandidateActivityPagination {
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetCandidateActivityResult {
  activities: CandidateActivityItem[];
  pagination: CandidateActivityPagination;
}

export interface SaveCandidateActivityRequest {
  // null/omitted = insert a new activity; a number = update that activity.
  candidate_activity_id?: number | null;
  candidate_id: number;
  // Codes from the activity / sub-activity lists (e.g. "CALL", "CALLBACK_REQUEST"), not ids.
  activity_code: string;
  sub_activity_code?: string;
  notes?: string;
  start_date?: string;
  alert_id?: number;
  is_highlighted?: boolean;
}

export interface SaveCandidateActivityResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    candidate_activity_id: number;
  };
}

export interface SaveCandidateActivityHighlightRequest {
  candidate_activity_id: number;
}

export interface SaveCandidateActivityHighlightResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    candidate_activity_id: number;
    is_highlighted: boolean;
  };
}

// ── Callback requests (User Dashboard) ───────────────────────────────────────

export interface RawCallbackRequestItem {
  candidate_activity_id: number;
  candidate_id: number;
  full_name: string;
  email: string | null;
  phone: string | null;
  current_job_title: string | null;
  current_company: string | null;
  jd_id: number | null;
  jd_name: string | null;
  activity_id: number;
  activity_name: string;
  sub_activity_id: number;
  sub_activity_code?: string | null;
  sub_activity_name: string;
  notes: string | null;
  callback_date: string | null;
  is_overdue: boolean | null;
  status_id: number;
  status_code: string;
  status_name: string;
  is_highlighted: boolean;
  created_by: number;
  created_date: string;
}

export interface RawGetCallbackRequestListResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    callbacks: RawCallbackRequestItem[];
    pagination: RawCandidateActivityPagination;
  };
}

export type CallbackStatusCode = 'PENDING' | 'COMPLETED';

export interface GetCallbackRequestListParams {
  status_code?: CallbackStatusCode; // omitted = all statuses
  start_date?: string; // 'YYYY-MM-DD' — callbacks on that day
  page?: number;
  page_size?: number;
}

export interface CallbackRequestItem {
  candidateActivityId: number;
  candidateId: number;
  fullName: string;
  email: string | null;
  phone: string | null;
  currentJobTitle: string | null;
  currentCompany: string | null;
  jdId: number | null;
  jdName: string | null;
  activityId: number;
  activityName: string;
  subActivityId: number;
  subActivityCode: string | null;
  subActivityName: string;
  notes: string | null;
  callbackDate: string | null;
  isOverdue: boolean;
  statusId: number;
  statusCode: string;
  statusName: string;
  isHighlighted: boolean;
  createdBy: number;
  createdDate: string;
}

export interface GetCallbackRequestListResult {
  callbacks: CallbackRequestItem[];
  pagination: CandidateActivityPagination;
}

export interface MarkCandidateActivityCompletedRequest {
  candidate_activity_id: number;
}

export interface MarkCandidateActivityCompletedResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    candidate_activity_id: number;
  };
}
