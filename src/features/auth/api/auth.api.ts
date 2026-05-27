import { baseApi } from '@/services/baseApi';
import type { MappedAuthData } from './auth.mappers';
import { mapLoginResponse, mapAuthResponse } from './auth.mappers';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<MappedAuthData, { username: string; password: string }>({
      query: (body) => ({
        url: 'auth/login',
        method: 'POST',
        body,
      }),
      transformResponse: mapLoginResponse,
      extraOptions: { skipReauth: true, skipRetry: true },
    }),

    getSession: builder.query<MappedAuthData, void>({
      query: () => ({
        url: 'auth/session',
        method: 'GET',
      }),
      transformResponse: mapAuthResponse,
      extraOptions: { skipReauth: true },
    }),

    logout: builder.mutation<{ ok: boolean }, void>({
      query: () => ({
        url: 'auth/logout',
        method: 'POST',
      }),
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useGetSessionQuery } = authApi;
