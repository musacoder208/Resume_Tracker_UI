import type { JSX } from 'react';
import { SkeletonBlock } from '../SkeletonBlock';

interface CandidateCardSkeletonProps {
  layout?: 'card' | 'row';
}

export function CandidateCardSkeleton({ layout = 'card' }: CandidateCardSkeletonProps): JSX.Element {
  if (layout === 'row') {
    return (
      <div className="flex items-start gap-4 py-4">
        <SkeletonBlock className="h-10 w-10 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <SkeletonBlock className="h-3.5 w-40" />
          <SkeletonBlock className="h-3 w-72" />
          <div className="flex gap-1.5">
            <SkeletonBlock className="h-5 w-16 rounded-full" />
            <SkeletonBlock className="h-5 w-20 rounded-full" />
            <SkeletonBlock className="h-5 w-14 rounded-full" />
            <SkeletonBlock className="h-5 w-16 rounded-full" />
          </div>
        </div>
        <SkeletonBlock className="h-7 w-20 shrink-0 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <SkeletonBlock className="h-10 w-10 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-1.5">
          <SkeletonBlock className="h-3.5 w-36" />
          <SkeletonBlock className="h-3 w-28" />
          <SkeletonBlock className="h-3 w-24" />
        </div>
      </div>
      <div className="flex gap-3">
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="h-3 w-16" />
      </div>
      <SkeletonBlock className="h-px w-full" />
      <div className="flex gap-1.5">
        <SkeletonBlock className="h-5 w-16 rounded-full" />
        <SkeletonBlock className="h-5 w-20 rounded-full" />
        <SkeletonBlock className="h-5 w-14 rounded-full" />
      </div>
      <div className="flex justify-end border-t border-border-muted pt-3">
        <SkeletonBlock className="h-7 w-24 rounded-lg" />
      </div>
    </div>
  );
}
