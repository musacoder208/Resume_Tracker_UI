import type { JSX, ReactNode } from 'react';

type Props = {
  columns?: 1 | 2 | 3 | 4;
  children: ReactNode;
};

export function FormGrid({
  columns = 2,
  children,
}: Props): JSX.Element {
  const cols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-4',
  };

  return (
    <div className={`grid gap-4 ${cols[columns]}`}>
      {children}
    </div>
  );
}
