import { useState, useEffect, type JSX } from 'react';
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
import { useUploadResumesMutation, useSaveCandidatesMutation, useUpdateCandidateScoreMutation } from '../api/candidate.api';
import { useGetModuleIdQuery } from '@/features/common/api/common.api';
import type {
  CandidateTab,
  ProcessingSummary,
  UploadResumesResult,
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
  const [uploadResumes, { isLoading: isProcessing }] = useUploadResumesMutation();
  const [saveCandidates, { isLoading: isSaving }] = useSaveCandidatesMutation();
  const [updateCandidateScore, { isLoading: isScoring }] = useUpdateCandidateScoreMutation();

  const { data: moduleId } = useGetModuleIdQuery('CAND_MGT');
  const initialJdId = (location.state as { jdId?: string } | null)?.jdId ?? '';
  const [selectedJd, setSelectedJd] = useState(initialJdId);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<CandidateTab>('success');
  const [uploadResult, setUploadResult] = useState<UploadResumesResult | null>(null);
  const [processError, setProcessError] = useState<string | null>(null);
  const [resultKey, setResultKey] = useState(0);
  const [toast, setToast] = useState<Toast | null>(null);
  const [shouldNavigate, setShouldNavigate] = useState(false);

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

  const canProcess = uploadedFiles.length > 0;

  const summary: ProcessingSummary = uploadResult != null
    ? {
        total:
          uploadResult.successCandidates.length +
          uploadResult.duplicateCandidates.length +
          uploadResult.incompleteCandidates.length,
        success: uploadResult.successCandidates.length,
        duplicate: uploadResult.duplicateCandidates.length,
        incomplete: uploadResult.incompleteCandidates.length,
      }
    : EMPTY_SUMMARY;

  function handleJdChange(value: string): void {
    setSelectedJd(value);
    if (value === '') {
      setUploadedFiles([]);
      setUploadResult(null);
      setProcessError(null);
    }
  }

  async function handleProcess(): Promise<void> {
    if (!canProcess) return;
    const positionTitle = STUB_JD_OPTIONS.find((o) => o.value === selectedJd)?.label ?? '';
    setProcessError(null);
    try {
      const result = await uploadResumes({ positionTitle, files: uploadedFiles }).unwrap();
      setUploadResult(result);
      setResultKey((k) => k + 1);
      if (result.successCandidates.length > 0) {
        setActiveTab('success');
      } else if (result.duplicateCandidates.length > 0) {
        setActiveTab('duplicate');
      } else {
        setActiveTab('incomplete');
      }
    } catch {
      setProcessError(t('actions.processError'));
    }
  }

  function buildRawCandidates(payload: CandidateSavePayload) {
    if (uploadResult == null) return null;
    const selectedFilenames = new Set<string>([
      ...payload.successCandidates.map((c) => c.filename),
      ...payload.duplicateCandidates.map((c) => c.filename),
      ...payload.incompleteCandidates.map((c) => c.filename),
    ]);
    return [
      ...uploadResult.rawItems.successExtraction,
      ...uploadResult.rawItems.duplicate,
      ...uploadResult.rawItems.incomplete,
    ]
      .filter((item) => selectedFilenames.has(item.filename))
      .map((item) => ({ ...item, isSelected: true }));
  }

  async function handleSaveCandidates(payload: CandidateSavePayload): Promise<void> {
    const candidates = buildRawCandidates(payload);
    if (candidates == null) return;
    try {
      const result = await saveCandidates({ jd_id: Number(selectedJd), candidates }).unwrap();
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

    // Step 1 — save candidates
    let candidateIds: number[] | null = null;
    try {
      const saveResult = await saveCandidates({ jd_id: Number(selectedJd), candidates }).unwrap();
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

    // Step 2 — trigger scoring for the newly saved candidates only
    try {
      const scoreResult = await updateCandidateScore({
        jd_id: Number(selectedJd),
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
    navigate(-1);
  }

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
          {toast.type === 'success'
            ? <CheckCircleIcon className="h-5 w-5 shrink-0" />
            : <XCircleIcon className="h-5 w-5 shrink-0" />
          }
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

        {/* Error banner */}
        {processError != null && (
          <div className="rounded-lg border border-error/30 bg-error-subtle/30 px-4 py-3 text-sm text-error">
            {processError}
          </div>
        )}

        {/* Two-column layout */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">

          {/* ── Left panel (30%) — sticky with pinned Process button ───── */}
          <div className="w-full lg:w-[30%] lg:max-w-xs lg:shrink-0 lg:sticky lg:top-0 lg:self-start">
            <div
              className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm"
              style={{ maxHeight: 'calc(100vh - var(--layout-header-height) - 4rem)' }}
            >
              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-5">
                <div className="flex flex-col gap-5">

                  <JdSelectionPanel
                    value={selectedJd}
                    onChange={handleJdChange}
                    options={STUB_JD_OPTIONS}
                    showHint={selectedJd === ''}
                  />

                  <div className="h-px bg-border" />

                  <ResumeUploadZone
                    files={uploadedFiles}
                    onFilesChange={setUploadedFiles}
                    disabled={selectedJd === ''}
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
                  disabled={!canProcess || isProcessing}
                  onClick={() => { void handleProcess(); }}
                >
                  {isProcessing ? t('actions.processing') : t('actions.processResumes')}
                </Button>
              </div>

            </div>
          </div>

          {/* ── Right panel (70%) ──────────────────────────────────────── */}
          <div className="min-w-0 flex-1">
            <CandidateResultsTabs
              key={resultKey}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              successCandidates={uploadResult?.successCandidates ?? []}
              duplicateCandidates={uploadResult?.duplicateCandidates ?? []}
              incompleteCandidates={uploadResult?.incompleteCandidates ?? []}
              isLoading={isProcessing}
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
