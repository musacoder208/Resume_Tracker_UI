import type { TFunction } from 'i18next';
import type { ExcelColumn } from '@/utils/exportToExcel';
import { formatDate } from '@/utils/formatters';
import type { AiUsageJdRow, AiUsageTotals, AiUsageTreeRow } from '../types/reports.types';
import { formatProcessLabel } from './usageGrid.utils';

// Excel number formats — same rounding as the grid (formatTokens / formatCost)
const COUNT_FORMAT = '#,##0';
const COST_FORMAT: Record<4 | 6, string> = { 4: '0.0000', 6: '0.000000' };

/**
 * One flat Excel row = one sub-process, in grid order. No total rows — the
 * candidate / main process are repeated as columns instead.
 */
export interface AiUsageExportRow extends AiUsageTotals {
  candidate: string;
  uploadedDate: string;
  mainProcess: string;
  subProcess: string;
  /** Same as the grid: sub-process rows 6 decimals, total-level rows 4 */
  costDecimals: 4 | 6;
}

type CandidateInfo = Pick<AiUsageExportRow, 'candidate' | 'uploadedDate'>;

const NO_CANDIDATE: CandidateInfo = { candidate: '', uploadedDate: '' };

function totalsOf(row: AiUsageTotals): AiUsageTotals {
  return {
    calls: row.calls,
    failedCalls: row.failedCalls,
    inputTokens: row.inputTokens,
    outputTokens: row.outputTokens,
    totalTokens: row.totalTokens,
    totalCost: row.totalCost,
  };
}

/** Calls / Failed / Input / Output / Total tokens / Cost — same on every export. */
function usageExcelColumns<TRow extends AiUsageTotals>(
  t: TFunction,
  costFormat: (row: TRow) => string
): ExcelColumn<TRow>[] {
  return [
    { header: t('table.calls'), value: (r) => r.calls, format: COUNT_FORMAT },
    { header: t('table.failed'), value: (r) => r.failedCalls, format: COUNT_FORMAT },
    { header: t('table.inputTokens'), value: (r) => r.inputTokens, format: COUNT_FORMAT },
    { header: t('table.outputTokens'), value: (r) => r.outputTokens, format: COUNT_FORMAT },
    { header: t('table.totalTokens'), value: (r) => r.totalTokens, format: COUNT_FORMAT },
    { header: t('table.cost'), value: (r) => r.totalCost, format: costFormat },
  ];
}

/** One row per sub-process; a main process without any becomes one row (no data lost). */
function flattenProcesses(
  t: TFunction,
  modules: readonly AiUsageTreeRow[],
  info: CandidateInfo
): AiUsageExportRow[] {
  return modules.flatMap((m): AiUsageExportRow[] => {
    const mainProcess = formatProcessLabel(t, m.label);
    const features = m.children ?? [];
    if (features.length === 0) {
      return [{ ...totalsOf(m), ...info, mainProcess, subProcess: '', costDecimals: 4 as const }];
    }
    return features.map((f) => ({
      ...totalsOf(f),
      ...info,
      mainProcess,
      subProcess: formatProcessLabel(t, f.label),
      costDecimals: 6 as const,
    }));
  });
}

export function flattenJdProcessRows(t: TFunction, rows: readonly AiUsageTreeRow[]): AiUsageExportRow[] {
  return flattenProcesses(t, rows, NO_CANDIDATE);
}

/** Candidate name + uploaded date on every sub-process row; a candidate without AI calls becomes one row. */
export function flattenCandidateRows(t: TFunction, rows: readonly AiUsageTreeRow[]): AiUsageExportRow[] {
  return rows.flatMap((c): AiUsageExportRow[] => {
    const name = c.label !== '' ? c.label : t('unknownCandidate', { id: c.candidateId });
    const info = {
      candidate: c.isDeleted === true ? `${name} (${t('deleted')})` : name,
      uploadedDate: formatDate(c.uploadedDate),
    };
    const modules = c.children ?? [];
    if (modules.length === 0) {
      return [{ ...totalsOf(c), ...info, mainProcess: '', subProcess: '', costDecimals: 4 as const }];
    }
    return flattenProcesses(t, modules, info);
  });
}

/** Excel columns for the JD processes / candidates exports — JD name repeated on every row. */
export function usageExportColumns(
  t: TFunction,
  jdName: string,
  withCandidate: boolean
): ExcelColumn<AiUsageExportRow>[] {
  return [
    { header: t('table.jdName'), value: () => jdName, width: 30 },
    ...(withCandidate
      ? [
          { header: t('table.candidate'), value: (r: AiUsageExportRow) => r.candidate, width: 28 },
          { header: t('table.uploadedDate'), value: (r: AiUsageExportRow) => r.uploadedDate, width: 18 },
        ]
      : []),
    { header: t('table.mainProcess'), value: (r) => r.mainProcess, width: 26 },
    { header: t('table.subProcess'), value: (r) => r.subProcess, width: 30 },
    ...usageExcelColumns<AiUsageExportRow>(t, (r) => COST_FORMAT[r.costDecimals]),
  ];
}

// ── JD grid export ────────────────────────────────────────────────────────────

/** One JD row as written to Excel. */
export interface AiUsageJdExportRow extends AiUsageTotals {
  srNo: number;
  jdName: string;
  createdDate: string;
  candidateCount: number;
}

/** JD rows in grid order. */
export function flattenJdRows(t: TFunction, rows: readonly AiUsageJdRow[]): AiUsageJdExportRow[] {
  return rows.map((r, i) => ({
    ...totalsOf(r),
    srNo: i + 1,
    jdName: r.jdName ?? t('unassigned'),
    createdDate: formatDate(r.createdDate),
    candidateCount: r.candidateCount,
  }));
}

export function jdExportColumns(t: TFunction): ExcelColumn<AiUsageJdExportRow>[] {
  return [
    { header: t('table.srNo'), value: (r) => r.srNo, width: 8 },
    { header: t('table.jdName'), value: (r) => r.jdName, width: 30 },
    { header: t('table.createdDate'), value: (r) => r.createdDate, width: 18 },
    { header: t('table.candidates'), value: (r) => r.candidateCount, format: COUNT_FORMAT },
    ...usageExcelColumns<AiUsageJdExportRow>(t, () => COST_FORMAT[4]),
  ];
}
