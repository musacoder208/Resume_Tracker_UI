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
  candidate_activity_id?: number;
  candidate_id: number;
  activity_id: number;
  sub_activity_id?: number;
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
