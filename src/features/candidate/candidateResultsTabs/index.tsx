import { useState, useRef, useEffect, useMemo, type JSX } from 'react';
import clsx from 'clsx';
import { useT } from '@/i18n/useT';
import { Button } from '@/components/ui/button';
import { InboxArrowDownIcon, InformationCircleIcon } from '@/icons';
import { CandidateCardSkeleton } from '@/components/ui/loader';
import { CandidateCard } from '../candidateCard';
import { CandidateDetailDrawer } from '../candidateDetailDrawer';
import type {
  CandidateTab,
  SuccessCandidate,
  DuplicateCandidate,
  IncompleteCandidate,
  CandidateDrawerData,
  CandidateSavePayload,
} from '../types/candidate.types';

interface CandidateResultsTabsProps {
  activeTab: CandidateTab;
  onTabChange: (tab: CandidateTab) => void;
  successCandidates: SuccessCandidate[];
  duplicateCandidates: DuplicateCandidate[];
  incompleteCandidates: IncompleteCandidate[];
  isLoading: boolean;
  isSaving?: boolean;
  onSaveCandidates: (payload: CandidateSavePayload) => void;
  onSaveAndScore: (payload: CandidateSavePayload) => void;
}

const TABS: { key: CandidateTab; labelKey: string }[] = [
  { key: 'success',    labelKey: 'tabs.success' },
  { key: 'duplicate',  labelKey: 'tabs.duplicate' },
  { key: 'incomplete', labelKey: 'tabs.incomplete' },
];

const TAB_ACTIVE_CLASSES: Record<CandidateTab, string> = {
  success:    'border-success text-success',
  duplicate:  'border-warning text-warning',
  incomplete: 'border-error text-error',
};

const TAB_COUNT_ACTIVE_CLASSES: Record<CandidateTab, string> = {
  success:    'bg-success/10 text-success',
  duplicate:  'bg-warning/10 text-warning',
  incomplete: 'bg-error/10 text-error',
};

const SKELETON_COUNT = 5;

type AnyCandidate = SuccessCandidate | DuplicateCandidate | IncompleteCandidate;

function buildInitialSelected(
  success: SuccessCandidate[],
  duplicate: DuplicateCandidate[],
  incomplete: IncompleteCandidate[],
): Set<string> {
  const set = new Set<string>();
  ([...success, ...duplicate, ...incomplete] as AnyCandidate[]).forEach((c) => {
    if (c.isSelected) set.add(c.filename);
  });
  return set;
}

function EmptyTabState({ message, hint }: { message: string; hint: string }): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted">
        <InboxArrowDownIcon className="h-7 w-7 text-text-muted" />
      </div>
      <p className="mt-4 text-sm font-medium text-text-muted">{message}</p>
      <p className="mt-1 text-xs text-text-muted">{hint}</p>
    </div>
  );
}

export function CandidateResultsTabs({
  activeTab,
  onTabChange,
  successCandidates,
  duplicateCandidates,
  incompleteCandidates,
  isLoading,
  isSaving = false,
  onSaveCandidates,
  onSaveAndScore,
}: CandidateResultsTabsProps): JSX.Element {
  const { t } = useT('candidate');
  const [drawerData, setDrawerData] = useState<CandidateDrawerData | null>(null);

  const [selectedFilenames, setSelectedFilenames] = useState<Set<string>>(
    () => buildInitialSelected(successCandidates, duplicateCandidates, incompleteCandidates),
  );

  const selectAllRef = useRef<HTMLInputElement>(null);

  // Track filenames already processed for selection so streaming arrivals get
  // auto-selected without re-processing candidates the user explicitly toggled.
  const handledFilenamesRef = useRef<Set<string>>(
    new Set(
      [...successCandidates, ...duplicateCandidates, ...incompleteCandidates].map((c) => c.filename),
    ),
  );

  const allCandidates = useMemo(
    () => [...successCandidates, ...duplicateCandidates, ...incompleteCandidates],
    [successCandidates, duplicateCandidates, incompleteCandidates],
  );

  useEffect(() => {
    const toAdd: string[] = [];
    for (const c of allCandidates) {
      if (!handledFilenamesRef.current.has(c.filename)) {
        handledFilenamesRef.current.add(c.filename);
        if (c.isSelected) toAdd.push(c.filename);
      }
    }
    if (toAdd.length > 0) {
      setSelectedFilenames((prev) => {
        const next = new Set(prev);
        toAdd.forEach((f) => { next.add(f); });
        return next;
      });
    }
  }, [allCandidates]);

  // ── Current tab candidates ──────────────────────────────────────────────────
  const currentTabCandidates: AnyCandidate[] =
    activeTab === 'success'
      ? successCandidates
      : activeTab === 'duplicate'
      ? duplicateCandidates
      : incompleteCandidates;

  const selectedInCurrentTab = currentTabCandidates.filter((c) =>
    selectedFilenames.has(c.filename),
  ).length;
  const isAllTabSelected =
    currentTabCandidates.length > 0 && selectedInCurrentTab === currentTabCandidates.length;
  const isSomeTabSelected = selectedInCurrentTab > 0 && !isAllTabSelected;

  // Sync indeterminate state (can't be set via JSX)
  useEffect(() => {
    if (selectAllRef.current != null) {
      selectAllRef.current.indeterminate = isSomeTabSelected;
    }
  }, [isSomeTabSelected]);

  // ── Total selected across all tabs ─────────────────────────────────────────
  const totalSelected =
    successCandidates.filter((c) => selectedFilenames.has(c.filename)).length +
    duplicateCandidates.filter((c) => selectedFilenames.has(c.filename)).length +
    incompleteCandidates.filter((c) => selectedFilenames.has(c.filename)).length;

  // ── Selection handlers ──────────────────────────────────────────────────────
  function toggleCandidate(filename: string): void {
    setSelectedFilenames((prev) => {
      const next = new Set(prev);
      if (next.has(filename)) {
        next.delete(filename);
      } else {
        next.add(filename);
      }
      return next;
    });
  }

  function toggleSelectAll(): void {
    setSelectedFilenames((prev) => {
      const next = new Set(prev);
      if (isAllTabSelected) {
        currentTabCandidates.forEach((c) => { next.delete(c.filename); });
      } else {
        currentTabCandidates.forEach((c) => { next.add(c.filename); });
      }
      return next;
    });
  }

  // ── Save payload builder ────────────────────────────────────────────────────
  function buildPayload(): CandidateSavePayload {
    return {
      successCandidates: successCandidates.filter((c) => selectedFilenames.has(c.filename)),
      duplicateCandidates: duplicateCandidates.filter((c) => selectedFilenames.has(c.filename)),
      incompleteCandidates: incompleteCandidates.filter((c) => selectedFilenames.has(c.filename)),
    };
  }

  // ── Tab metadata ────────────────────────────────────────────────────────────
  const tabCountMap: Record<CandidateTab, number> = {
    success:    successCandidates.length,
    duplicate:  duplicateCandidates.length,
    incomplete: incompleteCandidates.length,
  };

  const emptyMessages: Record<CandidateTab, string> = {
    success:    t('results.emptySuccess'),
    duplicate:  t('results.emptyDuplicate'),
    incomplete: t('results.emptyIncomplete'),
  };

  // ── Row list render ─────────────────────────────────────────────────────────
  function renderTabContent(): JSX.Element {
    if (isLoading) {
      return (
        <div className="divide-y divide-border-muted">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <CandidateCardSkeleton key={i} layout="row" />
          ))}
        </div>
      );
    }

    if (activeTab === 'success') {
      if (successCandidates.length === 0) {
        return <EmptyTabState message={emptyMessages.success} hint={t('results.emptyHint')} />;
      }
      return (
        <div className="divide-y divide-border-muted">
          {successCandidates.map((c) => (
            <CandidateCard
              key={c.filename}
              variant="success"
              candidate={c}
              layout="row"
              isSelected={selectedFilenames.has(c.filename)}
              onToggle={() => { toggleCandidate(c.filename); }}
              onViewDetails={(data) => { setDrawerData(data); }}
            />
          ))}
        </div>
      );
    }

    if (activeTab === 'duplicate') {
      if (duplicateCandidates.length === 0) {
        return <EmptyTabState message={emptyMessages.duplicate} hint={t('results.emptyHint')} />;
      }
      return (
        <div className="divide-y divide-border-muted">
          {duplicateCandidates.map((c) => (
            <CandidateCard
              key={c.filename}
              variant="duplicate"
              candidate={c}
              layout="row"
              isSelected={selectedFilenames.has(c.filename)}
              onToggle={() => { toggleCandidate(c.filename); }}
              onViewDetails={(data) => { setDrawerData(data); }}
            />
          ))}
        </div>
      );
    }

    // incomplete tab
    if (incompleteCandidates.length === 0) {
      return <EmptyTabState message={emptyMessages.incomplete} hint={t('results.emptyHint')} />;
    }
    return (
      <div className="divide-y divide-border-muted">
        {incompleteCandidates.map((c) => (
          <CandidateCard
            key={c.filename}
            variant="incomplete"
            candidate={c}
            layout="row"
            isSelected={selectedFilenames.has(c.filename)}
            onToggle={() => { toggleCandidate(c.filename); }}
            onViewDetails={(data) => { setDrawerData(data); }}
          />
        ))}
      </div>
    );
  }

  const showSelectAll = !isLoading && currentTabCandidates.length > 0;

  return (
    <>
      <div className="flex flex-col rounded-xl border border-border bg-surface shadow-sm">

        {/* Tab bar */}
        <div className="flex border-b border-border px-2">
          {TABS.map(({ key, labelKey }) => {
            const isActive = activeTab === key;
            const count = tabCountMap[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => { onTabChange(key); }}
                className={clsx(
                  'relative flex items-center gap-2 border-b-2 px-5 py-4 text-xs font-semibold transition-colors',
                  isActive
                    ? TAB_ACTIVE_CLASSES[key]
                    : 'border-transparent text-text-muted hover:text-text',
                )}
              >
                {t(labelKey)}
                <span
                  className={clsx(
                    'rounded-full px-1.5 py-0.5 text-xs font-bold',
                    isActive ? TAB_COUNT_ACTIVE_CLASSES[key] : 'bg-surface-muted text-text-muted',
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Select All row — sticky, outside scroll */}
        {showSelectAll && (
          <div className="flex items-center gap-3 border-b border-border-muted bg-surface-muted/30 px-5 py-2.5">
            <input
              ref={selectAllRef}
              type="checkbox"
              checked={isAllTabSelected}
              onChange={toggleSelectAll}
              className="h-4 w-4 cursor-pointer accent-primary"
            />
            <span className="text-xs font-medium text-text-muted">
              {t('results.selectAll')}
            </span>
            {selectedInCurrentTab > 0 && (
              <span className="text-xs text-text-muted">
                · {selectedInCurrentTab} {t('results.selected')}
              </span>
            )}
          </div>
        )}

        {/* Row list */}
        <div className="min-h-[320px] overflow-y-auto px-5">
          {renderTabContent()}
        </div>

        {/* Bottom action bar */}
        <div className="flex flex-col gap-3 border-t border-border px-5 py-4">
          {/* Info banner */}
          <div className="flex items-start gap-2 rounded-lg bg-surface-muted px-3 py-2.5">
            <InformationCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
            <p className="text-xs text-text-muted">{t('results.unsavedNote')}</p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              size="sm"
              disabled={totalSelected === 0 || isLoading || isSaving}
              onClick={() => { onSaveCandidates(buildPayload()); }}
            >
              {isSaving ? t('actions.saving') : t('actions.saveCandidates')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={totalSelected === 0 || isLoading || isSaving}
              onClick={() => { onSaveAndScore(buildPayload()); }}
            >
              {t('actions.saveAndScore')}
            </Button>
          </div>
        </div>

      </div>

      <CandidateDetailDrawer
        data={drawerData}
        onClose={() => { setDrawerData(null); }}
      />
    </>
  );
}
