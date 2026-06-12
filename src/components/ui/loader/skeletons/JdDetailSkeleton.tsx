import type { JSX } from 'react';
import { SkeletonBlock } from '../SkeletonBlock';

export function JdDetailSkeleton(): JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SkeletonBlock className="h-5 w-44" />
        <div className="flex gap-2">
          <SkeletonBlock className="h-8 w-20 rounded-lg" />
          <SkeletonBlock className="h-8 w-24 rounded-lg" />
        </div>
      </div>

      {/* Main card + sidebar */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Main card */}
        <div className="flex-1 rounded-xl border border-border bg-surface p-6">
          <SkeletonBlock className="h-4 w-40 mb-6" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <SkeletonBlock className="h-3 w-20" />
                <SkeletonBlock className="h-4 w-28" />
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="mt-5">
            <SkeletonBlock className="h-3 w-24 mb-2" />
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2].map((i) => (
                <SkeletonBlock key={i} className="h-6 w-20 rounded-full" />
              ))}
            </div>
          </div>

          <div className="mt-5">
            <SkeletonBlock className="h-3 w-28 mb-2" />
            <div className="flex flex-wrap gap-2">
              {[0, 1].map((i) => (
                <SkeletonBlock key={i} className="h-6 w-16 rounded-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex w-full flex-col gap-4 lg:w-72">
          <div className="rounded-xl border border-border bg-surface p-4">
            <SkeletonBlock className="h-4 w-28" />
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <SkeletonBlock className="h-4 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}
