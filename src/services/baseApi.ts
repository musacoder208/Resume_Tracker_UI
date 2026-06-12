import { env } from '@/config/env';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/query/react';
import { clearAuthContext } from '@/features/auth/redux/auth.slice';
import { clearActiveSession } from '@/utils/authSession';
import type { ApiError, ApiErrorKind, ApiErrorMeta } from '@/types/apiError';

export type BaseQueryExtraOptions = {
  skipRetry?: boolean;
  skipReauth?: boolean;
  timeout?: number;
};

const MAX_RETRIES = 3;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.API_BASE_URL,
  credentials: 'include',
});

// @ts-expect-error -- FetchBaseQueryError is structurally compatible with ApiError
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, ApiError, BaseQueryExtraOptions> = async (
  args,
  api,
  extraOptions
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const skip = extraOptions?.skipReauth;

    if (skip) {
      clearActiveSession();
      const isAuthenticated = (api.getState() as { auth: { isAuthenticated: boolean } }).auth.isAuthenticated;
      if (isAuthenticated) {
        api.dispatch(clearAuthContext());
      }
      return {
        error: {
          status: 401,
          data: { messageCode: 'SESSION_EXPIRED', message: 'Session expired' },
          meta: { kind: 'auth' as ApiErrorKind, messageCode: 'SESSION_EXPIRED', handled: true },
        },
      };
    }

    const refreshResult = await rawBaseQuery(
      {
        url: `${env.AUTH_SERVICE_BASE_URL}/auth/refresh`,
        method: 'POST',
      },
      api,
      extraOptions
    );

    if (refreshResult.data != null) {
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(clearAuthContext());

      return {
        error: {
          status: 401,
          data: { messageCode: 'SESSION_EXPIRED', message: 'Session expired' },
          meta: { kind: 'auth', messageCode: 'SESSION_EXPIRED', handled: true },
        },
      };
    }
  }

  return result;
};

const baseQueryWithErrorHandling: BaseQueryFn<string | FetchArgs, unknown, ApiError, BaseQueryExtraOptions> = async (
  args,
  api,
  extraOptions
) => {
  const timeoutMs = extraOptions?.timeout;
  let resolvedArgs: string | FetchArgs = args;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  if (timeoutMs != null) {
    const controller = new AbortController();
    timeoutId = setTimeout(() => { controller.abort(); }, timeoutMs);
    resolvedArgs = typeof args === 'string'
      ? { url: args, signal: controller.signal }
      : { ...(args as FetchArgs), signal: controller.signal };
  }

  let result: Awaited<ReturnType<typeof baseQueryWithReauth>>;
  try {
    result = await baseQueryWithReauth(resolvedArgs, api, extraOptions);
  } finally {
    if (timeoutId != null) clearTimeout(timeoutId);
  }

  if (result.error) {
    const err = result.error;
    const status = err.status;
    const messageCode = (err.data as ApiErrorMeta | undefined)?.messageCode;

    let kind: ApiErrorKind = 'unknown';

    if (status === 'FETCH_ERROR') kind = 'network';
    else if (typeof status === 'number' && status === 401) kind = 'auth';
    else if (typeof status === 'number' && status >= 500) kind = 'server';
    else if (typeof status === 'number' && status >= 400) kind = 'validation';

    return {
      error: {
        ...err,
        meta: {
          ...(err.meta ?? {}),
          kind,
          messageCode,
          handled: true,
        },
      },
    };
  }

  return result;
};

const baseQueryWithRetry: BaseQueryFn<string | FetchArgs, unknown, ApiError, BaseQueryExtraOptions> = async (
  args,
  api,
  extraOptions
) => {
  const skipRetry = extraOptions?.skipRetry === true;

  if (skipRetry) {
    return baseQueryWithErrorHandling(args, api, extraOptions);
  }

  let attempt = 0;
  let result;

  while (attempt <= MAX_RETRIES) {
    result = await baseQueryWithErrorHandling(args, api, extraOptions);

    if (!result?.error) {
      return result;
    }

    const status = result.error.status;
    const shouldRetry = status === 'FETCH_ERROR' || (typeof status === 'number' && status >= 500);

    if (!shouldRetry) {
      return result;
    }

    attempt++;
    if (attempt > MAX_RETRIES) break;

    await new Promise((r) => setTimeout(r, attempt * 1000));
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  return result!;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithRetry,
  tagTypes: [],
  endpoints: () => ({}),
});
