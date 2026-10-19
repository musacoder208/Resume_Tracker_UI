import type { ApiResponse } from '@/types/apiResponse';
import type {
  RawAiUsageTotals,
  RawAiUsageJdsData,
  RawAiUsageProcess,
  RawAiUsageCandidatesData,
  AiUsageTotals,
  AiUsageJdsData,
  AiUsageTreeRow,
  AiUsageCandidatesData,
  RawAiUsageJdOption,
  AiUsageJdOption,
  AiUsageExportFile,
} from '../types/reports.types';

const DEFAULT_EXPORT_FILE_NAME = 'Report.xlsx';

/** Reads the file name from `Content-Disposition: attachment; filename="..."` */
const fileNameFromDisposition = (header: string | null): string => {
  const match = header != null ? /filename="?([^";]+)"?/i.exec(header) : null;
  return match?.[1] ?? DEFAULT_EXPORT_FILE_NAME;
};

/**
 * RTK Query responseHandler for the Excel export: on success returns an object
 * URL for the file; on error returns the JSON body so the normal error flow
 * (toast middleware) still works.
 */
export const mapAiUsageExportResponse = async (response: Response): Promise<unknown> => {
  if (!response.ok) return response.json() as Promise<unknown>;
  const blob = await response.blob();
  const file: AiUsageExportFile = {
    url: URL.createObjectURL(blob),
    fileName: fileNameFromDisposition(response.headers.get('Content-Disposition')),
  };
  return file;
};

export const mapAiUsageJdOptionsResponse = (raw: ApiResponse<RawAiUsageJdOption[]>): AiUsageJdOption[] =>
  (raw.data ?? []).map((item) => ({ jdId: item.jd_id, label: item.label }));

// Postgres numeric columns can arrive as strings — normalise every number.
const toNumber = (value: number | string | null | undefined): number => {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
};

const mapTotals = (raw: RawAiUsageTotals): AiUsageTotals => ({
  calls: toNumber(raw.calls),
  failedCalls: toNumber(raw.failed_calls),
  inputTokens: toNumber(raw.input_tokens),
  outputTokens: toNumber(raw.output_tokens),
  totalTokens: toNumber(raw.total_tokens),
  totalCost: toNumber(raw.total_cost),
});

/** module → feature rows. `parentId` keeps row ids unique inside a candidate. */
const mapProcessTree = (processes: RawAiUsageProcess[], parentId = ''): AiUsageTreeRow[] =>
  processes.map((p) => {
    const moduleId = `${parentId}m:${p.module}`;
    return {
      id: moduleId,
      kind: 'module',
      label: p.module,
      ...mapTotals(p),
      children: (p.features ?? []).map((f) => ({
        id: `${moduleId}/f:${f.feature}`,
        kind: 'feature' as const,
        label: f.feature,
        ...mapTotals(f),
      })),
    };
  });

export const mapAiUsageJdsResponse = (raw: ApiResponse<RawAiUsageJdsData>): AiUsageJdsData => {
  const s = raw.data.summary;
  return {
    summary: {
      ...mapTotals(s),
      totalJds: toNumber(s.total_jds),
      totalCandidates: toNumber(s.total_candidates),
    },
    list: (raw.data.list ?? []).map((r) => ({
      ...mapTotals(r),
      jdId: r.jd_id,
      jdName: r.jd_name,
      createdDate: r.created_date,
      candidateCount: toNumber(r.candidate_count),
    })),
  };
};

export const mapAiUsageJdProcessesResponse = (
  raw: ApiResponse<RawAiUsageProcess[]>
): AiUsageTreeRow[] => mapProcessTree(raw.data ?? []);

export const mapAiUsageJdCandidatesResponse = (
  raw: ApiResponse<RawAiUsageCandidatesData>
): AiUsageCandidatesData => ({
  totalCount: toNumber(raw.data.total_count),
  summary: raw.data.summary != null ? mapTotals(raw.data.summary) : null,
  list: (raw.data.list ?? []).map((c) => {
    const candidateId = `c:${c.candidate_id}`;
    return {
      id: candidateId,
      kind: 'candidate',
      label: c.full_name ?? '',
      candidateId: c.candidate_id,
      uploadedDate: c.uploaded_date,
      isDeleted: c.is_deleted,
      ...mapTotals(c),
      children: mapProcessTree(c.processes ?? [], `${candidateId}/`),
    };
  }),
});
