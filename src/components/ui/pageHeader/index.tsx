import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from '@/icons';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backLabel?: string;
  backTo?: string;
  showBack?: boolean;
}

export function PageHeader({
  title,
  subtitle,
  backLabel = 'Back to Dashboard',
  backTo = '/',
  showBack = false,
}: PageHeaderProps): JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between border-t border-border-muted pt-2.5">
      <div>
        <h1 className="text-base font-semibold leading-relaxed text-primary-hover">{title}</h1>
        {subtitle && <p className="text-xs font-light text-text">{subtitle}</p>}
      </div>

      {showBack && (
        <button
          type="button"
          onClick={() => void navigate(backTo)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
        >
          <ChevronLeftIcon className="h-[17px] w-[17px]" aria-hidden="true" />
          {backLabel}
        </button>
      )}
    </div>
  );
}
