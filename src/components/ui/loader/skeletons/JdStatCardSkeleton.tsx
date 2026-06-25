import type { JSX } from 'react';
import { SkeletonBlock } from '../SkeletonBlock';

function StatCardSkeleton(): JSX.Element {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
      <SkeletonBlock className="h-10 w-10 shrink-0 rounded-lg" />
      <div className="flex flex-col gap-1.5">
        <SkeletonBlock className="h-7 w-10" />
        <SkeletonBlock className="h-3 w-24" />
      </div>
    </div>
  );
}

export function JdStatCardSkeleton(): JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <StatCardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[0, 1, 2].map((i) => <StatCardSkeleton key={i} />)}
      </div>
    </div>
  );
}
