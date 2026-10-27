import { useCallback, useEffect, useMemo, useRef, useState, type JSX } from 'react';
import { PageContainer } from '@/components/containers/PageContainer';
import { StatCard } from '@/components/ui/statCard';
import { IconButton } from '@/components/ui/button';
import { JdStatCardSkeleton } from '@/components/ui/loader';
import { useT } from '@/i18n/useT';
import { DocumentTextIcon, UsersIcon, SparklesIcon, ChartBarIcon, XMarkIcon } from '@/icons';
import type { ApiError } from '@/types/apiError';
import { downloadFile } from '@/utils/downloadFile';
import {
  useExportAiUsageMutation,
  useGetAiUsageJdOptionsQuery,
  useLazyGetAiUsageJdsQuery,
} from '../api/reports.api';
import type {
  AiUsageFilterParams,
  AiUsageJdDetailParams,
  AiUsageJdOption,
  SelectedAiUsageJd,
} from '../types/reports.types';
import { formatCost, formatTokens, toDateParam } from '../usageGrid/usageGrid.utils';
import { AiUsageFilters } from '../aiUsageFilters';
import { JdUsageGrid } from '../jdUsageGrid';
import { JdProcessGrid } from '../jdProcessGrid';
import { CandidateUsageGrid } from '../candidateUsageGrid';

// Applied filters + opened JD are kept in sessionStorage (same as the candidate
// list page) so they survive navigating to another page and back. Cleared on logout.
const FILTERS_STORAGE_KEY = 'aiUsageReportFilters';
const DATE_PARAM_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

interface SavedReportFilters {
  fromDate?: string;
  toDate?: string;
  jdIds: number[];
  selectedJd: SelectedAiUsageJd | null;
}

function readSavedFilters(): SavedReportFilters {
  const empty: SavedReportFilters = { jdIds: [], selectedJd: null };
  try {
    const saved = sessionStorage.getItem(FILTERS_STORAGE_KEY);
    if (saved == null) return empty;
    const parsed = JSON.parse(saved) as Partial<SavedReportFilters>;
    const isDate = (v: unknown): v is string => typeof v === 'string' && DATE_PARAM_PATTERN.test(v);
    const jd = parsed.selectedJd;
    return {
      fromDate: isDate(parsed.fromDate) ? parsed.fromDate : undefined,
      toDate: isDate(parsed.toDate) ? parsed.toDate : undefined,
      jdIds: Array.isArray(parsed.jdIds)
        ? parsed.jdIds.filter((id): id is number => Number.isInteger(id) && id > 0)
        : [],
      selectedJd:
        jd != null && typeof jd.jdName === 'string' && (jd.jdId === null || Number.isInteger(jd.jdId))
          ? { jdId: jd.jdId, jdName: jd.jdName }
          : null,
    };
  } catch {
    // corrupt or blocked storage — start fresh
    return empty;
  }
}

function saveFilters(filters: SavedReportFilters): void {
  try {
    sessionStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
  } catch {
    // storage unavailable — filters just won't be remembered
  }
}

// "yyyy-mm-dd" → local Date (the inverse of toDateParam)
function fromDateParam(value: string | undefined): Date | undefined {
  if (value == null) return undefined;
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toFilterParams(saved: SavedReportFilters): AiUsageFilterParams {
  if (saved.fromDate == null && saved.toDate == null && saved.jdIds.length === 0) return {};
  return { from_date: saved.fromDate, to_date: saved.toDate, jd_ids: saved.jdIds };
}

export function AiUsageReportPage(): JSX.Element {
  const { t } = useT('reports');

  // Restored once on mount from the last applied filters of this session
  const [initial] = useState(readSavedFilters);

  // Filter inputs (applied only on Search)
  const [fromDate, setFromDate] = useState<Date | undefined>(() => fromDateParam(initial.fromDate));
  const [toDate, setToDate] = useState<Date | undefined>(() => fromDateParam(initial.toDate));
  // Ids only — the JD names come from the dropdown options, which may load later
  const [selectedJdIds, setSelectedJdIds] = useState<number[]>(initial.jdIds);
  const [applied, setApplied] = useState<AiUsageFilterParams>(() => toFilterParams(initial));

  // JD whose processes + candidates are shown below the JD grid
  const [selectedJd, setSelectedJd] = useState<SelectedAiUsageJd | null>(initial.selectedJd);

  // Bumped on each JD name click so the details section scrolls into view
  // (not on mount, when the JD is only restored from sessionStorage)
  const detailsRef = useRef<HTMLElement>(null);
  const [scrollRequest, setScrollRequest] = useState(0);

  const { data: jdOptions } = useGetAiUsageJdOptionsQuery();
  const selectedJds = useMemo<AiUsageJdOption[]>(
    () => (jdOptions ?? []).filter((o) => selectedJdIds.includes(o.jdId)),
    [jdOptions, selectedJdIds]
  );

  const [triggerGetJds, { data, isFetching, isError, error }] = useLazyGetAiUsageJdsQuery();
  const [exportAiUsage, { isLoading: isExporting }] = useExportAiUsageMutation();

  useEffect(() => {
    void triggerGetJds(applied);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Remember the applied filters (not unsaved inputs) and the opened JD
  useEffect(() => {
    saveFilters({
      fromDate: applied.from_date,
      toDate: applied.to_date,
      jdIds: applied.jd_ids ?? [],
      selectedJd,
    });
  }, [applied, selectedJd]);

  // Hide the detail section when the selected JD drops out of the filtered list
  const activeJd =
    selectedJd != null && (data == null || data.list.some((r) => r.jdId === selectedJd.jdId))
      ? selectedJd
      : null;

  function handleSearch(): void {
    const next: AiUsageFilterParams = {
      from_date: toDateParam(fromDate),
      to_date: toDateParam(toDate),
      jd_ids: selectedJdIds,
    };
    setApplied(next);
    void triggerGetJds(next);
  }

  function handleClear(): void {
    setFromDate(undefined);
    setToDate(undefined);
    setSelectedJdIds([]);
    setApplied({});
    void triggerGetJds({});
  }

  // Excel export of the applied filters (not the unsaved filter inputs)
  async function handleExport(): Promise<void> {
    try {
      const file = await exportAiUsage(applied).unwrap();
      downloadFile(file.url, file.fileName);
      setTimeout(() => { URL.revokeObjectURL(file.url); }, 1000);
    } catch {
      // errors are shown by apiToastMiddleware
    }
  }

  const handleSelectJd = useCallback((jd: SelectedAiUsageJd): void => {
    setSelectedJd(jd);
    setScrollRequest((n) => n + 1);
  }, []);

  useEffect(() => {
    if (scrollRequest === 0) return;
    detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [scrollRequest]);

  const detailParams = useMemo<AiUsageJdDetailParams | null>(() => {
    if (activeJd == null) return null;
    return {
      from_date: applied.from_date,
      to_date: applied.to_date,
      ...(activeJd.jdId != null ? { jd_id: activeJd.jdId } : { unassigned: true }),
    };
  }, [activeJd, applied]);

  // Remount detail grids (reset paging / expanded rows) when JD or filters change
  const detailKey = `${activeJd?.jdId ?? 'unassigned'}|${applied.from_date ?? ''}|${applied.to_date ?? ''}`;

  const summary = data?.summary;
  const statBoxes = [
    { label: t('stats.totalJds'),        value: formatTokens(summary?.totalJds ?? 0),        icon: DocumentTextIcon },
    { label: t('stats.totalCandidates'), value: formatTokens(summary?.totalCandidates ?? 0), icon: UsersIcon },
    { label: t('stats.totalTokens'),     value: formatTokens(summary?.totalTokens ?? 0),     icon: SparklesIcon },
    { label: t('stats.totalCost'),       value: formatCost(summary?.totalCost ?? 0),         icon: ChartBarIcon },
  ];

  return (
    <PageContainer>
      <div className="flex flex-col gap-6">

        {/* Header */}
        <h1 className="text-base font-semibold text-text">{t('title')}</h1>

        {/* Stat cards */}
        {isFetching && data == null ? (
          <JdStatCardSkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {statBoxes.map(({ label, value, icon }) => (
              <StatCard key={label} label={label} value={value} icon={icon} />
            ))}
          </div>
        )}

        {/* Filters */}
        <AiUsageFilters
          fromDate={fromDate}
          toDate={toDate}
          selectedJds={selectedJds}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onSelectedJdsChange={(jds) => { setSelectedJdIds(jds.map((j) => j.jdId)); }}
          onSearch={handleSearch}
          onClear={handleClear}
          onExport={() => { void handleExport(); }}
          exportDisabled={(data?.list.length ?? 0) === 0}
          exporting={isExporting}
          disabled={isFetching}
        />

        {/* JD grid — click a JD name to open its processes and candidates */}
        <JdUsageGrid
          data={data?.list ?? []}
          loading={isFetching}
          error={isError && (error as ApiError)?.meta?.kind !== 'auth' ? error : undefined}
          selectedJd={activeJd}
          onSelectJd={handleSelectJd}
        />

        {/* JD details */}
        {activeJd != null && detailParams != null && (
          <section ref={detailsRef} className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-text">{activeJd.jdName}</h2>
              <IconButton
                icon={<XMarkIcon className="h-4 w-4" />}
                ariaLabel={t('actions.close')}
                title={t('actions.close')}
                onClick={() => { setSelectedJd(null); }}
              />
            </div>
            <JdProcessGrid key={`p|${detailKey}`} params={detailParams} jdName={activeJd.jdName} />
            <CandidateUsageGrid key={`c|${detailKey}`} params={detailParams} jdName={activeJd.jdName} />
          </section>
        )}

      </div>
    </PageContainer>
  );
}
