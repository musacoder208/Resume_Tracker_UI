import { baseApi } from '@/services/baseApi';
import type {
  AiUsageFilterParams,
  AiUsageJdDetailParams,
  AiUsageJdCandidatesParams,
  AiUsageJdsData,
  AiUsageTreeRow,
  AiUsageCandidatesData,
  AiUsageJdOption,
  AiUsageExportFile,
} from '../types/reports.types';
import {
  mapAiUsageExportResponse,
  mapAiUsageJdOptionsResponse,
  mapAiUsageJdsResponse,
  mapAiUsageJdProcessesResponse,
  mapAiUsageJdCandidatesResponse,
} from './reports.mappers';

const filterParams = (params: AiUsageFilterParams): Record<string, string> => ({
  ...(params.from_date != null && { from_date: params.from_date }),
  ...(params.to_date != null && { to_date: params.to_date }),
  ...(params.jd_ids != null && params.jd_ids.length > 0 && { jd_ids: params.jd_ids.join(',') }),
});

const detailParams = (params: AiUsageJdDetailParams): Record<string, string | number | boolean> => ({
  ...(params.from_date != null && { from_date: params.from_date }),
  ...(params.to_date != null && { to_date: params.to_date }),
  ...(params.jd_id != null && { jd_id: params.jd_id }),
  ...(params.unassigned === true && { unassigned: true }),
});

export const aiUsageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // JD Name filter options — every JD with AI usage, any status
    getAiUsageJdOptions: builder.query<AiUsageJdOption[], void>({
      query: () => ({
        url: 'reports/ai-usage/jd-dropdown',
        method: 'GET',
      }),
      transformResponse: mapAiUsageJdOptionsResponse,
    }),

    // JD grid + stat cards
    getAiUsageJds: builder.query<AiUsageJdsData, AiUsageFilterParams>({
      query: (params) => ({
        url: 'reports/ai-usage/jds',
        method: 'GET',
        params: filterParams(params),
      }),
      transformResponse: mapAiUsageJdsResponse,
    }),

    // JD processes grid: main process (module) → sub-process (feature)
    getAiUsageJdProcesses: builder.query<AiUsageTreeRow[], AiUsageJdDetailParams>({
      query: (params) => ({
        url: 'reports/ai-usage/jd-processes',
        method: 'GET',
        params: detailParams(params),
      }),
      transformResponse: mapAiUsageJdProcessesResponse,
    }),

    // Candidates grid: candidate → main process → sub-process
    getAiUsageJdCandidates: builder.query<AiUsageCandidatesData, AiUsageJdCandidatesParams>({
      query: (params) => ({
        url: 'reports/ai-usage/jd-candidates',
        method: 'GET',
        params: {
          ...detailParams(params),
          ...(params.page != null && { page: params.page }),
          ...(params.page_size != null && { page_size: params.page_size }),
        },
      }),
      transformResponse: mapAiUsageJdCandidatesResponse,
    }),

    // Excel export — same filters as the JD grid. Mutation (not cached) so each
    // click downloads a fresh file; the blob is turned into an object URL.
    exportAiUsage: builder.mutation<AiUsageExportFile, AiUsageFilterParams>({
      query: (params) => ({
        url: 'reports/ai-usage/export',
        method: 'GET',
        params: filterParams(params),
        responseHandler: mapAiUsageExportResponse,
      }),
    }),
  }),
});

export const {
  useGetAiUsageJdOptionsQuery,
  useLazyGetAiUsageJdsQuery,
  useGetAiUsageJdProcessesQuery,
  useGetAiUsageJdCandidatesQuery,
  useExportAiUsageMutation,
} = aiUsageApi;
