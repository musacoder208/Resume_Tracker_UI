import type { JSX } from 'react';
import clsx from 'clsx';

interface SkeletonBlockProps {
  className?: string;
}

export function SkeletonBlock({ className }: SkeletonBlockProps): JSX.Element {
  return <div className={clsx('animate-pulse rounded bg-surface-muted', className)} />;
}
