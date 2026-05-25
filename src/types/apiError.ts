import type { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

export type ApiErrorKind = 'auth' | 'validation' | 'server' | 'network' | 'unknown';

type ApiErrorData = {
  code?: string;
  messageCode?: string;
  message?: string;
  data?: unknown;
};

export interface ApiErrorMeta {
  kind: ApiErrorKind;
  messageCode?: string;
  handled?: boolean;
}

export type ApiError = FetchBaseQueryError & {
  data?: ApiErrorData;
  meta?: ApiErrorMeta;
};
