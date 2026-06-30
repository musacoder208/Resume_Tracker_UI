import type { ApiResponse } from '@/types/apiResponse';
import type {
  StartJdData,
  AnswerJdData,
  MasterData,
  RawStartJdData,
  RawAnswerJdData,
  RawMasterData,
  JdListData,
  JdDetails,
  EditJdQaData,
  RawEditJdQaData,
  UpdateJdAnswerData,
  RawUpdateJdAnswerData,
  UpdateTheoryData,
  RawUpdateTheoryData,
  GenerateWeightageData,
  UpdateWeightageData,
  RawJdDropdownItem,
  JdDropdownItem,
} from '../types/jd.types';

export const mapStartJdResponse = (raw: ApiResponse<RawStartJdData>): StartJdData => ({
  session_id: raw.data.session_id,
  jdId: raw.data.jd_id,
  next_question: raw.data.next_question,
  interactions: raw.data.data_blob.interactions,
  resolved_conflict_ids: raw.data.data_blob.conflict_context.resolved_conflict_ids ?? [],
  field_values: raw.data.data_blob.field_values,
  field_progress: raw.data.data_blob.field_progress,
  totalQuestionsCount: raw.data.total_questions_count,
});

// data_blob is absent when next_question is null (JD completed)
export const mapAnswerJdResponse = (raw: ApiResponse<RawAnswerJdData>): AnswerJdData => ({
  jdId: raw.data.jd_id,
  message: raw.message,
  next_question: raw.data.next_question,
  theory: raw.data.theory ?? undefined,
  interactions: raw.data.data_blob?.interactions ?? [],
  resolved_conflict_ids: raw.data.data_blob?.conflict_context?.resolved_conflict_ids ?? [],
  field_values: raw.data.data_blob?.field_values,
  field_progress: raw.data.data_blob?.field_progress,
});

export const mapMasterDataResponse = (raw: ApiResponse<RawMasterData>): MasterData => ({
  jobTitles: raw.data.jobTitles,
  seniorities: raw.data.seniorities,
  feedbackStatuses: raw.data.feedbackStatuses ?? [],
  statuses: raw.data.statuses ?? {},
});

type RawJdCounts = Record<string, number | undefined>;

export const mapGetAllJDsResponse = (
  raw: ApiResponse<{ counts: RawJdCounts; list: JdListData['list'] }>
): JdListData => {
  const c = raw.data.counts;
  return {
    counts: {
      totalJds: c.totalJds ?? 0,
      addedThisWeek: c.addedThisWeek ?? 0,
      remoteRoles: c.remoteRoles ?? 0,
      hybridRoles: c.hybridRoles ?? 0,
      draftCount: c.draftCount ?? 0,
      inProgressCount: c.inprogressCount ?? 0,
      completedCount: c.completedCount ?? 0,
      totalCount: c.total_count ?? 0,
      totalPages: c.total_pages ?? 0,
    },
    list: raw.data.list,
  };
};

export const mapGetJdDetailsResponse = (raw: ApiResponse<JdDetails>): JdDetails => ({
  jdId: raw.data.jdId,
  jobTitleId: raw.data.jobTitleId,
  seniorityId: raw.data.seniorityId,
  jobTitle: raw.data.jobTitle,
  sessionId: raw.data.sessionId,
  statusName: raw.data.statusName,
  statusCode: raw.data.statusCode,
  theory: raw.data.theory,
  dataBlob: raw.data.dataBlob,
  isWeightage: raw.data.isWeightage ?? false,
  weightageJson: raw.data.weightageJson ?? null,
  orgDnaSnapshot: raw.data.dataBlob?.org_dna_snapshot ?? {},
  totalQuestionsCount: raw.data.total_questions_count ?? raw.data.totalQuestionsCount,
});

export const mapEditJdQaResponse = (raw: ApiResponse<RawEditJdQaData>): EditJdQaData => ({
  step: raw.data.step,
  question: raw.data.next_question,
});

export const mapUpdateJdAnswerResponse = (
  raw: ApiResponse<RawUpdateJdAnswerData>
): UpdateJdAnswerData => ({
  step: raw.data.step,
  question: raw.data.next_question,
  completed: raw.data.completed,
  cancelled: raw.data.cancelled,
  message: raw.message,
});

export const mapUpdateTheoryResponse = (
  raw: ApiResponse<RawUpdateTheoryData>
): UpdateTheoryData => ({
  success: raw.success,
  message: raw.message,
  rendered_text: raw.data.rendered_text,
  response: raw.data.response,
  updated_field_values: raw.data.updated_field_values,
  modified_fields: raw.data.modified_fields,
});

export const mapGenerateWeightageResponse = (raw: ApiResponse<unknown>): GenerateWeightageData => ({
  message: raw.message,
});

interface RawUpdateWeightageData {
  weights_updated: boolean;
  response: string;
}

export const mapUpdateWeightageResponse = (raw: ApiResponse<RawUpdateWeightageData>): UpdateWeightageData => ({
  success: raw.success,
  message: raw.message,
  weightsUpdated: raw.data?.weights_updated ?? false,
  responseText: raw.data?.response ?? '',
});

export const mapJdDropdownResponse = (raw: ApiResponse<RawJdDropdownItem[]>): JdDropdownItem[] =>
  (raw.data ?? []).map((item) => ({ jdId: item.jd_id, label: item.label }));
