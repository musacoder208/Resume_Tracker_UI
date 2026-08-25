import type { JSX } from 'react';
import { SkeletonBlock } from '../SkeletonBlock';

export function CandidateListCardSkeleton(): JSX.Element {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <SkeletonBlock className="h-11 w-11 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <SkeletonBlock className="h-4 w-36" />
            <SkeletonBlock className="h-3 w-52" />
          </div>
        </div>
        <SkeletonBlock className="h-14 w-14 shrink-0 rounded-full" />
      </div>

      {/* Info row */}
      <div className="mt-3 flex gap-4">
        <SkeletonBlock className="h-3 w-28" />
        <SkeletonBlock className="h-3 w-16" />
        <SkeletonBlock className="h-3 w-20" />
      </div>

      {/* Skills row */}
      <div className="mt-3 flex gap-2">
        <SkeletonBlock className="h-5 w-16 rounded-md" />
        <SkeletonBlock className="h-5 w-20 rounded-md" />
        <SkeletonBlock className="h-5 w-14 rounded-md" />
        <SkeletonBlock className="h-5 w-24 rounded-md" />
      </div>

      {/* Contact row */}
      <div className="mt-3 flex gap-5 border-t border-border-muted pt-3">
        <SkeletonBlock className="h-3 w-36" />
        <SkeletonBlock className="h-3 w-28" />
      </div>
    </div>
  );
}
