//wrap the whole app

import type { JSX } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '../routes/router';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { I18nextProvider } from 'react-i18next';
import { i18n } from '@/i18n';
import { ToastProvider } from '@/components/ui/toast/ToastProvider';
import { ConfirmProvider } from '@/components/ui/confirm/ConfirmProvider';

export function AppProviders(): JSX.Element {
  return (
    <I18nextProvider i18n={i18n}>
      <Provider store={store}>
        <ToastProvider>
          <ConfirmProvider>
            <RouterProvider router={router} />
          </ConfirmProvider>
        </ToastProvider>
      </Provider>
    </I18nextProvider>
  );
}
