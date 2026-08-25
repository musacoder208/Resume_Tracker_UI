import type { JSX } from 'react';
import { SkeletonBlock } from '../SkeletonBlock';

function StatCardSkeleton(): JSX.Element {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
      <SkeletonBlock className="h-9 w-9 rounded-lg" />
      <div className="flex flex-col gap-1.5">
        <SkeletonBlock className="h-7 w-12" />
        <SkeletonBlock className="h-3 w-28" />
      </div>
    </div>
  );
}

function ActivityRowSkeleton(): JSX.Element {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <SkeletonBlock className="h-2 w-2 rounded-full" />
        <SkeletonBlock className="h-3 w-48" />
      </div>
      <SkeletonBlock className="h-3 w-10 shrink-0" />
    </div>
  );
}

export function DashboardSkeleton(): JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      {/* stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[0, 1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)}
      </div>

      {/* bottom row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* recent activity */}
        <div className="rounded-xl border border-border bg-surface p-5 lg:col-span-3">
          <SkeletonBlock className="mb-4 h-4 w-32" />
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => <ActivityRowSkeleton key={i} />)}
          </div>
        </div>

        {/* quick actions */}
        <div className="rounded-xl border border-border bg-surface p-5 lg:col-span-2">
          <SkeletonBlock className="mb-4 h-4 w-28" />
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-4">
                <SkeletonBlock className="h-10 w-10 rounded-lg" />
                <SkeletonBlock className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
