import type {
  RawActivityListResponse,
  Activity,
  RawSubActivityListResponse,
  SubActivity,
  RawAlertListResponse,
  Alert,
  RawGetCandidateActivityResponse,
  GetCandidateActivityResult,
  RawGetCallbackRequestListResponse,
  GetCallbackRequestListResult,
} from '../types/candidateActivity.types';

export const mapActivityListResponse = (raw: RawActivityListResponse): Activity[] =>
  (raw.data ?? []).map((a) => ({
    activityId: a.activity_id,
    activityCode: a.activity_code,
    activityName: a.activity_name,
    activityType: a.activity_type,
  }));

export const mapSubActivityListResponse = (raw: RawSubActivityListResponse): SubActivity[] =>
  (raw.data ?? []).map((s) => ({
    subActivityId: s.sub_activity_id,
    activityId: s.activity_id,
    subActivityCode: s.sub_activity_code,
    subActivityName: s.sub_activity_name,
  }));

export const mapAlertListResponse = (raw: RawAlertListResponse): Alert[] =>
  (raw.data ?? []).map((a) => ({
    // pg returns bigint columns as strings; the save endpoint validates alert_id as a number.
    alertId: Number(a.alert_id),
    alertName: a.alert_name,
  }));

export const mapCandidateActivityListResponse = (
  raw: RawGetCandidateActivityResponse
): GetCandidateActivityResult => ({
  activities: (raw.data.activities ?? []).map((item) => ({
    candidateActivityId: item.candidate_activity_id,
    candidateId: item.candidate_id,
    activityId: item.activity_id,
    activityName: item.activity_name,
    subActivityId: item.sub_activity_id,
    subActivityName: item.sub_activity_name,
    activityType: item.activity_type,
    notes: item.notes,
    startDate: item.start_date,
    alertId: item.alert_id != null ? Number(item.alert_id) : null,
    alertName: item.alert_name ?? null,
    isHighlighted: item.is_highlighted ?? false,
    statusId: item.status_id != null ? Number(item.status_id) : null,
    statusCode: item.status_code ?? null,
    statusName: item.status_name ?? null,
    // pg bigint → string; compared against the logged-in user's id.
    createdBy: Number(item.created_by),
    createdDate: item.created_date,
  })),
  pagination: {
    totalCount: raw.data.pagination?.total_count ?? 0,
    page: raw.data.pagination?.page ?? 1,
    pageSize: raw.data.pagination?.page_size ?? 0,
    totalPages: raw.data.pagination?.total_pages ?? 0,
  },
});

// Order is kept as returned — the backend sorts pending first, then by callback_date.
// Ids go through Number() since pg returns bigint columns as strings, and they're
// sent back as numbers (mark completed / reschedule save).
export const mapCallbackRequestListResponse = (
  raw: RawGetCallbackRequestListResponse
): GetCallbackRequestListResult => {
  const callbacks = (raw.data?.callbacks ?? []).map((item) => ({
    candidateActivityId: Number(item.candidate_activity_id),
    candidateId: Number(item.candidate_id),
    fullName: item.full_name,
    email: item.email ?? null,
    phone: item.phone ?? null,
    currentJobTitle: item.current_job_title ?? null,
    currentCompany: item.current_company ?? null,
    jdId: item.jd_id != null ? Number(item.jd_id) : null,
    jdName: item.jd_name ?? null,
    activityId: Number(item.activity_id),
    activityName: item.activity_name,
    subActivityId: Number(item.sub_activity_id),
    subActivityName: item.sub_activity_name,
    notes: item.notes ?? null,
    callbackDate: item.callback_date ?? null,
    isOverdue: item.is_overdue ?? false,
    statusId: Number(item.status_id),
    statusCode: item.status_code,
    statusName: item.status_name,
    isHighlighted: item.is_highlighted ?? false,
    createdBy: Number(item.created_by),
    createdDate: item.created_date,
  }));
  const pagination = raw.data?.pagination;
  return {
    callbacks,
    pagination: {
      totalCount: Number(pagination?.total_count ?? callbacks.length),
      page: Number(pagination?.page ?? 1),
      pageSize: Number(pagination?.page_size ?? callbacks.length),
      totalPages: Number(pagination?.total_pages ?? 1),
    },
  };
};
