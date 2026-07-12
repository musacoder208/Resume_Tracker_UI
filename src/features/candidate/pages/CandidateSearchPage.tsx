import { useState, useEffect, useMemo, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { PageContainer } from '@/components/containers/PageContainer';
import { Button } from '@/components/ui/button';
import { CandidateListCardSkeleton } from '@/components/ui/loader';
import { useT } from '@/i18n/useT';
import {
  ArrowUpTrayIcon,
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  BriefcaseIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  InboxArrowDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@/icons';
import { CandidateListCard } from '../candidateListCard';
import { useGetCandidateListQuery } from '../api/candidate.api';
import { useGetMasterDataQuery, useGetJDDropdownQuery } from '@/features/jd/api/jd.api';
import { useGetModuleIdQuery } from '@/features/common/api/common.api';
import type { CandidateListParams, CandidateListSummary } from '../types/candidate.types';

const SKELETON_COUNT = 6;
const PAGE_SIZE = 10;

// ── Inline sub-components ─────────────────────────────────────────────────────

interface SummaryCardProps {
  label: string;
  value: string | number;
  icon: JSX.Element;
  accentBg: string;
}

function SummaryCard({ label, value, icon, accentBg }: SummaryCardProps): JSX.Element {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-text">{value}</p>
        </div>
        <div className={clsx('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', accentBg)}>
          {icon}
        </div>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  hint: string;
  onUpload?: () => void;
  uploadLabel?: string;
  onClear?: () => void;
  clearLabel?: string;
}

function EmptyState({ title, hint, onUpload, uploadLabel, onClear, clearLabel }: EmptyStateProps): JSX.Element {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted">
        <InboxArrowDownIcon className="h-8 w-8 text-text-muted" />
      </div>
      <p className="mt-5 text-sm font-semibold text-text">{title}</p>
      <p className="mt-1.5 max-w-xs text-xs text-text-muted">{hint}</p>
      <div className="mt-6 flex items-center gap-3">
        {onClear != null && (
          <Button variant="outline" size="sm" onClick={onClear}>
            {clearLabel}
          </Button>
        )}
        {onUpload != null && (
          <Button
            variant="primary"
            size="sm"
            leadingIcon={<ArrowUpTrayIcon className="h-4 w-4" />}
            onClick={onUpload}
          >
            {uploadLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function CandidateSearchPage(): JSX.Element {
  const { t } = useT('candidate');
  const navigate = useNavigate();

  // Filter state
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedJd, setSelectedJd] = useState('');
  const [selectedVerdict, setSelectedVerdict] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);

  // Debounce search input (400ms) — also resets page
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 400);
    return () => { clearTimeout(id); };
  }, [searchInput]);

  const queryParams = useMemo((): CandidateListParams => {
    const p: CandidateListParams = { page, page_size: PAGE_SIZE, jd_id: selectedJd };
    if (debouncedSearch !== '') p.search_text = debouncedSearch;
    if (selectedVerdict !== '') p.verdict = selectedVerdict;
    if (selectedExperience !== '') p.experience_range = selectedExperience;
    if (selectedStatus !== '') p.status_id = selectedStatus;
    return p;
  }, [selectedJd, debouncedSearch, selectedVerdict, selectedExperience, selectedStatus, page]);

  const { data: moduleId } = useGetModuleIdQuery('CAND_MGT');
  const { data: masterData } = useGetMasterDataQuery();
  const { data: jdList = [] } = useGetJDDropdownQuery();
  const jdOptions = jdList.map((item) => ({ value: String(item.jdId), label: item.label }));
  const moduleStatuses = moduleId != null ? (masterData?.statuses?.[String(moduleId)] ?? []) : [];
  const { data, isLoading, isFetching } = useGetCandidateListQuery(queryParams, {
    skip: selectedJd === '',
  });

  const hasActiveFilters =
    searchInput !== '' || selectedVerdict !== '' || selectedExperience !== '' || selectedStatus !== '';

  function clearFilters(): void {
    setSearchInput('');
    setSelectedVerdict('');
    setSelectedExperience('');
    setSelectedStatus('');
    setPage(1);
  }

  function handleJdChange(value: string): void { setSelectedJd(value); setPage(1); }
  function handleVerdictChange(value: string): void { setSelectedVerdict(value); setPage(1); }
  function handleExperienceChange(value: string): void { setSelectedExperience(value); setPage(1); }
  function handleStatusChange(value: string): void { setSelectedStatus(value); setPage(1); }

  function handleUpload(): void {
    void navigate('/candidate/upload');
  }

  function handleCardClick(candidateId: number, jdId: number): void {
    void navigate(`/candidate/${candidateId}`, { state: { jdId } });
  }

  // Summary — fall back to zeros while loading
  const summary: CandidateListSummary = data?.summary ?? {
    activeJds: 0,
    strongMatch: 0,
    avgMatchScore: 0,
    pendingScoring: 0,
    totalCandidates: 0,
    scoredCandidates: 0,
  };

  const candidates = data?.candidates ?? [];

  // Pagination — use backend response if available, else estimate from summary total
  const totalCount = data?.pagination?.totalCount ?? summary.totalCandidates;
  const totalPages = data?.pagination?.totalPages ?? Math.ceil(totalCount / PAGE_SIZE);
  const showPagination = !isLoading && candidates.length > 0;

  return (
    <PageContainer>
      <div className="flex flex-col gap-6">

        {/* ── Page header ──────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-text">{t('page.title')}</h1>
            <p className="mt-0.5 text-xs text-text-muted">{t('page.subtitle')}</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            leadingIcon={<ArrowUpTrayIcon className="h-4 w-4" />}
            onClick={handleUpload}
          >
            {t('actions.uploadCandidates')}
          </Button>
        </div>

        {/* ── Summary cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          <SummaryCard
            label={t('summary.totalCandidates')}
            value={summary.totalCandidates}
            icon={<UsersIcon className="h-5 w-5 text-primary" />}
            accentBg="bg-primary/10"
          />
          <SummaryCard
            label={t('summary.scored')}
            value={summary.scoredCandidates}
            icon={<CheckCircleIcon className="h-5 w-5 text-success" />}
            accentBg="bg-success/10"
          />
          <SummaryCard
            label={t('summary.pending')}
            value={summary.pendingScoring}
            icon={<ClockIcon className="h-5 w-5 text-warning" />}
            accentBg="bg-warning/10"
          />
          <SummaryCard
            label={t('summary.avgScore')}
            value={`${summary.avgMatchScore.toFixed(1)}%`}
            icon={<ChartBarIcon className="h-5 w-5 text-primary" />}
            accentBg="bg-primary/10"
          />
          <SummaryCard
            label={t('summary.activeJds')}
            value={summary.activeJds}
            icon={<BriefcaseIcon className="h-5 w-5 text-success" />}
            accentBg="bg-success/10"
          />
        </div>

        {/* ── Filter toolbar ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">

          {/* Row 1 — search + JD */}
          <div className="flex items-start gap-3">
            <div className="relative min-w-0 flex-1">
              <MagnifyingGlassIcon className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => { setSearchInput(e.target.value); }}
                placeholder={t('filters.search')}
                className="w-full rounded-md border border-border bg-transparent py-1.5 ps-9 pe-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <select
                value={selectedJd}
                onChange={(e) => { handleJdChange(e.target.value); }}
                className={clsx(
                  'w-56 rounded-md border bg-surface py-1.5 ps-3 pe-8 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary',
                  selectedJd === '' ? 'border-error' : 'border-border',
                )}
              >
                <option value="">{t('jdSelection.placeholder')}</option>
                {jdOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {selectedJd === '' && (
                <p className="text-xs text-error">{t('jdSelection.required')}</p>
              )}
            </div>
          </div>

          {/* Row 2 — refinement filters */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedVerdict}
              onChange={(e) => { handleVerdictChange(e.target.value); }}
              className="rounded-md border border-border bg-surface py-1.5 ps-3 pe-8 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{t('filters.allVerdicts')}</option>
              <option value="Excellent Match">{t('filters.verdictExcellent')}</option>
              <option value="Strong Match">{t('filters.verdictStrong')}</option>
              <option value="Good Match">{t('filters.verdictGood')}</option>
              <option value="Moderate Match">{t('filters.verdictModerate')}</option>
              <option value="Weak Match">{t('filters.verdictWeak')}</option>
            </select>
            <select
              value={selectedExperience}
              onChange={(e) => { handleExperienceChange(e.target.value); }}
              className="rounded-md border border-border bg-surface py-1.5 ps-3 pe-8 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{t('filters.allExperience')}</option>
              <option value="0-1">{t('filters.expFresher')}</option>
              <option value="1-3">{t('filters.expJunior')}</option>
              <option value="3-5">{t('filters.expMid')}</option>
              <option value="5-8">{t('filters.expSenior')}</option>
              <option value="8+">{t('filters.expExpert')}</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => { handleStatusChange(e.target.value); }}
              className="rounded-md border border-border bg-surface py-1.5 ps-3 pe-8 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{t('filters.allStatuses')}</option>
              {moduleStatuses.map((s) => (
                <option key={s.id} value={String(s.id)}>{s.name}</option>
              ))}
            </select>
            {hasActiveFilters && (
              <Button
                variant="soft"
                size="sm"
                leadingIcon={<XMarkIcon className="h-4 w-4" />}
                onClick={clearFilters}
              >
                {t('filters.clear')}
              </Button>
            )}
          </div>

        </div>

        {/* ── Results section ───────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Results count */}
          {!isLoading && data != null && (
            <p className="text-xs text-text-muted">
              {t('landing.showing', {
                count: candidates.length,
                total: summary.totalCandidates,
              })}
            </p>
          )}

          {/* Skeleton — initial load */}
          {isLoading && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <CandidateListCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Cards — with subtle opacity while refetching */}
          {!isLoading && candidates.length > 0 && (
            <div className={clsx(
              'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 transition-opacity',
              isFetching && 'opacity-60 pointer-events-none',
            )}>
              {candidates.map((candidate) => (
                <CandidateListCard
                  key={candidate.candidateId}
                  candidate={candidate}
                  onClick={() => { handleCardClick(candidate.candidateId, candidate.jdId); }}
                />
              ))}
            </div>
          )}

          {/* Empty state — no candidates exist at all */}
          {!isLoading && candidates.length === 0 && !hasActiveFilters && (
            <EmptyState
              title={t('emptyState.title')}
              hint={t('emptyState.description')}
              onUpload={handleUpload}
              uploadLabel={t('actions.uploadCandidates')}
            />
          )}

          {/* Empty state — no results match filters */}
          {!isLoading && candidates.length === 0 && hasActiveFilters && (
            <EmptyState
              title={t('landing.noResults')}
              hint={t('landing.noResultsHint')}
              onClear={clearFilters}
              clearLabel={t('filters.clear')}
            />
          )}

          {/* Pagination */}
          {showPagination && (
            <div className="flex items-center justify-between border-t border-border pt-4">
              <p className="text-xs text-text-muted">
                {t('landing.page', { page, total: totalPages })}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setPage((p) => Math.max(1, p - 1)); }}
                  disabled={page <= 1 || isFetching}
                  className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text disabled:cursor-not-allowed disabled:opacity-40 hover:bg-surface-muted"
                >
                  <ChevronLeftIcon className="h-3.5 w-3.5" />
                  {t('landing.prev')}
                </button>
                <button
                  onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); }}
                  disabled={page >= totalPages || isFetching}
                  className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text disabled:cursor-not-allowed disabled:opacity-40 hover:bg-surface-muted"
                >
                  {t('landing.next')}
                  <ChevronRightIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </PageContainer>
  );
}
