import { baseApi } from '@/services/baseApi';
import type { StartProfileData, AnswerData, EditQuestionData, UpdateAnswerData, ProfileDetailsData } from '../types/companyProfile.types';
import {
  mapStartProfileResponse,
  mapAnswerResponse,
  mapEditQuestionResponse,
  mapUpdateAnswerResponse,
  mapProfileDetailsResponse,
} from './companyProfile.mappers';

export const companyProfileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    startProfile: builder.mutation<StartProfileData, void>({
      query: () => ({
        url: 'companyProfile/start',
        method: 'POST',
      }),
      transformResponse: mapStartProfileResponse,
    }),

    submitAnswer: builder.mutation<AnswerData, { answer: string }>({
      query: (body) => ({
        url: 'companyProfile/answer',
        method: 'POST',
        body,
      }),
      transformResponse: mapAnswerResponse,
    }),

    editQuestion: builder.mutation<EditQuestionData, { field_key: string; answer: string }>({
      query: (body) => ({
        url: 'companyProfile/edit_question',
        method: 'POST',
        body,
      }),
      transformResponse: mapEditQuestionResponse,
    }),

    updateAnswer: builder.mutation<UpdateAnswerData, { answer: string }>({
      query: (body) => ({
        url: 'companyProfile/update_answer',
        method: 'POST',
        body,
      }),
      transformResponse: mapUpdateAnswerResponse,
    }),

    getProfileDetails: builder.query<ProfileDetailsData, void>({
      query: () => ({
        url: 'companyProfile/details',
        method: 'GET',
      }),
      transformResponse: mapProfileDetailsResponse,
    }),
  }),
});

export const {
  useStartProfileMutation,
  useSubmitAnswerMutation,
  useEditQuestionMutation,
  useUpdateAnswerMutation,
  useGetProfileDetailsQuery,
} = companyProfileApi;
