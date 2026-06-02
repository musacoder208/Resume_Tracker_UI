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
} from '../types/companyProfile.types';

export const mapStartProfileResponse = (raw: ApiResponse<RawStartData>): StartProfileData => ({
  session_id: raw.data.session_id,
  next_question: raw.data.next_question,
  theory: raw.data.theory,
  interactions: raw.data.data_blob.interactions,
  resolved_conflict_ids: raw.data.data_blob.conflict_context.resolved_conflict_ids,
});

export const mapAnswerResponse = (raw: ApiResponse<RawAnswerData>): AnswerData => ({
  next_question: raw.data.next_question,
  theory: raw.data.theory ?? undefined,
  interactions: raw.data.data_blob.interactions,
  resolved_conflict_ids: raw.data.data_blob.conflict_context.resolved_conflict_ids,
});

export const mapEditQuestionResponse = (
  raw: ApiResponse<RawEditQuestionData>
): EditQuestionData => ({
  step: raw.data.step,
  question: raw.data.next_question,
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
