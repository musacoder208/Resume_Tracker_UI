import { baseApi } from '@/services/baseApi';
import type {
  LookupOption,
  RawLookupResponse,
  Interviewer,
  RawInterviewersResponse,
  CandidateRequisition,
  RawCandidateRequisitionResponse,
  InterviewQuestion,
  RawQuestionsResponse,
  GetQuestionsParams,
  CandidateInterviewSnapshot,
  RawSnapshotResponse,
  SaveContactStatusRequest,
  SaveRoundRequest,
} from '../types/interviewProcess.types';
import {
  mapLookupResponse,
  mapInterviewersResponse,
  mapCandidateRequisitionResponse,
  mapQuestionsResponse,
  mapSnapshotResponse,
} from './interviewProcess.mappers';

export const interviewProcessApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRounds: builder.query<LookupOption[], void>({
      query: () => ({ url: 'interview-process/rounds' }),
      transformResponse: (raw: RawLookupResponse) => mapLookupResponse(raw),
    }),

    getInterviewers: builder.query<Interviewer[], void>({
      query: () => ({ url: 'interview-process/interviewers' }),
      transformResponse: (raw: RawInterviewersResponse) => mapInterviewersResponse(raw),
    }),

    getInterviewModes: builder.query<LookupOption[], void>({
      query: () => ({ url: 'interview-process/interview-modes' }),
      transformResponse: (raw: RawLookupResponse) => mapLookupResponse(raw),
    }),

    getContactStatuses: builder.query<LookupOption[], void>({
      query: () => ({ url: 'interview-process/contact-statuses' }),
      transformResponse: (raw: RawLookupResponse) => mapLookupResponse(raw),
    }),

    getRoundActions: builder.query<LookupOption[], void>({
      query: () => ({ url: 'interview-process/round-actions' }),
      transformResponse: (raw: RawLookupResponse) => mapLookupResponse(raw),
    }),

    getQuestions: builder.query<InterviewQuestion[], GetQuestionsParams>({
      query: ({ jdId, seniorityId, roundId, actionId }) => ({
        url: 'interview-process/questions',
        params: { jdId, seniorityId, roundId, actionId },
      }),
      transformResponse: (raw: RawQuestionsResponse) => mapQuestionsResponse(raw),
    }),

    getCandidateRequisition: builder.query<CandidateRequisition, number>({
      query: (candidateId) => ({ url: `interview-process/candidates/${candidateId}/requisition` }),
      transformResponse: (raw: RawCandidateRequisitionResponse) => mapCandidateRequisitionResponse(raw),
    }),

    getCandidateHistory: builder.query<CandidateInterviewSnapshot, number>({
      query: (candidateId) => ({ url: `interview-process/candidates/${candidateId}/history` }),
      transformResponse: (raw: RawSnapshotResponse) => mapSnapshotResponse(raw),
    }),

    saveContactStatus: builder.mutation<CandidateInterviewSnapshot, SaveContactStatusRequest>({
      query: ({ candidateId, ...body }) => ({
        url: `interview-process/candidates/${candidateId}/contact-status`,
        method: 'POST',
        body,
      }),
      transformResponse: (raw: RawSnapshotResponse) => mapSnapshotResponse(raw),
      async onQueryStarted({ candidateId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(interviewProcessApi.util.updateQueryData('getCandidateHistory', candidateId, () => data));
        } catch {
          // errors handled by apiToastMiddleware
        }
      },
    }),

    saveRound: builder.mutation<CandidateInterviewSnapshot, SaveRoundRequest>({
      query: ({ candidateId, ...body }) => ({
        url: `interview-process/candidates/${candidateId}/rounds`,
        method: 'POST',
        body,
      }),
      transformResponse: (raw: RawSnapshotResponse) => mapSnapshotResponse(raw),
      async onQueryStarted({ candidateId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(interviewProcessApi.util.updateQueryData('getCandidateHistory', candidateId, () => data));
        } catch {
          // errors handled by apiToastMiddleware
        }
      },
    }),
  }),
});

export const {
  useGetRoundsQuery,
  useGetInterviewersQuery,
  useGetInterviewModesQuery,
  useGetContactStatusesQuery,
  useGetRoundActionsQuery,
  useLazyGetQuestionsQuery,
  useGetCandidateRequisitionQuery,
  useGetCandidateHistoryQuery,
  useSaveContactStatusMutation,
  useSaveRoundMutation,
} = interviewProcessApi;
