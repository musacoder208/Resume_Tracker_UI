import { baseApi } from '@/services/baseApi';
import type {
  Activity,
  SubActivity,
  Alert,
  SaveCandidateActivityRequest,
  SaveCandidateActivityResponse,
  SaveCandidateActivityWithFollowUpRequest,
  SaveCandidateActivityWithFollowUpResponse,
  SaveCandidateActivityHighlightRequest,
  SaveCandidateActivityHighlightResponse,
  GetCandidateActivityResult,
  GetCandidateActivityParams,
  GetCallbackRequestListResult,
  GetCallbackRequestListParams,
  MarkCandidateActivityCompletedRequest,
  MarkCandidateActivityCompletedResponse,
  PendingFollowUp,
} from '../types/candidateActivity.types';
import {
  mapPendingFollowUpResponse,
  mapActivityListResponse,
  mapSubActivityListResponse,
  mapAlertListResponse,
  mapCandidateActivityListResponse,
  mapCallbackRequestListResponse,
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

    // New save: activity row and/or follow-up row in one call. Refreshes the
    // history and My Action (both provide 'CandidateActivity').
    saveCandidateActivityWithFollowUp: builder.mutation<
      SaveCandidateActivityWithFollowUpResponse,
      SaveCandidateActivityWithFollowUpRequest
    >({
      query: (body) => ({
        url: 'candidate/saveCandidateActivityWithFollowUp',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['CandidateActivity'],
    }),

    // Checked right before a follow-up save (always fresh) to decide between
    // insert / update / asking the user. A query, so no success toast.
    getPendingFollowUp: builder.query<PendingFollowUp | null, number>({
      query: (candidateId) => ({
        url: 'candidate/getPendingFollowUp',
        params: { candidate_id: candidateId },
      }),
      transformResponse: mapPendingFollowUpResponse,
      keepUnusedDataFor: 0,
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

    // Callback Request activities created by the logged-in user — the backend
    // resolves the user and org from the token. Filtered + paginated server-side.
    getCallbackRequestList: builder.query<
      GetCallbackRequestListResult,
      GetCallbackRequestListParams
    >({
      query: (params) => ({
        url: 'candidate/getCallbackRequestList',
        params,
      }),
      transformResponse: mapCallbackRequestListResponse,
      providesTags: ['CandidateActivity'],
    }),

    markCandidateActivityCompleted: builder.mutation<
      MarkCandidateActivityCompletedResponse,
      MarkCandidateActivityCompletedRequest
    >({
      query: (body) => ({
        url: 'candidate/markCandidateActivityCompleted',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['CandidateActivity'],
    }),
  }),
});

export const {
  useGetActivityListQuery,
  useGetSubActivityListQuery,
  useGetAlertListQuery,
  useSaveCandidateActivityMutation,
  useSaveCandidateActivityWithFollowUpMutation,
  useLazyGetPendingFollowUpQuery,
  useGetCandidateActivityQuery,
  useSaveCandidateActivityHighlightMutation,
  useGetCallbackRequestListQuery,
  useMarkCandidateActivityCompletedMutation,
} = candidateActivityApi;
