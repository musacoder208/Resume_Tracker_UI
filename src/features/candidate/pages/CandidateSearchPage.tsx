import { useState, useEffect, useMemo, useRef, type JSX } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Squares2X2Icon,
  TableCellsIcon,
} from '@/icons';
import { CandidateListCard } from '../candidateListCard';
import { CandidateGridView } from '../candidateGridView';
import { useGetCandidateListQuery } from '../api/candidate.api';
import { useGetMasterDataQuery, useGetJDDropdownQuery } from '@/features/jd/api/jd.api';
import { useGetModuleIdQuery } from '@/features/common/api/common.api';
import type { CandidateListParams, CandidateListSummary } from '../types/candidate.types';

const SKELETON_COUNT = 6;
const PAGE_SIZE = 10;
const FILTERS_STORAGE_KEY = 'candidateSearchFilters';
const HR_STATUS_DEFAULTED_KEY = 'candidateSearchHrStatusDefaulted';

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
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter state — persisted in the URL so it survives navigating away (e.g. to a
  // candidate's detail page) and back, instead of resetting on remount.
  const selectedJd = searchParams.get('jd') ?? '';
  const selectedVerdict = searchParams.get('verdict') ?? '';
  const selectedExperience = searchParams.get('experience') ?? '';
  const selectedStatus = searchParams.get('status') ?? '';
  const selectedHrStatus = searchParams.get('hrStatus') ?? '';
  const selectedGender = searchParams.get('gender') ?? '';
  const debouncedSearch = searchParams.get('search') ?? '';
  const page = Number(searchParams.get('page') ?? '1');
  const sortBy = searchParams.get('sortBy') ?? '';
  const sortOrder = searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc';

  // Display mode — table (grid) vs. card — kept in the URL (not the filters
  // sync/restore mechanism above, since it's a view preference, not a search
  // filter) so it survives navigating away and back like everything else here.
  // Grid is the default; card is the explicit opt-in.
  const viewMode = searchParams.get('view') === 'card' ? 'card' : 'grid';
  function setViewMode(mode: 'card' | 'grid'): void {
    const next = new URLSearchParams(searchParams);
    if (mode === 'grid') next.delete('view'); else next.set('view', mode);
    setSearchParams(next, { replace: true });
  }

  // Grid-view column sorting. NOTE: the backend's fn_get_candidate_list does
  // not yet accept a sort_by/sort_order param — until it does, this updates
  // the header's sort indicator but the result order won't actually change.
  function handleSortChange(nextSortBy: string, nextSortOrder: 'asc' | 'desc'): void {
    const next = new URLSearchParams(searchParams);
    if (nextSortBy === '') {
      next.delete('sortBy');
      next.delete('sortOrder');
    } else {
      next.set('sortBy', nextSortBy);
      next.set('sortOrder', nextSortOrder);
    }
    next.set('page', '1');
    setSearchParams(next, { replace: true });
  }

  // Search input's initial value: prefer the URL, else fall back to sessionStorage —
  // computed once up front so no setState call is needed once the restore effect runs.
  const [searchInput, setSearchInput] = useState<string>(() => {
    if (debouncedSearch !== '') return debouncedSearch;
    const saved = sessionStorage.getItem(FILTERS_STORAGE_KEY);
    if (saved == null) return '';
    try {
      const parsed = JSON.parse(saved) as Record<string, string>;
      return parsed.search ?? '';
    } catch {
      return '';
    }
  });

  // Restore filters from sessionStorage when arriving with a clean URL (e.g. via a
  // sidebar link to another page and back) — the URL alone doesn't survive that.
  useEffect(() => {
    if (searchParams.toString() !== '') return;
    const saved = sessionStorage.getItem(FILTERS_STORAGE_KEY);
    if (saved == null) return;
    try {
      const parsed = JSON.parse(saved) as Record<string, string>;
      const next = new URLSearchParams();
      Object.entries(parsed).forEach(([key, value]) => {
        if (value !== '') next.set(key, value);
      });
      setSearchParams(next, { replace: true });
    } catch {
      // corrupt storage value — ignore and start fresh
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep sessionStorage in sync with the current filter state so it survives
  // navigating to another page and back. Skips its very first run after mount —
  // otherwise it would fire in the same commit as the restore effect above,
  // using the still-empty pre-restore values and wiping out what was just restored.
  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    sessionStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify({
      jd: selectedJd,
      verdict: selectedVerdict,
      experience: selectedExperience,
      status: selectedStatus,
      hrStatus: selectedHrStatus,
      gender: selectedGender,
      search: debouncedSearch,
      page: String(page),
    }));
  }, [selectedJd, selectedVerdict, selectedExperience, selectedStatus, selectedHrStatus, selectedGender, debouncedSearch, page]);

  // Updates one filter param in the URL (replacing history entry) and resets to page 1.
  function setFilterParam(key: string, value: string): void {
    const next = new URLSearchParams(searchParams);
    if (value === '') next.delete(key); else next.set(key, value);
    next.set('page', '1');
    setSearchParams(next, { replace: true });
  }

  function setPageParam(nextPage: number): void {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(nextPage));
    setSearchParams(next, { replace: true });
  }

  // Debounce search input (400ms) before writing it to the URL — also resets page
  useEffect(() => {
    const id = setTimeout(() => {
      if (searchInput !== debouncedSearch) setFilterParam('search', searchInput);
    }, 400);
    return () => { clearTimeout(id); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // sortBy/sortOrder deliberately excluded from queryParams — sorting is
  // applied client-side on the grid view's currently loaded page, not sent
  // to the API.
  const queryParams = useMemo((): CandidateListParams => {
    const p: CandidateListParams = { page, page_size: PAGE_SIZE, jd_id: selectedJd };
    if (debouncedSearch !== '') p.search_text = debouncedSearch;
    if (selectedVerdict !== '') p.verdict = selectedVerdict;
    if (selectedExperience !== '') p.experience_range = selectedExperience;
    if (selectedStatus !== '') p.status_id = selectedStatus;
    if (selectedHrStatus !== '') p.hr_status_code = selectedHrStatus;
    if (selectedGender !== '') p.gender = selectedGender;
    return p;
  }, [selectedJd, debouncedSearch, selectedVerdict, selectedExperience, selectedStatus, selectedHrStatus, selectedGender, page]);

  const { data: moduleId } = useGetModuleIdQuery('CAND_MGT');
  const { data: masterData } = useGetMasterDataQuery();
  const { data: jdList = [] } = useGetJDDropdownQuery();
  const jdOptions = jdList.map((item) => ({ value: String(item.jdId), label: item.label }));
  const moduleStatuses = moduleId != null ? (masterData?.statuses?.[String(moduleId)] ?? []) : [];
  const hrStatuses = masterData?.hrStatuses ?? [];
  const genders = masterData?.genders ?? [];
  const { data, isLoading, isFetching } = useGetCandidateListQuery(queryParams, {
    skip: selectedJd === '',
  });

  // Default the HR Status filter to "Pending" once per session (fresh login —
  // sessionStorage is cleared on logout), the first time the master data with
  // HR statuses becomes available. Uses its own dedicated storage flag (set at
  // the exact moment the decision is made) rather than "is anything stored
  // under the filters key yet" — an unrelated filter change (e.g. picking a
  // JD, which is required before results load) can write to the filters key
  // first if it happens before this master data finishes loading, which would
  // otherwise be mistaken for "the default was already decided".
  const hasAppliedHrStatusDefaultRef = useRef(false);
  // Marks the HR Status default as decided immediately, so an explicit user
  // action (clearing filters, or picking "All" from the HR Status dropdown)
  // can't be overridden later if the master data query hasn't resolved yet —
  // the effect below can't otherwise tell "never touched" apart from
  // "user just chose All", since both read as an empty selectedHrStatus.
  function markHrStatusDecided(): void {
    hasAppliedHrStatusDefaultRef.current = true;
    sessionStorage.setItem(HR_STATUS_DEFAULTED_KEY, 'true');
  }
  useEffect(() => {
    if (hasAppliedHrStatusDefaultRef.current) return;
    if (hrStatuses.length === 0) return;
    if (selectedHrStatus !== '') { markHrStatusDecided(); return; }
    if (sessionStorage.getItem(HR_STATUS_DEFAULTED_KEY) === 'true') { hasAppliedHrStatusDefaultRef.current = true; return; }

    const pending = hrStatuses.find((s) => s.name.toLowerCase() === 'pending')
      ?? hrStatuses.find((s) => s.code.toLowerCase() === 'pending');

    markHrStatusDecided();
    if (pending != null) setFilterParam('hrStatus', pending.code);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hrStatuses]);

  const hasActiveFilters =
    searchInput !== '' || selectedVerdict !== '' || selectedExperience !== '' || selectedStatus !== '' || selectedHrStatus !== '' || selectedGender !== '';

  function clearFilters(): void {
    markHrStatusDecided();
    setSearchInput('');
    const next = new URLSearchParams(searchParams);
    next.delete('search');
    next.delete('verdict');
    next.delete('experience');
    next.delete('status');
    next.delete('gender');

    // Reset HR Status to its "Pending" default (same as a fresh page load)
    // rather than clearing it to "All".
    const pending = hrStatuses.find((s) => s.name.toLowerCase() === 'pending')
      ?? hrStatuses.find((s) => s.code.toLowerCase() === 'pending');
    if (pending != null) next.set('hrStatus', pending.code); else next.delete('hrStatus');

    next.set('page', '1');
    setSearchParams(next, { replace: true });
  }

  function handleJdChange(value: string): void { setFilterParam('jd', value); }
  function handleVerdictChange(value: string): void { setFilterParam('verdict', value); }
  function handleExperienceChange(value: string): void { setFilterParam('experience', value); }
  function handleStatusChange(value: string): void { setFilterParam('status', value); }
  function handleHrStatusChange(value: string): void { markHrStatusDecided(); setFilterParam('hrStatus', value); }
  function handleGenderChange(value: string): void { setFilterParam('gender', value); }

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
  // Grid view renders its own pagination bar (via DataGrid) — this one is card-view only.
  const showPagination = !isLoading && viewMode === 'card' && candidates.length > 0;

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
            <select
              value={selectedHrStatus}
              onChange={(e) => { handleHrStatusChange(e.target.value); }}
              className="rounded-md border border-border bg-surface py-1.5 ps-3 pe-8 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{t('filters.allHrStatuses')}</option>
              {hrStatuses.map((s) => (
                <option key={s.id} value={s.code}>{s.name}</option>
              ))}
            </select>
            <select
              value={selectedGender}
              onChange={(e) => { handleGenderChange(e.target.value); }}
              className="rounded-md border border-border bg-surface py-1.5 ps-3 pe-8 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{t('filters.allGenders')}</option>
              {genders.map((g) => (
                <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1).toLowerCase()}</option>
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
          {/* Results count + view toggle */}
          <div className="flex items-center justify-between gap-3">
            {!isLoading && data != null ? (
              <p className="text-xs text-text-muted">
                {t('landing.showing', {
                  count: candidates.length,
                  total: totalCount,
                })}
              </p>
            ) : <span />}

            <div className="flex items-center gap-0.5 rounded-lg border border-border bg-surface p-0.5">
              <button
                type="button"
                title={t('viewToggle.cardView')}
                aria-label={t('viewToggle.cardView')}
                aria-pressed={viewMode === 'card'}
                onClick={() => { setViewMode('card'); }}
                className={clsx(
                  'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                  viewMode === 'card' ? 'bg-primary text-white' : 'text-text-muted hover:bg-surface-muted hover:text-text',
                )}
              >
                <Squares2X2Icon className="h-4 w-4" />
              </button>
              <button
                type="button"
                title={t('viewToggle.gridView')}
                aria-label={t('viewToggle.gridView')}
                aria-pressed={viewMode === 'grid'}
                onClick={() => { setViewMode('grid'); }}
                className={clsx(
                  'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                  viewMode === 'grid' ? 'bg-primary text-white' : 'text-text-muted hover:bg-surface-muted hover:text-text',
                )}
              >
                <TableCellsIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Skeleton — initial load (card view only; grid view uses DataGrid's own loading state) */}
          {isLoading && viewMode === 'card' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <CandidateListCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Cards — with subtle opacity while refetching */}
          {!isLoading && viewMode === 'card' && candidates.length > 0 && (
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

          {/* Grid/table view */}
          {viewMode === 'grid' && (candidates.length > 0 || isLoading || isFetching) && (
            <CandidateGridView
              candidates={candidates}
              totalRows={totalCount}
              page={page}
              pageSize={PAGE_SIZE}
              sortBy={sortBy}
              sortOrder={sortOrder}
              isFetching={isLoading || isFetching}
              onPageChange={setPageParam}
              onSortChange={handleSortChange}
              onView={(candidate) => { handleCardClick(candidate.candidateId, candidate.jdId); }}
            />
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
                  onClick={() => { setPageParam(Math.max(1, page - 1)); }}
                  disabled={page <= 1 || isFetching}
                  className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text disabled:cursor-not-allowed disabled:opacity-40 hover:bg-surface-muted"
                >
                  <ChevronLeftIcon className="h-3.5 w-3.5" />
                  {t('landing.prev')}
                </button>
                <button
                  onClick={() => { setPageParam(Math.min(totalPages, page + 1)); }}
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
