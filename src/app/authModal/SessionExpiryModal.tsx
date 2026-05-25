//Modal UI shown by SessionExpiryWatcher. Gives user options: "Continue Session" or "Login Again".

import type { JSX } from 'react';
import { ExclamationTriangleIcon, ArrowRightOnRectangleIcon } from '@/icons';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n/useT';

type SessionExpiryModalProps = {
  remainingMs: number;
  onContinue: () => void;
  onLoginAgain: () => void;
};

export function SessionExpiryModal({
  remainingMs,
  onContinue,
  onLoginAgain,
}: SessionExpiryModalProps): JSX.Element {
  const { t } = useT('auth');
  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-surface shadow-xl">
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-border px-6 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning-subtle">
            <ExclamationTriangleIcon className="h-6 w-6 text-warning" />
          </div>

          <div>
            <h3 className="text-base font-semibold text-text">
              {t('sessionExpiry.title')}
            </h3>
            <p className="mt-1 text-sm text-text-muted">
              {t('sessionExpiry.subtitle')}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p className="text-sm text-text">
            {t('sessionExpiry.expiresIn')}
          </p>

          <div className="mt-2 text-2xl font-semibold text-error">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>

          <p className="mt-3 text-xs text-text-muted">
            {t('sessionExpiry.saveWork')}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <Button
            variant="outline"
            onClick={onLoginAgain}
            leadingIcon={<ArrowRightOnRectangleIcon className="h-4 w-4" />}
          >
            {t('sessionExpiry.loginAgain')}
          </Button>

          <Button variant="primary" onClick={onContinue}>
            {t('sessionExpiry.continueSession')}
          </Button>
        </div>
      </div>
    </div>
  );
}
