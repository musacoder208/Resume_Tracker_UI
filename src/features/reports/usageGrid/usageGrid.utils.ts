import type { TFunction } from 'i18next';
import type { AiUsageTotals } from '../types/reports.types';

// Words kept upper-case when a raw code is turned into a label
const ACRONYMS = new Set(['ai', 'jd', 'llm', 'hr', 'ocr', 'id']);

/** ai_evaluation → "AI Evaluation", classify_capability_group → "Classify Capability Group" */
export function toTitleCase(code: string): string {
  return code
    .split(/[_\-\s]+/)
    .filter((w) => w !== '')
    .map((w) => (ACRONYMS.has(w.toLowerCase()) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join(' ');
}

/**
 * Display name for a main process (module) or sub-process (feature).
 * Known codes come from reports.json → processLabels; unknown codes fall back to title case.
 */
export function formatProcessLabel(t: TFunction, code: string): string {
  return t(`processLabels.${code}`, { defaultValue: toTitleCase(code) });
}

export function formatTokens(value: number): string {
  return value.toLocaleString('en-US');
}

/** Totals use 4 decimals; single process rows use 6 (one call can cost ~$0.0003). */
export function formatCost(value: number, decimals: 4 | 6 = 4): string {
  return `$${value.toFixed(decimals)}`;
}

/** Local yyyy-mm-dd — avoids toISOString(), which shifts the day in IST. */
export function toDateParam(date: Date | undefined): string | undefined {
  if (date == null) return undefined;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function sumTotals(rows: readonly AiUsageTotals[]): { totalTokens: number; totalCost: number } {
  return rows.reduce(
    (acc, r) => ({ totalTokens: acc.totalTokens + r.totalTokens, totalCost: acc.totalCost + r.totalCost }),
    { totalTokens: 0, totalCost: 0 }
  );
}

// Tree indent per depth (class-based — no inline style)
const DEPTH_INDENT = ['ps-0', 'ps-5', 'ps-10', 'ps-15'] as const;

export function depthIndentClass(depth: number): string {
  return DEPTH_INDENT[Math.min(depth, DEPTH_INDENT.length - 1)];
}
