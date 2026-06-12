import type { JSX } from 'react';
import { SkeletonBlock } from '../SkeletonBlock';

const COL_WIDTHS = ['w-4', 'w-32', 'w-20', 'w-16', 'w-16', 'w-6', 'w-20', 'w-24'];

export function JdTableSkeleton(): JSX.Element {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-muted">
              {COL_WIDTHS.map((w, i) => (
                <th key={i} className="px-4 py-3">
                  <SkeletonBlock className={`h-3 ${w}`} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4].map((row) => (
              <tr key={row} className="border-b border-border last:border-0">
                {COL_WIDTHS.map((w, i) => (
                  <td key={i} className="px-4 py-4">
                    {i === 3 ? (
                      <SkeletonBlock className="h-5 w-16 rounded-full" />
                    ) : (
                      <SkeletonBlock className={`h-3 ${w}`} />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
