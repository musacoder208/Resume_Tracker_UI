import { useState, useEffect, type JSX } from 'react';
import clsx from 'clsx';
import { useT } from '@/i18n/useT';
import { Button } from '@/components/ui/button';
import { InboxArrowDownIcon, EyeIcon, XMarkIcon } from '@/icons';
import { env } from '@/config/env';
import { CandidateCardSkeleton } from '@/components/ui/loader';
import type {
  CandidateTab,
  UploadStatusCandidate,
  UploadStatusResult,
} from '../types/candidate.types';

interface UploadStatusTabsProps {
  data: UploadStatusResult | null;
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
    if (candidate.statusCode === 'ready') {
      // Always checked + green + disabled
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
        {initials}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-text">{candidate.fullName}</p>
          <span
            className={clsx(
              'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
              STATUS_BADGE_CLASSES[tab]
            )}
          >
            {candidate.uploadStatus}
          </span>
          {candidate.statusCode != null && candidate.statusCode !== '' && (
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
  isRefreshing,
  isSaving = false,
  onRefresh,
  onSaveAndScore,
}: UploadStatusTabsProps): JSX.Element {
  const { t } = useT('candidate');
  const [activeTab, setActiveTab] = useState<CandidateTab>('success');
  const [previewCandidate, setPreviewCandidate] = useState<{ id: number; name: string } | null>(
    null
  );

  // candidateIds that are checked (managed for editable rows)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // On every refresh, reset selection:
  //   - complete (ready + score_pending) → pre-selected by default
  //     (ready stays forced/disabled; score_pending stays editable — the
  //     user can uncheck individual ones, but nothing is sent unless it's
  //     both score_pending AND checked, see pendingSelectedIds below)
  //   - incomplete / duplicate           → unchecked
  useEffect(() => {
    if (data == null) return;

    const initial = new Set<number>();
    data.complete.forEach((c) => {
      initial.add(c.candidateId);
    });
    setSelectedIds(initial);

    // Auto-switch to the first tab that has results
    if (data.complete.length > 0) setActiveTab('success');
    else if (data.duplicate.length > 0) setActiveTab('duplicate');
    else setActiveTab('incomplete');
  }, [data]);

  function toggleCandidate(candidateId: number): void {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(candidateId)) next.delete(candidateId);
      else next.add(candidateId);
      return next;
    });
  }

  const tabCandidates: Record<CandidateTab, UploadStatusCandidate[]> = {
    success: data?.complete ?? [],
    duplicate: data?.duplicate ?? [],
    incomplete: data?.incomplete ?? [],
  };

  const currentList = tabCandidates[activeTab];

  // Only score_pending candidates actually need scoring — "ready" ones are
  // forced-checked (see getCheckboxConfig) so they'd otherwise still show up
  // in selectedIds, but they must never be sent to Start Scoring.
  const pendingSelectedIds = (data?.complete ?? [])
    .filter((c) => c.statusCode === 'score_pending' && selectedIds.has(c.candidateId))
    .map((c) => c.candidateId);

  // Enable "Start Scoring" only when at least one score_pending candidate
  // in the success tab is checked by the user.
  const hasSelectedPending = pendingSelectedIds.length > 0;

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

  return (
    <div className="flex flex-col rounded-xl border border-border bg-surface shadow-sm">
      {/* Tab bar + Refresh button */}
      <div className="flex items-center justify-between border-b border-border pe-3">
        <div className="flex px-2">
          {TABS.map(({ key, labelKey }) => {
            const isActive = activeTab === key;
            const count = tabCandidates[key].length;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setActiveTab(key);
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

      {/* Card list */}
      <div className="min-h-[320px] overflow-y-auto px-5">{renderContent()}</div>

      {/* Bottom action bar */}
      <div className="flex items-center justify-end border-t border-border px-5 py-4">
        <Button
          variant="primary"
          size="sm"
          disabled={!hasSelectedPending || isSaving || isRefreshing}
          onClick={() => {
            onSaveAndScore(pendingSelectedIds);
          }}
        >
          {isSaving ? t('actions.processing') : t('actions.startScoring')}
        </Button>
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
