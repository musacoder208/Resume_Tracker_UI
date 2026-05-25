import type { JSX, ReactNode } from 'react';

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function FormSection({
  title,
  description,
  children,
}: Props): JSX.Element {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-text">{title}</h3>
        {Boolean(description) && (
          <p className="text-sm text-text-muted">{description}</p>
        )}
      </div>

      <div>{children}</div>
    </section>
  );
}
