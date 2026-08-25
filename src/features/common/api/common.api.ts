import { baseApi } from '@/services/baseApi';

export type ModuleCode = 'JD_MODULE' | 'CAND_MGT';

interface ModuleIdResponse {
  code: string;
  message: string;
  data: { module_id: number };
}

export const commonApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getModuleId: builder.query<number, ModuleCode>({
      query: (module_code) => ({
        url: 'common/module-id',
        method: 'GET',
        params: { module_code },
      }),
      transformResponse: (raw: ModuleIdResponse) => raw.data.module_id,
    }),
  }),
});

export const { useGetModuleIdQuery } = commonApi;
