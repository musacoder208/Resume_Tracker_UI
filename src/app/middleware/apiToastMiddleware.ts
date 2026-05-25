import { type Middleware, isRejectedWithValue, isFulfilled } from '@reduxjs/toolkit';
import type { ApiError } from '@/types/apiError';
import { clearAuthContext } from '@/features/auth/redux/auth.slice';
import { i18n } from '@/i18n';
import { toastService } from '@/components/ui/toast/toastService';

interface ApiSuccessPayload {
  code?: string;
  success?: boolean;
}

const isMutationFulfilled = (action: { type: string }): boolean =>
  action.type.endsWith('/executeMutation/fulfilled');

export const apiToastMiddleware: Middleware = (store) => (next) => (action) => {
  // Handle SUCCESS (only for mutations, not queries)
  if (isFulfilled(action) && isMutationFulfilled(action as { type: string })) {
    const payload = action.payload as ApiSuccessPayload | undefined;
    const code = payload?.code;

    if (code) {
      const message = i18n.t(`common:serverCodes.${code}`, { defaultValue: code });
      toastService.success(message);
    }
  }

  // Handle ERRORS
  if (isRejectedWithValue(action)) {
    const error = action.payload as ApiError;

    const code: string | undefined = error.data?.code;
    const msgCode: string | undefined = error.data?.messageCode ?? error.meta?.messageCode;
    const errorCode: string | undefined = code ?? msgCode;
    const kind = error.meta?.kind;
    const message = error.data?.message;
    const endpointName = (action.meta as { arg?: { endpointName?: string } } | undefined)?.arg?.endpointName;
    const isLoginEndpoint = endpointName === 'login';

    if ((kind === 'auth' || errorCode === 'SESSION_EXPIRED') && !isLoginEndpoint) {
      store.dispatch(clearAuthContext());
      toastService.error(
        i18n.t('common:errors.sessionExpired'),
        i18n.t('common:errors.sessionExpiredDesc')
      );
      window.location.href = '/login?reason=session-expired';
      return next(action);
    }

    if (kind === 'network') {
      toastService.error(
        i18n.t('common:errors.networkError'),
        i18n.t('common:errors.networkErrorDesc')
      );
      return next(action);
    }

    if (kind === 'server') {
      toastService.error(
        i18n.t('common:errors.serverError'),
        i18n.t('common:errors.serverErrorDesc')
      );
      return next(action);
    }

    if (errorCode != null) {
      toastService.error(
        i18n.t('common:errors.generic'),
        i18n.t(`common:serverCodes.${errorCode}`, { defaultValue: message ?? errorCode })
      );
    } else if (message) {
      toastService.error(i18n.t('common:errors.generic'), message);
    } else {
      toastService.error(i18n.t('common:errors.generic'), i18n.t('common:errors.somethingWentWrong'));
    }
  }

  return next(action);
};
