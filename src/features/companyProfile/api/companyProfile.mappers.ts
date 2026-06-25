import type { ApiResponse } from '@/types/apiResponse';
import type {
  StartProfileData,
  AnswerData,
  RawStartData,
  RawAnswerData,
  EditQuestionData,
  UpdateAnswerData,
  RawEditQuestionData,
  RawUpdateAnswerData,
  RawProfileDetailsData,
  ProfileDetailsData,
} from '../types/companyProfile.types';

export const mapStartProfileResponse = (raw: ApiResponse<RawStartData>): StartProfileData => ({
  session_id: raw.data.session_id,
  next_question: raw.data.next_question,
  theory: raw.data.theory,
  total_questions_count: raw.data.total_questions_count ?? 0,
  interactions: raw.data.data_blob?.interactions ?? [],
  resolved_conflict_ids: raw.data.data_blob?.conflict_context?.resolved_conflict_ids ?? [],
});

// data_blob is absent when next_question is null (profile completed)
export const mapAnswerResponse = (raw: ApiResponse<RawAnswerData>): AnswerData => ({
  next_question: raw.data.next_question,
  theory: raw.data.theory ?? undefined,
  interactions: raw.data.data_blob?.interactions ?? [],
  resolved_conflict_ids: raw.data.data_blob?.conflict_context?.resolved_conflict_ids ?? [],
  message: raw.message,
});

export const mapEditQuestionResponse = (
  raw: ApiResponse<RawEditQuestionData>
): EditQuestionData => ({
  step: raw.data.step,
  question: raw.data.next_question,
});

// data is null when profile has not been created yet
export const mapProfileDetailsResponse = (
  raw: ApiResponse<RawProfileDetailsData | null>
): ProfileDetailsData => ({
  theory: raw.data?.theory ?? null,
});

export const mapUpdateAnswerResponse = (
  raw: ApiResponse<RawUpdateAnswerData>
): UpdateAnswerData => ({
  step: raw.data.step,
  question: raw.data.next_question,
  completed: raw.data.completed,
  cancelled: raw.data.cancelled,
  message: raw.message,
});
