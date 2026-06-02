import { baseApi } from '@/services/baseApi';
import type { StartProfileData, AnswerData, EditQuestionData, UpdateAnswerData } from '../types/companyProfile.types';
import {
  mapStartProfileResponse,
  mapAnswerResponse,
  mapEditQuestionResponse,
  mapUpdateAnswerResponse,
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
  }),
});

export const {
  useStartProfileMutation,
  useSubmitAnswerMutation,
  useEditQuestionMutation,
  useUpdateAnswerMutation,
} = companyProfileApi;
