import { baseApi } from '@/services/baseApi';
import type { LoginPageSettings } from '../types/loginSettings.types';
import { mapLoginPageSettingsResponse } from './loginSettings.mappers';

export const loginSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLoginPageSettings: builder.query<LoginPageSettings, void>({
      query: () => 'login-page-settings',
      transformResponse: mapLoginPageSettingsResponse,
    }),
  }),
});

export const { useGetLoginPageSettingsQuery } = loginSettingsApi;
