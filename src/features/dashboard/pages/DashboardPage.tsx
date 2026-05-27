import type { JSX } from 'react';
import { useT } from '@/i18n/useT';

export function DashboardPage(): JSX.Element {
  const { t } = useT('common');

  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-sm text-text-muted">{t('nav.tabs.dashboard')}</p>
    </div>
  );
}
