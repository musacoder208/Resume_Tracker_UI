import type { JSX } from 'react';
import { SkeletonBlock } from '../SkeletonBlock';

export function JdStatCardSkeleton(): JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-border bg-surface p-4">
          <SkeletonBlock className="h-8 w-14 mb-2" />
          <SkeletonBlock className="h-3 w-28" />
        </div>
      ))}
    </div>
  );
}
