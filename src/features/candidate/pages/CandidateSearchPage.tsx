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
import { useGetRoundsQuery, useGetRoundActionsQuery } from '../interviewProcess/api/interviewProcess.api';
import type { CandidateListParams, CandidateListSummary } from '../types/candidate.types';

const SKELETON_COUNT = 6;
const PAGE_SIZE = 10;
const FILTERS_STORAGE_KEY = 'candidateSearchFilters';
// HR Status filter is disabled (see all `HR status disabled` markers below) — kept commented
// out rather than deleted in case it's reinstated later.
// const HR_STATUS_DEFAULTED_KEY = 'candidateSearchHrStatusDefaulted';
const STATUS_DEFAULTED_KEY = 'candidateSearchStatusDefaulted';

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

interface FilterBarValues {
  jd: string;
  verdict: string;
  experience: string;
  status: string;
  gender: string;
  round: string;
  action: string;
  search: string;
}

interface FilterBarProps {
  initial: FilterBarValues;
  jdOptions: Array<{ value: string; label: string }>;
  moduleStatuses: Array<{ id: number; name: string }>;
  genders: string[];
  roundOptions: Array<{ id: number; label: string }>;
  actionOptions: Array<{ id: number; label: string }>;
  hasActiveFilters: boolean;
  onSearch: (values: FilterBarValues) => void;
  onClear: () => void;
  t: (key: string) => string;
}

// Owns all filter inputs as local draft state — nothing here touches the URL or fires the API
// until Search is clicked. The parent remounts this component (via a `key` built from the
// committed filter values) whenever those committed values change from elsewhere — a fresh
// Search/Clear, the "default to Ready" effect, a sessionStorage restore, or browser back/forward
// — so the draft fields re-sync to match without needing a sync effect here.
function FilterBar({
  initial,
  jdOptions,
  moduleStatuses,
  genders,
  roundOptions,
  actionOptions,
  hasActiveFilters,
  onSearch,
  onClear,
  t,
}: FilterBarProps): JSX.Element {
  const [search, setSearch] = useState(initial.search);
  const [jd, setJd] = useState(initial.jd);
  const [verdict, setVerdict] = useState(initial.verdict);
  const [experience, setExperience] = useState(initial.experience);
  const [status, setStatus] = useState(initial.status);
  const [gender, setGender] = useState(initial.gender);
  const [round, setRound] = useState(initial.round);
  const [action, setAction] = useState(initial.action);

  function submit(): void {
    onSearch({ jd, verdict, experience, status, gender, round, action, search });
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">

      {/* Row 1 — search + JD */}
      <div className="flex items-start gap-3">
        <div className="relative min-w-0 flex-1">
          <MagnifyingGlassIcon className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); }}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
            placeholder={t('filters.search')}
            className="w-full rounded-md border border-border bg-transparent py-1.5 ps-9 pe-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <select
            value={jd}
            onChange={(e) => { setJd(e.target.value); }}
            className={clsx(
              'w-56 rounded-md border bg-surface py-1.5 ps-3 pe-8 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary',
              jd === '' ? 'border-error' : 'border-border',
            )}
          >
            <option value="">{t('jdSelection.placeholder')}</option>
            {jdOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {jd === '' && (
            <p className="text-xs text-error">{t('jdSelection.required')}</p>
          )}
        </div>
      </div>

      {/* Row 2 — refinement filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={verdict}
          onChange={(e) => { setVerdict(e.target.value); }}
          className="rounded-md border border-border bg-surface py-1.5 ps-3 pe-8 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">{t('filters.allVerdicts')}</option>
          <option value="Strong Match">{t('filters.verdictStrong')}</option>
          <option value="Good Match">{t('filters.verdictGood')}</option>
          <option value="Moderate Match">{t('filters.verdictModerate')}</option>
          <option value="Weak Match">{t('filters.verdictWeak')}</option>
        </select>
        <select
          value={experience}
          onChange={(e) => { setExperience(e.target.value); }}
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
          value={status}
          onChange={(e) => { setStatus(e.target.value); }}
          className="rounded-md border border-border bg-surface py-1.5 ps-3 pe-8 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">{t('filters.allStatuses')}</option>
          {moduleStatuses.map((s) => (
            <option key={s.id} value={String(s.id)}>{s.name}</option>
          ))}
        </select>
        <select
          value={gender}
          onChange={(e) => { setGender(e.target.value); }}
          className="rounded-md border border-border bg-surface py-1.5 ps-3 pe-8 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">{t('filters.allGenders')}</option>
          {genders.map((g) => (
            <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1).toLowerCase()}</option>
          ))}
        </select>
        <select
          value={round}
          onChange={(e) => { setRound(e.target.value); }}
          className="rounded-md border border-border bg-surface py-1.5 ps-3 pe-8 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">{t('filters.allRounds')}</option>
          {roundOptions.map((r) => (
            <option key={r.id} value={String(r.id)}>{r.label}</option>
          ))}
        </select>
        <select
          value={action}
          onChange={(e) => { setAction(e.target.value); }}
          className="rounded-md border border-border bg-surface py-1.5 ps-3 pe-8 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">{t('filters.allRoundActions')}</option>
          {actionOptions.map((a) => (
            <option key={a.id} value={String(a.id)}>{a.label}</option>
          ))}
        </select>
        <Button
          variant="primary"
          size="sm"
          leadingIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
          onClick={submit}
          disabled={jd === ''}
        >
          {t('filters.searchButton')}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="soft"
            size="sm"
            leadingIcon={<XMarkIcon className="h-4 w-4" />}
            onClick={onClear}
          >
            {t('filters.clear')}
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
  // HR status disabled — const selectedHrStatus = searchParams.get('hrStatus') ?? '';
  const selectedGender = searchParams.get('gender') ?? '';
  const selectedRound = searchParams.get('round') ?? '';
  const selectedAction = searchParams.get('action') ?? '';
  const selectedSearch = searchParams.get('search') ?? '';
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
      // hrStatus: selectedHrStatus, // HR status disabled
      gender: selectedGender,
      round: selectedRound,
      action: selectedAction,
      search: selectedSearch,
      page: String(page),
    }));
  }, [selectedJd, selectedVerdict, selectedExperience, selectedStatus, /* selectedHrStatus, */ selectedGender, selectedRound, selectedAction, selectedSearch, page]);

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

  // sortBy/sortOrder deliberately excluded from queryParams — sorting is
  // applied client-side on the grid view's currently loaded page, not sent
  // to the API.
  const queryParams = useMemo((): CandidateListParams => {
    const p: CandidateListParams = { page, page_size: PAGE_SIZE, jd_id: selectedJd };
    if (selectedSearch !== '') p.search_text = selectedSearch;
    if (selectedVerdict !== '') p.verdict = selectedVerdict;
    if (selectedExperience !== '') p.experience_range = selectedExperience;
    if (selectedStatus !== '') p.status_id = selectedStatus;
    // if (selectedHrStatus !== '') p.hr_status_code = selectedHrStatus; // HR status disabled
    if (selectedGender !== '') p.gender = selectedGender;
    if (selectedRound !== '') p.round_id = selectedRound;
    if (selectedAction !== '') p.action_id = selectedAction;
    return p;
  }, [selectedJd, selectedSearch, selectedVerdict, selectedExperience, selectedStatus, /* selectedHrStatus, */ selectedGender, selectedRound, selectedAction, page]);

  const { data: moduleId } = useGetModuleIdQuery('CAND_MGT');
  const { data: masterData } = useGetMasterDataQuery();
  const { data: jdList = [] } = useGetJDDropdownQuery();
  const jdOptions = jdList.map((item) => ({ value: String(item.jdId), label: item.label }));
  const moduleStatuses = moduleId != null ? (masterData?.statuses?.[String(moduleId)] ?? []) : [];
  // HR status disabled — const hrStatuses = masterData?.hrStatuses ?? [];
  const genders = masterData?.genders ?? [];
  const { data: roundOptions = [] } = useGetRoundsQuery();
  const { data: actionOptions = [] } = useGetRoundActionsQuery();
  const { data, isLoading, isFetching } = useGetCandidateListQuery(queryParams, {
    skip: selectedJd === '',
  });

  // HR status disabled — the whole "default HR Status to Pending" mechanism is kept here,
  // commented out, in case it's reinstated later.
  // const hasAppliedHrStatusDefaultRef = useRef(false);
  // function markHrStatusDecided(): void {
  //   hasAppliedHrStatusDefaultRef.current = true;
  //   sessionStorage.setItem(HR_STATUS_DEFAULTED_KEY, 'true');
  // }
  // useEffect(() => {
  //   if (hasAppliedHrStatusDefaultRef.current) return;
  //   if (hrStatuses.length === 0) return;
  //   if (selectedHrStatus !== '') { markHrStatusDecided(); return; }
  //   if (sessionStorage.getItem(HR_STATUS_DEFAULTED_KEY) === 'true') { hasAppliedHrStatusDefaultRef.current = true; return; }
  //
  //   const pending = hrStatuses.find((s) => s.name.toLowerCase() === 'pending')
  //     ?? hrStatuses.find((s) => s.code.toLowerCase() === 'pending');
  //
  //   markHrStatusDecided();
  //   if (pending != null) setFilterParam('hrStatus', pending.code);
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [hrStatuses]);

  // Default the (All) Status filter to "Ready" once per session (fresh login — sessionStorage
  // is cleared on logout), the first time the module's status master data becomes available.
  // Mirrors the previous HR-Status-defaults-to-Pending mechanism above, now applied to this
  // filter instead. Matched by name, not code — the statuses master-data endpoint only exposes
  // {id, name} (see MasterDataItem), not a status_code field.
  const hasAppliedStatusDefaultRef = useRef(false);
  function markStatusDecided(): void {
    hasAppliedStatusDefaultRef.current = true;
    sessionStorage.setItem(STATUS_DEFAULTED_KEY, 'true');
  }
  useEffect(() => {
    if (hasAppliedStatusDefaultRef.current) return;
    if (moduleStatuses.length === 0) return;
    if (selectedStatus !== '') { markStatusDecided(); return; }
    if (sessionStorage.getItem(STATUS_DEFAULTED_KEY) === 'true') { hasAppliedStatusDefaultRef.current = true; return; }

    const ready = moduleStatuses.find((s) => s.name.toLowerCase() === 'ready');

    markStatusDecided();
    if (ready != null) setFilterParam('status', String(ready.id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleStatuses]);

  const hasActiveFilters =
    selectedSearch !== '' || selectedVerdict !== '' || selectedExperience !== '' || selectedStatus !== '' || /* selectedHrStatus !== '' || */ selectedGender !== '' || selectedRound !== '' || selectedAction !== '';

  function clearFilters(): void {
    markStatusDecided();
    const next = new URLSearchParams(searchParams);
    next.delete('search');
    next.delete('verdict');
    next.delete('experience');
    next.delete('gender');
    next.delete('round');
    next.delete('action');

    // Reset Status to its "Ready" default (same as a fresh page load) rather than clearing it
    // to "All" — mirrors the previous HR Status behavior above.
    const ready = moduleStatuses.find((s) => s.name.toLowerCase() === 'ready');
    if (ready != null) next.set('status', String(ready.id)); else next.delete('status');

    next.set('page', '1');
    setSearchParams(next, { replace: true });
  }

  // Commits the FilterBar's draft values in one shot — the only place that actually triggers a
  // new fetch from a filter change (via the resulting queryParams update), per the "only call
  // the API when Search is clicked" requirement. Mount/refresh/navigating back still fetch
  // immediately as usual, since useGetCandidateListQuery below always fetches on mount.
  function applyFilters(values: FilterBarValues): void {
    markStatusDecided();
    const next = new URLSearchParams(searchParams);
    const setOrDelete = (key: string, value: string): void => {
      if (value === '') next.delete(key); else next.set(key, value);
    };
    setOrDelete('jd', values.jd);
    setOrDelete('verdict', values.verdict);
    setOrDelete('experience', values.experience);
    setOrDelete('status', values.status);
    setOrDelete('gender', values.gender);
    setOrDelete('round', values.round);
    setOrDelete('action', values.action);
    setOrDelete('search', values.search);
    next.set('page', '1');
    setSearchParams(next, { replace: true });
  }

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

  // Remounts FilterBar (resetting its drafts to match) whenever the committed filters change
  // from outside the FilterBar itself — see the FilterBar component's own comment above.
  const filterKey = [selectedJd, selectedVerdict, selectedExperience, selectedStatus, selectedGender, selectedRound, selectedAction, selectedSearch].join('|');

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
        <FilterBar
          key={filterKey}
          initial={{
            jd: selectedJd,
            verdict: selectedVerdict,
            experience: selectedExperience,
            status: selectedStatus,
            gender: selectedGender,
            round: selectedRound,
            action: selectedAction,
            search: selectedSearch,
          }}
          jdOptions={jdOptions}
          moduleStatuses={moduleStatuses}
          genders={genders}
          roundOptions={roundOptions}
          actionOptions={actionOptions}
          hasActiveFilters={hasActiveFilters}
          onSearch={applyFilters}
          onClear={clearFilters}
          t={t}
        />

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
