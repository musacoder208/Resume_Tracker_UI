import { baseApi } from '@/services/baseApi';
import type { DashboardSummary } from '../types/dashboard.types';
import { mapDashboardSummaryResponse } from './dashboard.mappers';

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<DashboardSummary, void>({
      query: () => ({
        url: 'dashboard/summary',
        method: 'GET',
      }),
      transformResponse: mapDashboardSummaryResponse,
    }),
  }),
});

export const { useGetDashboardSummaryQuery } = dashboardApi;
