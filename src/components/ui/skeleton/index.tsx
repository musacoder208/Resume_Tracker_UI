import type { JSX } from 'react';
import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps): JSX.Element {
  return (
    <div
      className={clsx('animate-pulse rounded-md bg-skeleton-bg', className)}
      aria-hidden="true"
    />
  );
}
