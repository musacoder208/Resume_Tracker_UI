import { baseApi } from '@/services/baseApi';
import type {
  StartJdData,
  AnswerJdData,
  MasterData,
  SubmitJdAnswerBody,
  JdListData,
  GetAllJDsParams,
  JdDetails,
  StartJdBody,
  EditJdQaBody,
  EditJdQaData,
  UpdateJdAnswerData,
  UpdateTheoryBody,
  UpdateTheoryData,
  GenerateWeightageBody,
  GenerateWeightageData,
  UpdateWeightageBody,
  UpdateWeightageData,
  JdDropdownItem,
} from '../types/jd.types';
import {
  mapStartJdResponse,
  mapAnswerJdResponse,
  mapMasterDataResponse,
  mapGetAllJDsResponse,
  mapGetJdDetailsResponse,
  mapEditJdQaResponse,
  mapUpdateJdAnswerResponse,
  mapUpdateTheoryResponse,
  mapGenerateWeightageResponse,
  mapUpdateWeightageResponse,
  mapJdDropdownResponse,
} from './jd.mappers';

export const jdApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMasterData: builder.query<MasterData, void>({
      query: () => ({
        url: 'common/master-data',
        method: 'GET',
      }),
      transformResponse: mapMasterDataResponse,
    }),

    // body is optional — void for fresh start, StartJdBody for continuation with dataBlob
    startJd: builder.mutation<StartJdData, StartJdBody | void>({
      query: (body) => ({
        url: 'jd/start_jd',
        method: 'POST',
        ...(body != null ? { body } : {}),
      }),
      transformResponse: mapStartJdResponse,
    }),

    submitJdAnswer: builder.mutation<AnswerJdData, SubmitJdAnswerBody>({
      query: (body) => ({
        url: 'jd/questions_answer',
        method: 'POST',
        body,
      }),
      transformResponse: mapAnswerJdResponse,
    }),

    getAllJDs: builder.query<JdListData, GetAllJDsParams>({
      query: (params) => ({
        url: 'jd/getAllJDs',
        method: 'GET',
        params: {
          ...(params.job_title_id != null && { job_title_id: params.job_title_id }),
          ...(params.seniority_id != null && { seniority_id: params.seniority_id }),
          ...(params.status_id != null && { status_id: params.status_id }),
          ...(params.page != null && { page: params.page }),
          ...(params.page_size != null && { page_size: params.page_size }),
          ...(params.sort_by != null && { sort_by: params.sort_by }),
          ...(params.sort_order != null && { sort_order: params.sort_order }),
        },
      }),
      transformResponse: mapGetAllJDsResponse,
    }),

    getJdDetailsById: builder.query<JdDetails, number>({
      query: (jdId) => ({
        url: `jd/getJdDetailsById/${jdId}`,
        method: 'GET',
      }),
      transformResponse: mapGetJdDetailsResponse,
    }),

    editJdQa: builder.mutation<EditJdQaData, EditJdQaBody>({
      query: (body) => ({
        url: 'jd/edit_qa',
        method: 'POST',
        body,
      }),
      transformResponse: mapEditJdQaResponse,
    }),

    updateJdAnswer: builder.mutation<UpdateJdAnswerData, { answer: string }>({
      query: (body) => ({
        url: 'jd/update_qa',
        method: 'POST',
        body,
      }),
      transformResponse: mapUpdateJdAnswerResponse,
    }),

    updateTheory: builder.mutation<UpdateTheoryData, UpdateTheoryBody>({
      query: (body) => ({
        url: 'jd/update_theory',
        method: 'POST',
        body,
      }),
      transformResponse: mapUpdateTheoryResponse,
    }),

    generateWeightage: builder.mutation<GenerateWeightageData, GenerateWeightageBody>({
      query: (body) => ({
        url: 'jd/generateWeightage',
        method: 'POST',
        body,
      }),
      transformResponse: mapGenerateWeightageResponse,
    }),

    updateWeightage: builder.mutation<UpdateWeightageData, UpdateWeightageBody>({
      query: (body) => ({
        url: 'jd/updateWeightage',
        method: 'PUT',
        body,
      }),
      transformResponse: mapUpdateWeightageResponse,
      extraOptions: { skipRetry: true, timeout: 60000 },
    }),

    getJDDropdown: builder.query<JdDropdownItem[], void>({
      query: () => ({
        url: 'jd/getJDDropdown',
        method: 'GET',
      }),
      transformResponse: mapJdDropdownResponse,
    }),
  }),
});

export const {
  useGetMasterDataQuery,
  useStartJdMutation,
  useSubmitJdAnswerMutation,
  useGetAllJDsQuery,
  useLazyGetAllJDsQuery,
  useGetJdDetailsByIdQuery,
  useEditJdQaMutation,
  useUpdateJdAnswerMutation,
  useUpdateTheoryMutation,
  useGenerateWeightageMutation,
  useUpdateWeightageMutation,
  useGetJDDropdownQuery,
} = jdApi;
