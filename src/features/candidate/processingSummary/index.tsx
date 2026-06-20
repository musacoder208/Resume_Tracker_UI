import type { ComponentType, SVGProps, JSX } from 'react';
import { useT } from '@/i18n/useT';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  DocumentDuplicateIcon,
  ExclamationCircleIcon,
} from '@/icons';
import type { ProcessingSummary } from '../types/candidate.types';

interface ProcessingSummaryPanelProps {
  summary: ProcessingSummary;
}

interface SummaryItem {
  labelKey: string;
  value: number;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  iconClass: string;
  bgClass: string;
  valueClass: string;
}

export function ProcessingSummaryPanel({ summary }: ProcessingSummaryPanelProps): JSX.Element {
  const { t } = useT('candidate');

  const items: SummaryItem[] = [
    {
      labelKey: 'summary.total',
      value: summary.total,
      icon: DocumentTextIcon,
      iconClass: 'text-primary',
      bgClass: 'bg-primary-subtle',
      valueClass: 'text-primary',
    },
    {
      labelKey: 'summary.success',
      value: summary.success,
      icon: CheckCircleIcon,
      iconClass: 'text-success',
      bgClass: 'bg-success-subtle',
      valueClass: 'text-success',
    },
    {
      labelKey: 'summary.duplicate',
      value: summary.duplicate,
      icon: DocumentDuplicateIcon,
      iconClass: 'text-warning',
      bgClass: 'bg-warning-subtle',
      valueClass: 'text-warning',
    },
    {
      labelKey: 'summary.incomplete',
      value: summary.incomplete,
      icon: ExclamationCircleIcon,
      iconClass: 'text-error',
      bgClass: 'bg-error-subtle',
      valueClass: 'text-error',
    },
  ];

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-xs font-semibold text-text">{t('summary.sectionTitle')}</p>
      <div className="grid grid-cols-2 gap-2">
        {items.map(({ labelKey, value, icon: Icon, iconClass, bgClass, valueClass }) => (
          <div
            key={labelKey}
            className="flex items-center gap-2.5 rounded-lg border border-border bg-background p-3"
          >
            <div className={`shrink-0 rounded-lg p-2 ${bgClass}`}>
              <Icon className={`h-4 w-4 ${iconClass}`} />
            </div>
            <div className="min-w-0">
              <p className={`text-base font-bold leading-none ${valueClass}`}>{value}</p>
              <p className="mt-0.5 text-xs text-text-muted">{t(labelKey)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
