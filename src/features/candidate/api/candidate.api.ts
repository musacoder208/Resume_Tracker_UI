import { baseApi } from '@/services/baseApi';
import type {
  UploadResumesRequest,
  UploadResumesResult,
  SaveCandidatesRequest,
  SaveCandidatesResponse,
  UpdateCandidateScoreRequest,
  UpdateCandidateScoreResponse,
  CandidateListParams,
  CandidateListResult,
  CandidateDetail,
} from '../types/candidate.types';
import {
  mapUploadResumesResponse,
  mapCandidateListResponse,
  mapCandidateDetailResponse,
} from './candidate.mappers';

export const candidateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadResumes: builder.mutation<UploadResumesResult, UploadResumesRequest>({
      query: ({ positionTitle, files }) => {
        const formData = new FormData();
        formData.append('position_title', positionTitle);
        files.forEach((file) => {
          formData.append('files', file);
        });
        return {
          url: 'candidate/uploadResumes',
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: mapUploadResumesResponse,
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
    }),

    getCandidateList: builder.query<CandidateListResult, CandidateListParams>({
      query: (params) => ({
        url: 'candidate/getCandidateList',
        params,
      }),
      transformResponse: mapCandidateListResponse,
    }),

    getCandidateDetails: builder.query<CandidateDetail, number>({
      query: (candidateId) => ({
        url: `candidate/getCandidateDetails/${candidateId}`,
      }),
      transformResponse: mapCandidateDetailResponse,
    }),
  }),
});

export const {
  useUploadResumesMutation,
  useSaveCandidatesMutation,
  useUpdateCandidateScoreMutation,
  useGetCandidateListQuery,
  useGetCandidateDetailsQuery,
} = candidateApi;
