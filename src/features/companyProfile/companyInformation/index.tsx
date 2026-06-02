import type { JSX } from 'react';
import { useT } from '@/i18n/useT';
import { BuildingOffice2Icon } from '@/icons';

export function CompanyInformation(): JSX.Element {
  const { t } = useT('companyProfile');

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="flex items-center gap-2">
        <BuildingOffice2Icon className="h-5 w-5 text-primary" />
        <h2 className="text-sm font-semibold text-text">{t('sections.companyInformation')}</h2>
      </div>
    </div>
  );
}
