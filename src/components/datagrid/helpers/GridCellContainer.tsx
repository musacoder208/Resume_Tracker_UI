import clsx from 'clsx';
import type { JSX, ReactNode } from 'react';
import type { GridAlign } from '../types/grid.types';

interface GridCellContainerProps {
  align?: GridAlign;
  children: ReactNode;
  className?: string;
}

export const GridCellContainer = ({
  align = 'left',
  children,
  className,
}: GridCellContainerProps): JSX.Element => {
  return (
    <div
      className={clsx(
        'flex items-center h-full',
        align === 'right' && 'justify-end text-end',
        align === 'center' && 'justify-center text-center',
        align === 'left' && 'justify-start text-start',
        className
      )}
    >
      {children}
    </div>
  );
};
