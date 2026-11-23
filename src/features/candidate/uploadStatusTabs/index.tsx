import { useState, type JSX } from 'react';
import clsx from 'clsx';
import { useT } from '@/i18n/useT';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Pagination } from '@/components/ui/pagination';
import { InboxArrowDownIcon, EyeIcon, XMarkIcon, DocumentTextIcon } from '@/icons';
import { env } from '@/config/env';
import { CandidateCardSkeleton } from '@/components/ui/loader';
import type {
  CandidateTab,
  UploadStatusCandidate,
  UploadStatusResult,
} from '../types/candidate.types';

interface UploadStatusTabsProps {
  /** One page of the active tab (server-side paginated) */
  data: UploadStatusResult | null;
  activeTab: CandidateTab;
  onTabChange: (tab: CandidateTab) => void;
  pageSize: number;
  pageSizeOptions: readonly number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  /** Selected candidate ids — kept by the parent across pages */
  selectedIds: Set<number>;
  onSelectionChange: (ids: Set<number>) => void;
  isRefreshing: boolean;
  isSaving?: boolean;
  onRefresh: () => void;
  onSaveAndScore: (candidateIds: number[]) => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TABS: { key: CandidateTab; labelKey: string }[] = [
  { key: 'success', labelKey: 'tabs.success' },
  { key: 'duplicate', labelKey: 'tabs.duplicate' },
  { key: 'incomplete', labelKey: 'tabs.incomplete' },
];

const TAB_ACTIVE_CLASSES: Record<CandidateTab, string> = {
  success: 'border-success text-success',
  duplicate: 'border-warning text-warning',
  incomplete: 'border-error text-error',
};

const TAB_COUNT_ACTIVE_CLASSES: Record<CandidateTab, string> = {
  success: 'bg-success/10 text-success',
  duplicate: 'bg-warning/10 text-warning',
  incomplete: 'bg-error/10 text-error',
};

const STATUS_BADGE_CLASSES: Record<CandidateTab, string> = {
  success: 'bg-success/10 text-success',
  duplicate: 'bg-warning/10 text-warning',
  incomplete: 'bg-error/10 text-error',
};

const SKELETON_COUNT = 3;

// Only score_pending candidates can still be selected and sent to Start Scoring.
function isScorePending(candidate: UploadStatusCandidate): boolean {
  return candidate.uploadStatus === 'complete' && candidate.statusCode === 'score_pending';
}

// ── Checkbox config per candidate ─────────────────────────────────────────────

interface CheckboxConfig {
  checked: boolean;
  disabled: boolean;
  accentColor: string | undefined;
}

function getCheckboxConfig(
  candidate: UploadStatusCandidate,
  selectedIds: Set<number>
): CheckboxConfig {
  if (candidate.uploadStatus === 'complete') {
    // Only score_pending candidates can still be scored. Every other status —
    // ready, shortlisted, in interview process, selected, rejected, … — is
    // locked the same way as ready: always checked + green + disabled.
    if (candidate.statusCode !== 'score_pending') {
      return {
        checked: true,
        disabled: true,
        accentColor: 'var(--color-success)',
      };
    }
    // score_pending — checked + red + editable
    return {
      checked: selectedIds.has(candidate.candidateId),
      disabled: false,
      accentColor: 'var(--color-error)',
    };
  }
  // incomplete / duplicate — user-controlled, default checkbox color
  return {
    checked: selectedIds.has(candidate.candidateId),
    disabled: false,
    accentColor: undefined,
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function EmptyState({ hint }: { hint: string }): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted">
        <InboxArrowDownIcon className="h-7 w-7 text-text-muted" />
      </div>
      <p className="mt-4 text-sm text-text-muted">{hint}</p>
    </div>
  );
}

function StatusCard({
  candidate,
  tab,
  checkboxConfig,
  onToggle,
  onPreview,
}: {
  candidate: UploadStatusCandidate;
  tab: CandidateTab;
  checkboxConfig: CheckboxConfig;
  onToggle: () => void;
  onPreview: () => void;
}): JSX.Element {
  const initials = candidate.fullName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  // Batch duplicates (listed in the Duplicate tab) are never extracted — the
  // uploaded file name is all there is.
  const isBatchDuplicate = candidate.uploadStatus === 'batch_duplicate';
  const title = isBatchDuplicate
    ? (candidate.fileName ?? (candidate.fullName !== '' ? candidate.fullName : '—'))
    : candidate.fullName;

  return (
    <div className="flex items-center gap-3 py-3.5">
      {/* Checkbox — only on the complete (success) tab */}
      {tab === 'success' && (
        <input
          type="checkbox"
          checked={checkboxConfig.checked}
          disabled={checkboxConfig.disabled}
          onChange={onToggle}
          className={clsx(
            'h-4 w-4 shrink-0 rounded',
            checkboxConfig.disabled ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
          )}
          style={
            checkboxConfig.accentColor != null
              ? { accentColor: checkboxConfig.accentColor }
              : undefined
          }
        />
      )}

      {/* Avatar */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
        {isBatchDuplicate ? <DocumentTextIcon className="h-4 w-4" /> : initials}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-text" title={title}>
            {title}
          </p>
          <span
            className={clsx(
              'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
              STATUS_BADGE_CLASSES[tab]
            )}
          >
            {candidate.uploadStatus === 'batch_duplicate'
              ? 'batch duplicate'
              : candidate.uploadStatus}
          </span>
          {/* Batch duplicates are never scored, so their status_code isn't meaningful. */}
          {!isBatchDuplicate && candidate.statusCode != null && candidate.statusCode !== '' && (
            <span className="shrink-0 rounded-full bg-surface-muted px-2 py-0.5 text-xs text-text-muted">
              {candidate.statusCode}
            </span>
          )}
        </div>

        {candidate.currentJobTitle != null && candidate.currentJobTitle !== '' && (
          <p className="mt-0.5 truncate text-xs text-text-muted">{candidate.currentJobTitle}</p>
        )}

        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-text-muted">
          {candidate.email != null && <span>{candidate.email}</span>}
          {candidate.phone != null && <span>{candidate.phone}</span>}
        </div>

        {candidate.reason != null && candidate.reason !== '' && (
          <p className="mt-1 text-xs italic text-text-muted">{candidate.reason}</p>
        )}
      </div>

      {/* Preview resume */}
      <button
        type="button"
        onClick={onPreview}
        className="shrink-0 rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface-muted hover:text-primary"
        title="Preview resume"
      >
        <EyeIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function UploadStatusTabs({
  data,
  activeTab,
  onTabChange,
  pageSize,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
  selectedIds,
  onSelectionChange,
  isRefreshing,
  isSaving = false,
  onRefresh,
  onSaveAndScore,
}: UploadStatusTabsProps): JSX.Element {
  const { t } = useT('candidate');
  const [previewCandidate, setPreviewCandidate] = useState<{ id: number; name: string } | null>(
    null
  );

  function toggleCandidate(candidateId: number): void {
    const next = new Set(selectedIds);
    if (next.has(candidateId)) next.delete(candidateId);
    else next.add(candidateId);
    onSelectionChange(next);
  }

  // The rows of the current page (the server already filtered by tab).
  const currentList = data?.rows ?? [];

  const tabCounts: Record<CandidateTab, number> = {
    success: data?.counts.success ?? 0,
    duplicate: data?.counts.duplicate ?? 0,
    incomplete: data?.counts.incomplete ?? 0,
  };

  // Select All works on the score_pending rows of the CURRENT page only.
  // Selections on other pages are kept as they are.
  const pagePendingIds =
    activeTab === 'success' ? currentList.filter(isScorePending).map((c) => c.candidateId) : [];
  const selectedOnPage = pagePendingIds.filter((id) => selectedIds.has(id)).length;
  const isPageAllSelected = pagePendingIds.length > 0 && selectedOnPage === pagePendingIds.length;
  const isPagePartlySelected = selectedOnPage > 0 && !isPageAllSelected;

  function togglePageSelection(): void {
    const next = new Set(selectedIds);
    pagePendingIds.forEach((id) => {
      if (isPageAllSelected) next.delete(id);
      else next.add(id);
    });
    onSelectionChange(next);
  }

  // Only score_pending rows are selectable, so every selected id is sent.
  const hasSelection = selectedIds.size > 0;
  const isScoreDisabled = !hasSelection || isSaving || isRefreshing;

  function renderStartScoring(): JSX.Element {
    return (
      <Button
        variant="primary"
        size="sm"
        disabled={isScoreDisabled}
        onClick={() => {
          onSaveAndScore(Array.from(selectedIds));
        }}
      >
        {isSaving ? t('actions.processing') : t('actions.startScoring')}
      </Button>
    );
  }

  function renderContent(): JSX.Element {
    if (isRefreshing) {
      return (
        <div className="divide-y divide-border-muted">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <CandidateCardSkeleton key={i} layout="row" />
          ))}
        </div>
      );
    }

    if (data == null) {
      return <EmptyState hint={t('results.emptyHint')} />;
    }

    if (currentList.length === 0) {
      return <EmptyState hint={t('results.emptyHint')} />;
    }

    return (
      <div className="divide-y divide-border-muted">
        {currentList.map((c) => (
          <StatusCard
            key={c.candidateId}
            candidate={c}
            tab={activeTab}
            checkboxConfig={getCheckboxConfig(c, selectedIds)}
            onToggle={() => {
              toggleCandidate(c.candidateId);
            }}
            onPreview={() => {
              setPreviewCandidate({ id: c.candidateId, name: c.fullName });
            }}
          />
        ))}
      </div>
    );
  }

  const showTopToolbar = activeTab === 'success' && data != null && currentList.length > 0;

  return (
    <div className="flex flex-col rounded-xl border border-border bg-surface shadow-sm">
      {/* Tab bar + Refresh button */}
      <div className="flex items-center justify-between border-b border-border pe-3">
        <div className="flex px-2">
          {TABS.map(({ key, labelKey }) => {
            const isActive = activeTab === key;
            const count = tabCounts[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onTabChange(key);
                }}
                className={clsx(
                  'relative flex items-center gap-2 border-b-2 px-5 py-4 text-xs font-semibold transition-colors',
                  isActive
                    ? TAB_ACTIVE_CLASSES[key]
                    : 'border-transparent text-text-muted hover:text-text'
                )}
              >
                {t(labelKey)}
                <span
                  className={clsx(
                    'rounded-full px-1.5 py-0.5 text-xs font-bold',
                    isActive ? TAB_COUNT_ACTIVE_CLASSES[key] : 'bg-surface-muted text-text-muted'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <Button variant="secondary" size="xs" disabled={isRefreshing} onClick={onRefresh}>
          {isRefreshing ? t('actions.refreshing') : t('actions.refresh')}
        </Button>
      </div>

      {/* Top action bar — Select All (current page) + Start Scoring */}
      {showTopToolbar && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-muted bg-surface-muted/40 px-5 py-3">
          <div className="flex flex-wrap items-center gap-4">
            <Checkbox
              label={t('results.selectAllPage')}
              checked={isPageAllSelected}
              indeterminate={isPagePartlySelected}
              disabled={pagePendingIds.length === 0 || isRefreshing}
              onChange={togglePageSelection}
            />
            <span className="text-xs text-text-muted">
              {t('results.selectedCount', { count: selectedIds.size })}
            </span>
            {hasSelection && (
              <Button
                variant="outline"
                size="xs"
                onClick={() => {
                  onSelectionChange(new Set());
                }}
              >
                {t('results.clearSelection')}
              </Button>
            )}
          </div>
          {renderStartScoring()}
        </div>
      )}

      {/* Card list */}
      <div className="min-h-[320px] overflow-y-auto px-5">{renderContent()}</div>

      {/* Bottom action bar — pagination + Start Scoring */}
      <div className="flex flex-col gap-3 border-t border-border px-5 py-4 md:flex-row md:items-center md:justify-between">
        {data != null ? (
          <Pagination
            className="flex-1"
            // The server's page — it moves an out-of-range page back to the
            // last one (e.g. after scoring emptied it).
            page={data.pagination.page}
            pageSize={pageSize}
            totalCount={data.pagination.totalCount}
            pageSizeOptions={pageSizeOptions}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            disabled={isRefreshing}
          />
        ) : (
          <span />
        )}
        <div className="flex justify-end">{renderStartScoring()}</div>
      </div>

      {/* Resume preview — right-side drawer */}
      {previewCandidate != null && (
        <>
          {/* Backdrop — subtle blur so page context stays readable */}
          <div
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]"
            onClick={() => {
              setPreviewCandidate(null);
            }}
          />

          {/* Drawer — slides in from right */}
          <div
            className="fixed inset-y-0 end-0 z-50 flex flex-col"
            style={{ width: 'min(680px, 95vw)' }}
          >
            {/* Accent top bar */}
            <div className="h-1 w-full shrink-0 bg-primary rounded-ss-2xl" />

            {/* Card wrapper */}
            <div className="flex min-h-0 flex-1 flex-col bg-surface shadow-[−8px_0_40px_rgba(0,0,0,0.18)]">
              {/* Header */}
              <div className="flex shrink-0 items-center gap-4 border-b border-border bg-surface-muted/50 px-6 py-4">
                {/* Initials avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                  {previewCandidate.name
                    .split(' ')
                    .slice(0, 2)
                    .map((w) => w[0]?.toUpperCase() ?? '')
                    .join('')}
                </div>

                {/* Name + label */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text leading-tight">
                    {previewCandidate.name}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">Resume Preview</p>
                </div>

                {/* Close */}
                <button
                  type="button"
                  onClick={() => {
                    setPreviewCandidate(null);
                  }}
                  className="shrink-0 rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
                  title="Close"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* PDF viewer — fills remaining height */}
              <iframe
                src={`${env.API_BASE_URL}/candidate/previewResume/${previewCandidate.id}`}
                className="min-h-0 flex-1 w-full border-0 bg-[#525659]"
                title={`Resume — ${previewCandidate.name}`}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
