import type { JSX } from "react";

interface PageContainerProps {
  children: React.ReactNode;
  padded?: boolean; // for full-width pages like dashboards
}

export function PageContainer({
  children,
  padded = true,
}: PageContainerProps): JSX.Element {
  return (
    <div
      className={[
        'bg-background text-text',
        padded ? 'px-4 pt-2 pb-6 sm:px-6 lg:px-8' : 'pb-6',
      ].join(' ')}
    >
      {children}
    </div>
  );
}
