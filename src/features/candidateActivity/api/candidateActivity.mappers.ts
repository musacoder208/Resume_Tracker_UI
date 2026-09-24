import type {
  RawActivityListResponse,
  Activity,
  RawSubActivityListResponse,
  SubActivity,
  RawAlertListResponse,
  Alert,
  RawGetCandidateActivityResponse,
  GetCandidateActivityResult,
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
    createdBy: item.created_by,
    createdDate: item.created_date,
  })),
  pagination: {
    totalCount: raw.data.pagination?.total_count ?? 0,
    page: raw.data.pagination?.page ?? 1,
    pageSize: raw.data.pagination?.page_size ?? 0,
    totalPages: raw.data.pagination?.total_pages ?? 0,
  },
});
