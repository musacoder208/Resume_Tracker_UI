import { baseApi } from '@/services/baseApi';
import type {
  Activity,
  SubActivity,
  Alert,
  SaveCandidateActivityRequest,
  SaveCandidateActivityResponse,
  SaveCandidateActivityHighlightRequest,
  SaveCandidateActivityHighlightResponse,
  GetCandidateActivityResult,
  GetCandidateActivityParams,
} from '../types/candidateActivity.types';
import {
  mapActivityListResponse,
  mapSubActivityListResponse,
  mapAlertListResponse,
  mapCandidateActivityListResponse,
} from './candidateActivity.mappers';

export const candidateActivityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActivityList: builder.query<Activity[], void>({
      query: () => ({
        url: 'candidate/getActivityList',
      }),
      transformResponse: mapActivityListResponse,
    }),

    getSubActivityList: builder.query<SubActivity[], number>({
      query: (activityId) => ({
        url: 'candidate/getSubActivityList',
        params: { activity_id: activityId },
      }),
      transformResponse: mapSubActivityListResponse,
    }),

    getAlertList: builder.query<Alert[], void>({
      query: () => ({
        url: 'candidate/getAlertList',
      }),
      transformResponse: mapAlertListResponse,
    }),

    saveCandidateActivity: builder.mutation<SaveCandidateActivityResponse, SaveCandidateActivityRequest>({
      query: (body) => ({
        url: 'candidate/saveCandidateActivity',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['CandidateActivity'],
    }),

    getCandidateActivity: builder.query<GetCandidateActivityResult, GetCandidateActivityParams>({
      query: (params) => ({
        url: 'candidate/getCandidateActivity',
        params,
      }),
      transformResponse: mapCandidateActivityListResponse,
      providesTags: ['CandidateActivity'],
    }),

    // Not tagged with 'CandidateActivity' on purpose — the caller patches the
    // cached list directly from this mutation's response instead of refetching.
    saveCandidateActivityHighlight: builder.mutation<
      SaveCandidateActivityHighlightResponse,
      SaveCandidateActivityHighlightRequest
    >({
      query: (body) => ({
        url: 'candidate/saveCandidateActivityHighlight',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetActivityListQuery,
  useGetSubActivityListQuery,
  useGetAlertListQuery,
  useSaveCandidateActivityMutation,
  useGetCandidateActivityQuery,
  useSaveCandidateActivityHighlightMutation,
} = candidateActivityApi;
