import { baseApi } from '@/services/baseApi';
import type {
  UploadResumesRequest,
  SaveCandidatesRequest,
  SaveCandidatesResponse,
  UpdateCandidateScoreRequest,
  UpdateCandidateScoreResponse,
  CandidateListParams,
  CandidateListResult,
  CandidateDetail,
  UploadStatusResult,
  SaveHRFeedbackRequest,
  HRAnswerQuestion,
  RawHRAnswersResponse,
  SaveHRAnswersRequest,
  UpdateCandidateInfoRequest,
} from '../types/candidate.types';
import {
  mapUploadStatusResponse,
  mapCandidateListResponse,
  mapCandidateDetailResponse,
  mapHRAnswersResponse,
} from './candidate.mappers';

export const candidateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadResumes: builder.mutation<{ success: boolean }, UploadResumesRequest>({
      query: ({ positionTitle, jdId, files }) => {
        const formData = new FormData();
        formData.append('position_title', positionTitle);
        formData.append('jd_id', String(jdId));
        files.forEach((file) => {
          formData.append('files', file);
        });
        return {
          url: 'candidate/uploadResumesStream',
          method: 'POST',
          body: formData,
          // uploadResumesStream returns SSE (text/event-stream), not JSON.
          // Drain the stream body and return a simple success flag so RTK
          // does not attempt JSON.parse on the event stream.
          responseHandler: async (response: Response) => {
            if (response.body != null) {
              const reader = response.body.getReader();
              try {
                while (!(await reader.read()).done) { /* drain */ }
              } finally {
                reader.releaseLock();
              }
            }
            return { success: response.ok };
          },
        };
      },
    }),

    saveCandidates: builder.mutation<SaveCandidatesResponse, SaveCandidatesRequest>({
      query: (body) => ({
        url: 'candidate/saveCandidates',
        method: 'POST',
        body,
      }),
    }),

    updateCandidateScore: builder.mutation<UpdateCandidateScoreResponse, UpdateCandidateScoreRequest>({
      query: (body) => ({
        url: 'candidate/updateCandidateScore',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['CandidateList'],
    }),

    getCandidateList: builder.query<CandidateListResult, CandidateListParams>({
      query: (params) => ({
        url: 'candidate/getCandidateList',
        params,
      }),
      transformResponse: mapCandidateListResponse,
      providesTags: ['CandidateList'],
    }),

    getCandidateDetails: builder.query<CandidateDetail, number>({
      query: (candidateId) => ({
        url: `candidate/getCandidateDetails/${candidateId}`,
      }),
      transformResponse: mapCandidateDetailResponse,
    }),

    getUploadStatus: builder.query<UploadStatusResult, number>({
      query: (jd_id) => ({
        url: 'candidate/getUploadStatus',
        params: { jd_id },
      }),
      transformResponse: mapUploadStatusResponse,
    }),

    saveHRFeedback: builder.mutation<{ success: boolean; message: string }, SaveHRFeedbackRequest>({
      query: (body) => ({
        url: 'candidate/saveHRFeedback',
        method: 'POST',
        body,
      }),
    }),

    getHRAnswers: builder.query<HRAnswerQuestion[], number>({
      query: (candidateId) => ({
        url: 'candidate/getHRAnswers',
        params: { candidate_id: candidateId },
      }),
      transformResponse: (raw: RawHRAnswersResponse) => mapHRAnswersResponse(raw),
    }),

    updateCandidateInfo: builder.mutation<{ success: boolean; code: string; message: string }, UpdateCandidateInfoRequest>({
      query: (body) => ({
        url: 'candidate/updateCandidateDetails',
        method: 'PUT',
        body,
      }),
    }),

    saveHRAnswers: builder.mutation<{ success: boolean }, SaveHRAnswersRequest>({
      query: (body) => ({
        url: 'candidate/saveHRAnswers',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useUploadResumesMutation,
  useSaveCandidatesMutation,
  useUpdateCandidateScoreMutation,
  useGetCandidateListQuery,
  useGetCandidateDetailsQuery,
  useLazyGetUploadStatusQuery,
  useSaveHRFeedbackMutation,
  useGetHRAnswersQuery,
  useSaveHRAnswersMutation,
  useUpdateCandidateInfoMutation,
} = candidateApi;
