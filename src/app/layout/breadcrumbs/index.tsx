import type { JSX } from 'react';
import { useLocation } from 'react-router-dom';
import { useT } from '@/i18n/useT';

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function Breadcrumbs(): JSX.Element {
  const { t } = useT('common');
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  return (
    <nav className="flex items-center gap-1 py-2" aria-label="Breadcrumb">
      <span className="text-xs font-light text-text-muted">{t('nav.home')}</span>

      {segments.map((seg, idx) => {
        const isLast = idx === segments.length - 1;
        return (
          <span key={idx} className="flex items-center gap-1">
            <span className="text-xs font-light text-text-disabled">/</span>
            <span
              className={
                isLast
                  ? 'text-xs font-semibold tracking-wide text-text'
                  : 'text-xs font-light text-text-muted'
              }
            >
              {capitalize(seg)}
            </span>
          </span>
        );
      })}
    </nav>
  );
}
