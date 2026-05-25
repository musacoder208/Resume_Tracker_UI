import { baseApi } from '@/services/baseApi';
import type { User } from '../types/auth.types';
import { mapAuthResponse } from './auth.mappers';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<{ user: User; sessionExpiresAt: string | null }, { email: string; password: string }>({
      query: (body) => ({
        url: 'auth/login',
        method: 'POST',
        body,
      }),
      transformResponse: mapAuthResponse,
      extraOptions: { skipReauth: true },
    }),

    getSession: builder.query<{ user: User; sessionExpiresAt: string | null }, void>({
      query: () => ({
        url: 'auth/me',
        method: 'GET',
      }),
      transformResponse: mapAuthResponse,
      extraOptions: { skipReauth: true },
    }),

    logout: builder.mutation<{ ok: boolean }, void>({
      query: () => ({
        url: 'auth/session',
        method: 'DELETE',
      }),
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useGetSessionQuery } = authApi;
