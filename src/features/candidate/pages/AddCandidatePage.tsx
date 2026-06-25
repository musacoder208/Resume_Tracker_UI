import { useState, useEffect, useSyncExternalStore, type JSX } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { PageContainer } from '@/components/containers/PageContainer';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n/useT';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@/icons';
import { JdSelectionPanel } from '../jdSelectionPanel';
import { ResumeUploadZone } from '../resumeUploadZone';
import { ProcessingSummaryPanel } from '../processingSummary';
import { CandidateResultsTabs } from '../candidateResultsTabs';
import { useSaveCandidatesMutation, useUpdateCandidateScoreMutation } from '../api/candidate.api';
import {
  getSnapshot,
  subscribe,
  setActiveTab,
  setSelectedJd,
  clearSession,
  startStream,
} from '../utils/uploadSession';
import type {
  CandidateTab,
  ProcessingSummary,
  CandidateSavePayload,
} from '../types/candidate.types';
import type { AutocompleteOption } from '@/components/ui/autocompleteSelect';

const EMPTY_SUMMARY: ProcessingSummary = {
  total: 0,
  success: 0,
  duplicate: 0,
  incomplete: 0,
};

// Temporary — replace with RTK Query data when JD API is wired
const STUB_JD_OPTIONS: AutocompleteOption[] = [
  { value: '110', label: 'Senior Backend Dev' },
  { value: '111', label: 'Senior Frontend Dev' },
];

interface Toast {
  type: 'success' | 'error';
  message: string;
}

export function AddCandidatePage(): JSX.Element {
  const { t } = useT('candidate');
  const navigate = useNavigate();
  const location = useLocation();
  const [saveCandidates, { isLoading: isSaving }] = useSaveCandidatesMutation();
  const [updateCandidateScore, { isLoading: isScoring }] = useUpdateCandidateScoreMutation();

  // ── Singleton stream state ─────────────────────────────────────────────────
  const session = useSyncExternalStore(subscribe, getSnapshot);

  // ── Local-only state (not persisted across navigation) ────────────────────
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);
  const [shouldNavigate, setShouldNavigate] = useState(false);

  // On mount: if navigated from JD landing with a specific JD, honour it
  useEffect(() => {
    const jdFromRoute =
      (location.state as { jdId?: string } | null)?.jdId ?? '';
    if (jdFromRoute !== '') {
      setSelectedJd(jdFromRoute);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast == null) return;
    const id = setTimeout(() => { setToast(null); }, 3000);
    return () => { clearTimeout(id); };
  }, [toast]);

  // Navigate to /candidate 2 seconds after successful save
  useEffect(() => {
    if (!shouldNavigate) return;
    const id = setTimeout(() => { void navigate('/candidate'); }, 2000);
    return () => { clearTimeout(id); };
  }, [shouldNavigate, navigate]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const canProcess = uploadedFiles.length > 0 && session.selectedJd !== '';

  const summary: ProcessingSummary =
    session.uploadResult != null
      ? {
          total:
            session.uploadResult.successCandidates.length +
            session.uploadResult.duplicateCandidates.length +
            session.uploadResult.incompleteCandidates.length,
          success: session.uploadResult.successCandidates.length,
          duplicate: session.uploadResult.duplicateCandidates.length,
          incomplete: session.uploadResult.incompleteCandidates.length,
        }
      : EMPTY_SUMMARY;

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handleJdChange(value: string): void {
    setSelectedJd(value);
    if (value === '') {
      setUploadedFiles([]);
      clearSession();
    }
  }

  function handleProcess(): void {
    if (!canProcess || session.isStreaming) return;
    const positionTitle =
      STUB_JD_OPTIONS.find((o) => o.value === session.selectedJd)?.label ?? '';
    startStream({
      positionTitle,
      jdId: Number(session.selectedJd),
      files: uploadedFiles,
    });
  }

  function buildRawCandidates(payload: CandidateSavePayload) {
    if (session.uploadResult == null) return null;
    const selectedFilenames = new Set<string>([
      ...payload.successCandidates.map((c) => c.filename),
      ...payload.duplicateCandidates.map((c) => c.filename),
      ...payload.incompleteCandidates.map((c) => c.filename),
    ]);
    return [
      ...session.uploadResult.rawItems.successExtraction,
      ...session.uploadResult.rawItems.duplicate,
      ...session.uploadResult.rawItems.incomplete,
    ]
      .filter((item) => selectedFilenames.has(item.filename))
      .map((item) => ({ ...item, isSelected: true }));
  }

  async function handleSaveCandidates(payload: CandidateSavePayload): Promise<void> {
    const candidates = buildRawCandidates(payload);
    if (candidates == null) return;
    try {
      const result = await saveCandidates({
        jd_id: Number(session.selectedJd),
        candidates,
      }).unwrap();
      if (result.success) {
        setToast({ type: 'success', message: result.message });
        setShouldNavigate(true);
      } else {
        setToast({ type: 'error', message: result.message });
      }
    } catch {
      setToast({ type: 'error', message: t('actions.saveError') });
    }
  }

  async function handleSaveAndScore(payload: CandidateSavePayload): Promise<void> {
    const candidates = buildRawCandidates(payload);
    if (candidates == null) return;

    let candidateIds: number[] | null = null;
    try {
      const saveResult = await saveCandidates({
        jd_id: Number(session.selectedJd),
        candidates,
      }).unwrap();
      if (saveResult.success) {
        setToast({ type: 'success', message: saveResult.message });
        candidateIds = saveResult.data.candidate_ids.map(Number);
      } else {
        setToast({ type: 'error', message: saveResult.message });
      }
    } catch {
      setToast({ type: 'error', message: t('actions.saveError') });
    }

    if (candidateIds == null) return;

    try {
      const scoreResult = await updateCandidateScore({
        jd_id: Number(session.selectedJd),
        candidate_ids: candidateIds,
      }).unwrap();
      if (scoreResult.success) {
        setToast({ type: 'success', message: scoreResult.message });
        setShouldNavigate(true);
      } else {
        setToast({ type: 'error', message: scoreResult.message });
      }
    } catch {
      setToast({ type: 'error', message: t('actions.scoreError') });
    }
  }

  function handleBack(): void {
    // Stream continues in background; component simply unmounts
    navigate(-1);
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageContainer>
      {/* Fixed toast notification */}
      {toast != null && (
        <div
          className={clsx(
            'fixed end-4 top-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg',
            toast.type === 'success' ? 'bg-success text-white' : 'bg-error text-white',
          )}
        >
          {toast.type === 'success' ? (
            <CheckCircleIcon className="h-5 w-5 shrink-0" />
          ) : (
            <XCircleIcon className="h-5 w-5 shrink-0" />
          )}
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}

      <div className="flex flex-col gap-5">

        {/* Page header */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-text">{t('page.uploadTitle')}</h1>
          <Button
            variant="secondary"
            size="xs"
            leadingIcon={<ArrowLeftIcon className="h-3.5 w-3.5" />}
            onClick={handleBack}
          >
            {t('details.header.backToCandidates')}
          </Button>
        </div>

        {/* Error banner — shown when stream fails (survives navigation, resets on refresh) */}
        {session.hasFailed && (
          <div className="rounded-lg border border-error/30 bg-error-subtle/30 px-4 py-3 text-sm text-error">
            {t('actions.processError')}
          </div>
        )}

        {/* Two-column layout */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">

          {/* ── Left panel (30%) — sticky with pinned Process button ─────── */}
          <div className="w-full lg:w-[30%] lg:max-w-xs lg:shrink-0 lg:sticky lg:top-0 lg:self-start">
            <div
              className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm"
              style={{ maxHeight: 'calc(100vh - var(--layout-header-height) - 4rem)' }}
            >
              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-5">
                <div className="flex flex-col gap-5">

                  <JdSelectionPanel
                    value={session.selectedJd}
                    onChange={handleJdChange}
                    options={STUB_JD_OPTIONS}
                    showHint={session.selectedJd === ''}
                  />

                  <div className="h-px bg-border" />

                  <ResumeUploadZone
                    files={uploadedFiles}
                    onFilesChange={setUploadedFiles}
                    disabled={session.selectedJd === ''}
                  />

                  <div className="h-px bg-border" />

                  <ProcessingSummaryPanel summary={summary} />

                </div>
              </div>

              {/* Pinned footer — always visible */}
              <div className="shrink-0 border-t border-border p-4">
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  disabled={!canProcess || session.isStreaming}
                  onClick={handleProcess}
                >
                  {session.isStreaming ? t('actions.processing') : t('actions.processResumes')}
                </Button>
              </div>

            </div>
          </div>

          {/* ── Right panel (70%) ────────────────────────────────────────── */}
          <div className="flex min-w-0 flex-1 flex-col gap-3">

            {/* Streaming indicator */}
            {session.isStreaming && (
              <div className="flex items-center gap-2.5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-primary" />
                <p className="text-sm text-primary">{t('actions.streaming')}</p>
              </div>
            )}

            <CandidateResultsTabs
              key={session.streamId}
              activeTab={session.activeTab}
              onTabChange={(tab: CandidateTab) => { setActiveTab(tab); }}
              successCandidates={session.uploadResult?.successCandidates ?? []}
              duplicateCandidates={session.uploadResult?.duplicateCandidates ?? []}
              incompleteCandidates={session.uploadResult?.incompleteCandidates ?? []}
              isLoading={session.isStreaming && session.uploadResult == null}
              isSaving={isSaving || isScoring}
              onSaveCandidates={(payload) => { void handleSaveCandidates(payload); }}
              onSaveAndScore={(payload) => { void handleSaveAndScore(payload); }}
            />

          </div>

        </div>
      </div>
    </PageContainer>
  );
}
