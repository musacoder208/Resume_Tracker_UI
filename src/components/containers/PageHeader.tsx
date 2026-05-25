import type { JSX } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps): JSX.Element {
  return (
    <div className="border-b border-border pb-5">
      <div className="-mt-4 -ms-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
        <div className="mt-4 ms-4">
          <h1 className="text-base font-semibold text-text">{title}</h1>

          {description != null && <p className="mt-1 text-sm text-text-muted">{description}</p>}
        </div>

        {action != null && <div className="mt-4 ms-4 shrink-0">{action}</div>}
      </div>
    </div>
  );
}
