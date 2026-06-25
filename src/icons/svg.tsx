/**
 * Centralized custom SVG barrel.
 * For SVG icons/assets that are NOT available in @heroicons/react.
 * Heroicons go in src/icons/index.ts — this file is for custom-drawn SVGs only.
 *
 * Usage:
 *   import { DashboardIcon } from '@/icons/svg';
 */

import type { JSX } from 'react';

export function DashboardIcon({ className }: { className?: string }): JSX.Element | null {
  return (
    <svg className={className} viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="8.5" y="1" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1" y="8.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/** Sort indicator — dual triangle (up/down) used in DataGrid headers */
export function SortIcon({ className }: { className?: string }): JSX.Element | null {
  return (
    <svg className={className} viewBox="0 0 12 14" width="12" height="12" fill="currentColor">
      <path className="grid-sort-up" d="M6 1L2 6h8L6 1z" />
      <path className="grid-sort-down" d="M6 13L2 8h8l-4 5z" />
    </svg>
  );
}

/** Funnel/filter icon used in DataGrid column filter */
export function FunnelIcon({ className }: { className?: string }): JSX.Element | null {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" width="14" height="14">
      <path d="M1 2.5h12M3 7h8M5.5 11.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Small X icon for clearing filter inputs */
export function FilterClearIcon({ className }: { className?: string }): JSX.Element | null {
  return (
    <svg className={className} viewBox="0 0 10 10" fill="none" width="10" height="10">
      <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Small checkmark for dropdown selected state */
export function FilterCheckIcon({ className }: { className?: string }): JSX.Element | null {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" width="12" height="12">
      <path d="M1.5 6L4.5 9L10.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Export icon — Excel (green spreadsheet with X) */
export function ExcelExportIcon({ className }: { className?: string }): JSX.Element | null {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" width="16" height="16">
      <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 5l6 6M11 5l-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** Export icon — PDF (red document with lines) */
export function PdfExportIcon({ className }: { className?: string }): JSX.Element | null {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" width="16" height="16">
      <path d="M4 1.5h6l3.5 3.5V14a.5.5 0 01-.5.5H4a.5.5 0 01-.5-.5V2a.5.5 0 01.5-.5z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M10 1.5V5h3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M6 8.5h4M6 10.5h3M6 12.5h2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

/** Waving hand — used with .animate-wave class for looping wave animation */
export function WavingHandIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10.05 4.575a1.575 1.575 0 1 0-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 0 1 3.15 0v1.5m-3.15 0 .075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 0 1 3.15 0V15M6.9 7.575a1.575 1.575 0 1 0-3.15 0v8.175a6.75 6.75 0 0 0 13.5 0v-5.25a1.575 1.575 0 0 0-3.15 0v.75" />
    </svg>
  );
}
