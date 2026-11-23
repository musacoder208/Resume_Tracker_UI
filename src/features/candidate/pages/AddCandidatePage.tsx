import { useState, useEffect, type JSX } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/query';
import clsx from 'clsx';
import { PageContainer } from '@/components/containers/PageContainer';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n/useT';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@/icons';
import { JdSelectionPanel } from '../jdSelectionPanel';
import { ResumeUploadZone } from '../resumeUploadZone';
import { ProcessingSummaryPanel } from '../processingSummary';
import { UploadStatusTabs } from '../uploadStatusTabs';
import {
  useUploadResumesMutation,
  useGetUploadStatusQuery,
  useUpdateCandidateScoreMutation,
} from '../api/candidate.api';
import { useGetJDDropdownQuery } from '@/features/jd/api/jd.api';
import type { CandidateTab, ProcessingSummary } from '../types/candidate.types';

const EMPTY_SUMMARY: ProcessingSummary = {
  total: 0,
  success: 0,
  duplicate: 0,
  incomplete: 0,
};

const PAGE_SIZE_OPTIONS = [20, 50, 100] as const;
const DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS[0];

interface Toast {
  type: 'success' | 'error';
  message: string;
}

export function AddCandidatePage(): JSX.Element {
  const { t } = useT('candidate');
  const navigate = useNavigate();
  const location = useLocation();

  const { data: jdList = [] } = useGetJDDropdownQuery();
  const jdOptions = jdList.map((item) => ({ value: String(item.jdId), label: item.label }));

  const locationState = location.state as { jdId?: string } | null;
  const [selectedJd, setSelectedJd] = useState(locationState?.jdId ?? '');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);

  // Upload status list — server-side paginated, one tab per request.
  const [activeTab, setActiveTab] = useState<CandidateTab>('success');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  // Selected candidate ids — kept across page / page-size / tab changes so a
  // page shows the same ticks when the user comes back to it.
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  // When true, the next loaded result picks the first tab that has rows
  // (same behaviour as before pagination) — set on JD change and Refresh.
  const [autoTabPending, setAutoTabPending] = useState(true);

  const [uploadResumes, { isLoading: isUploading }] = useUploadResumesMutation();
  const [updateCandidateScore, { isLoading: isScoring }] = useUpdateCandidateScoreMutation();
  const {
    data: uploadStatusData,
    currentData: currentUploadStatus,
    isFetching: isRefreshing,
    refetch,
  } = useGetUploadStatusQuery(
    selectedJd === ''
      ? skipToken
      : { jdId: Number(selectedJd), tab: activeTab, page, pageSize }
  );

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast == null) return;
    const id = setTimeout(() => { setToast(null); }, 3000);
    return () => { clearTimeout(id); };
  }, [toast]);

  // Switch to the first tab that has results once the data for this JD has
  // loaded. Adjusting state during render (not in an effect) avoids an extra
  // render pass — see https://react.dev/learn/you-might-not-need-an-effect
  if (autoTabPending && currentUploadStatus != null) {
    setAutoTabPending(false);
    const { success, duplicate, incomplete } = currentUploadStatus.counts;
    let firstTab: CandidateTab = 'success';
    if (success === 0 && duplicate > 0) firstTab = 'duplicate';
    else if (success === 0 && duplicate === 0 && incomplete > 0) firstTab = 'incomplete';
    if (firstTab !== activeTab) {
      setActiveTab(firstTab);
      setPage(1);
    }
  }

  const canProcess = uploadedFiles.length > 0 && selectedJd !== '';

  const summary: ProcessingSummary =
    selectedJd !== '' && uploadStatusData != null ? uploadStatusData.counts : EMPTY_SUMMARY;

  function handleJdChange(value: string): void {
    setSelectedJd(value);
    setActiveTab('success');
    setPage(1);
    setSelectedIds(new Set());
    setAutoTabPending(true);
    if (value === '') setUploadedFiles([]);
  }

  // A manual tab / page choice always wins over the automatic first-tab switch.
  function handleTabChange(tab: CandidateTab): void {
    setAutoTabPending(false);
    setActiveTab(tab);
    setPage(1);
  }

  function handlePageChange(nextPage: number): void {
    setAutoTabPending(false);
    setPage(nextPage);
  }

  function handlePageSizeChange(size: number): void {
    setAutoTabPending(false);
    setPageSize(size);
    setPage(1);
  }

  async function handleProcess(): Promise<void> {
    if (!canProcess || isUploading) return;
    const positionTitle =
      jdOptions.find((o) => o.value === selectedJd)?.label ?? '';
    try {
      await uploadResumes({ positionTitle, jdId: Number(selectedJd), files: uploadedFiles }).unwrap();
      setToast({ type: 'success', message: t('actions.processSuccess') });
      setUploadedFiles([]);
    } catch {
      setToast({ type: 'error', message: t('actions.processError') });
    }
  }

  function handleRefresh(): void {
    if (selectedJd === '') {
      setToast({ type: 'error', message: t('jdSelection.required') });
      return;
    }
    setSelectedIds(new Set());
    setAutoTabPending(true);
    void refetch();
  }

  async function handleSaveAndScore(candidateIds: number[]): Promise<void> {
    if (candidateIds.length === 0) return;
    try {
      const result = await updateCandidateScore({
        jd_id: Number(selectedJd),
        candidate_ids: candidateIds,
      }).unwrap();
      if (result.success) {
        setToast({ type: 'success', message: result.message });
        // Stay on the screen so the user can continue with the next page.
        setSelectedIds(new Set());
        void refetch();
      } else {
        setToast({ type: 'error', message: result.message });
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

        {/* Two-column layout */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">

          {/* ── Left panel (30%) — sticky ────────────────────────────── */}
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
                    options={jdOptions}
                    showHint={selectedJd === ''}
                  />

                  <div className="h-px bg-border" />

                  <ResumeUploadZone
                    files={uploadedFiles}
                    onFilesChange={setUploadedFiles}
                    onLimitExceeded={() => { setToast({ type: 'error', message: t('upload.maxFilesError') }); }}
                    disabled={selectedJd === ''}
                  />

                  <div className="h-px bg-border" />

                  <ProcessingSummaryPanel summary={summary} />

                </div>
              </div>

              {/* Pinned footer */}
              <div className="shrink-0 border-t border-border p-4">
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  disabled={!canProcess || isUploading}
                  onClick={() => { void handleProcess(); }}
                >
                  {isUploading ? t('actions.processing') : t('actions.processResumes')}
                </Button>
              </div>

            </div>
          </div>

          {/* ── Right panel (70%) ────────────────────────────────────── */}
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <UploadStatusTabs
              data={selectedJd !== '' ? (uploadStatusData ?? null) : null}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              pageSize={pageSize}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              isRefreshing={isRefreshing}
              isSaving={isScoring}
              onRefresh={handleRefresh}
              onSaveAndScore={(ids) => { void handleSaveAndScore(ids); }}
            />
          </div>

        </div>
      </div>
    </PageContainer>
  );
}
