import type { Middleware } from '@reduxjs/toolkit';
import { isRejectedWithValue } from '@reduxjs/toolkit';
import { toastService } from '@/components/ui/toast/toastService';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { i18n } from '@/i18n';

function getErrorMessage(error: unknown): string {
  if (error == null) return 'Something went wrong';

  // RTK Query fetch error
  if (typeof error === 'object' && 'status' in error) {
    const fbqError = error as FetchBaseQueryError;

    if (typeof fbqError.data === 'object' && fbqError.data !== null) {
      if ('code' in fbqError.data) {
        const code = (fbqError.data as { code?: unknown }).code;
        if (typeof code === 'string') return code;
      }
    }

    return 'Something went wrong';
  }

  return 'Something went wrong';
}

export const rtkQueryToastMiddleware: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const kind = (action.payload as { meta?: { kind?: string } } | undefined)?.meta?.kind;
    if (kind !== 'auth') {
      const errorCode = getErrorMessage(action.payload);
      const message = i18n.t(errorCode, { defaultValue: errorCode });
      toastService.error('Error', message);
    }
  }

  return next(action);
};
