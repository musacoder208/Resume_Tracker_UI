import type { JSX } from 'react';
import { SkeletonBlock } from '../SkeletonBlock';

export function CandidateDetailSkeleton(): JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-7 w-32 rounded-md" />
          <div className="hidden flex-col gap-1 sm:flex">
            <SkeletonBlock className="h-4 w-40" />
            <SkeletonBlock className="h-3 w-28" />
          </div>
        </div>
        <SkeletonBlock className="h-7 w-36 rounded-md" />
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        {/* Left sidebar */}
        <div className="flex w-full flex-col gap-4 lg:w-72 lg:shrink-0">
          {/* Profile card */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex flex-col items-center gap-3">
              <SkeletonBlock className="h-16 w-16 rounded-full" />
              <div className="flex w-full flex-col items-center gap-1.5">
                <SkeletonBlock className="h-4 w-36" />
                <SkeletonBlock className="h-3 w-28" />
                <SkeletonBlock className="h-3 w-24" />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2.5 border-t border-border-muted pt-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <SkeletonBlock className="h-4 w-4 rounded" />
                  <SkeletonBlock className="h-3 w-32" />
                </div>
              ))}
            </div>
          </div>

          {/* AI match card */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center gap-2 mb-4">
              <SkeletonBlock className="h-4 w-4 rounded" />
              <SkeletonBlock className="h-3 w-24" />
            </div>
            <div className="flex flex-col items-center gap-3">
              <SkeletonBlock className="h-20 w-20 rounded-full" />
              <SkeletonBlock className="h-6 w-28 rounded-full" />
              <div className="grid w-full grid-cols-2 gap-2">
                <SkeletonBlock className="h-14 rounded-lg" />
                <SkeletonBlock className="h-14 rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Right content */}
        <div className="min-w-0 flex-1">
          {/* Tab bar */}
          <div className="mb-4 flex gap-1 rounded-xl border border-border bg-surface p-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-7 w-16 rounded-lg" />
            ))}
          </div>

          {/* Tab content */}
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-border bg-surface p-5">
              <SkeletonBlock className="mb-4 h-3 w-32" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <SkeletonBlock className="h-3 w-20" />
                    <SkeletonBlock className="h-3 w-36" />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-surface p-5">
              <SkeletonBlock className="mb-4 h-3 w-40" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <SkeletonBlock className="h-3 w-20" />
                    <SkeletonBlock className="h-3 w-28" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
