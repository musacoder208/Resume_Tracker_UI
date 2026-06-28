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

// Shared refresh promise — ensures only one token refresh runs at a time.
// All concurrent 401s wait for this single promise instead of each firing
// their own refresh, which would exhaust the single-use refresh token.
let pendingRefresh: Promise<{ data: unknown } | { error: unknown }> | null = null;

// @ts-expect-error -- FetchBaseQueryError is structurally compatible with ApiError
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, ApiError, BaseQueryExtraOptions> = async (
  args,
  api,
  extraOptions
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  // fetchBaseQuery wraps 401 in PARSING_ERROR when the body is empty/non-JSON.
  // Check both the primary status and originalStatus to catch both shapes.
  const errStatus = result.error?.status;
  const origStatus = (result.error as { originalStatus?: number } | undefined)?.originalStatus;
  const is401 = errStatus === 401 || origStatus === 401;

  if (is401) {
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

    // If no refresh is in flight, start one. Otherwise reuse the existing promise.
    if (pendingRefresh == null) {
      pendingRefresh = (async () => {
        try {
          return await rawBaseQuery({ url: 'auth/session', method: 'GET' }, api, extraOptions);
        } finally {
          pendingRefresh = null;
        }
      })();
    }

    const refreshResult = await pendingRefresh;

    // Treat the refresh as failed only if it explicitly returned a 401.
    // A 204/empty-body 200 arrives as PARSING_ERROR with originalStatus 2xx —
    // the cookie was still set, so we must retry rather than log out.
    const refreshErr = (refreshResult as { error?: { status?: unknown; originalStatus?: number } }).error;
    const refreshFailed =
      refreshErr !== undefined &&
      (refreshErr.status === 401 || refreshErr.originalStatus === 401);

    if (!refreshFailed) {
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
