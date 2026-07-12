import { useState, useEffect, type JSX } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/containers/PageContainer';
import { Button } from '@/components/ui/button';
import { toastService } from '@/components/ui/toast/toastService';
import { useT } from '@/i18n/useT';
import { ArrowLeftIcon, PencilIcon, UsersIcon, ArrowUpTrayIcon, EyeIcon } from '@/icons';
import { JdPreviewModal } from '../jdPreviewModal';
import {
  useGetMasterDataQuery,
  useStartJdMutation,
  useSubmitJdAnswerMutation,
  useGetJdDetailsByIdQuery,
  useEditJdQaMutation,
  useGenerateWeightageMutation,
} from '../api/jd.api';
import { useGetModuleIdQuery } from '@/features/common/api/common.api';
import { JdSection } from '../jdSection';
import { AiJdBuilder } from '../aiJdBuilder';
import { EditJdModal } from '../editJdModal';
import { WeightageModal } from '../weightageModal';
import { JdDetailSkeleton } from '@/components/ui/loader';
import type {
  Question,
  Interaction,
  ResolvedConflict,
  MasterDataItem,
  FieldValues,
  WeightageJson,
  EditStep,
  EditNextQuestion,
} from '../types/jd.types';

// ── JD Detail View (when status is Completed) ────────────────────────────────

interface JdDetailViewProps {
  fieldValues: FieldValues;
  theory: string | null;
  isWeightage: boolean;
  weightageJson: WeightageJson | null;
  jdId: number;
  fieldProgress: Record<string, unknown>;
  orgDnaSnapshot: Record<string, unknown>;
  onWeightageGenerated: () => void;
  t: (key: string) => string;
}

function JdDetailView({
  fieldValues,
  theory,
  isWeightage,
  weightageJson,
  jdId,
  fieldProgress,
  orgDnaSnapshot,
  onWeightageGenerated,
  t,
}: JdDetailViewProps): JSX.Element {
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isWeightageOpen, setIsWeightageOpen] = useState(false);
  const [generateWeightage, { isLoading: isGenerating }] = useGenerateWeightageMutation();

  async function handleGenerateWeightage(): Promise<void> {
    try {
      const data = await generateWeightage({
        jd_id: jdId,
        additional_notes: additionalNotes,
        field_values: fieldValues,
        field_progress: fieldProgress,
        company_info: orgDnaSnapshot,
      }).unwrap();
      if (data.message) toastService.success(data.message);
      setIsWeightageOpen(true);
      onWeightageGenerated();
    } catch {
      // error toast handled by apiToastMiddleware
    }
  }

  const dash = t('detail.noData');
  const expMin = fieldValues.experience_years?.min;
  const expMax = fieldValues.experience_years?.max;
  const expText = expMin != null && expMax != null ? `${expMin}–${expMax} years` : dash;

  return (
    <div className="flex flex-col gap-6">
      {/* Fields + sidebar */}
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-sm font-semibold text-text">{t('detail.title')}</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DetailField label={t('detail.roleTitle')} value={fieldValues.role_title ?? dash} />
            <DetailField label={t('detail.department')} value={fieldValues.department ?? dash} />
            <DetailField label={t('detail.seniorityLevel')} value={fieldValues.seniority_level ?? dash} />
            <DetailField label={t('detail.employmentType')} value={fieldValues.employment_type ?? dash} />
            <DetailField label={t('detail.workModel')} value={fieldValues.work_model ?? dash} />
            <DetailField label={t('detail.experience')} value={expText} />
          </div>

          {Array.isArray(fieldValues.required_skills) && fieldValues.required_skills.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-medium text-text-muted">{t('detail.requiredSkills')}</p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {fieldValues.required_skills.map((skill) => (
                  <span key={skill} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(fieldValues.preferred_skills) && fieldValues.preferred_skills.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-medium text-text-muted">{t('detail.preferredSkills')}</p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {fieldValues.preferred_skills.map((skill) => (
                  <span key={skill} className="rounded-full bg-info/10 px-2.5 py-0.5 text-xs font-medium text-info">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(fieldValues.core_responsibilities) && fieldValues.core_responsibilities.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-medium text-text-muted">{t('detail.coreResponsibilities')}</p>
              <ul className="mt-1.5 list-disc ps-5 space-y-1">
                {fieldValues.core_responsibilities.map((item) => (
                  <li key={item} className="text-xs text-text">{item}</li>
                ))}
              </ul>
            </div>
          )}

          {fieldValues.final_additional_info != null && fieldValues.final_additional_info !== '' && (
            <div className="mt-5">
              <p className="text-xs font-medium text-text-muted">{t('detail.additionalInfo')}</p>
              <p className="mt-1 text-xs text-text">{fieldValues.final_additional_info}</p>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-4 lg:w-72">
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs font-semibold text-text">{t('detail.uploadResumes')}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs font-semibold text-text">{t('detail.topCandidates')}</p>
          </div>
        </div>
      </div>

      {/* Weightage section — same width as fields card above */}
      {theory != null && (
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1 rounded-xl border border-border bg-surface p-6">
            {!isWeightage ? (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-error">{t('weightage.note')}</p>
                <div className="flex items-end gap-3">
                  <textarea
                    value={additionalNotes}
                    onChange={(e) => { setAdditionalNotes(e.target.value); }}
                    rows={2}
                    placeholder={t('weightage.additionalNotesPlaceholder')}
                    className="flex-1 resize-none rounded-md border border-border bg-surface px-3 py-2 text-xs text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={isGenerating}
                    onClick={() => { void handleGenerateWeightage(); }}
                  >
                    {t('weightage.generate')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => { setIsWeightageOpen(true); }}
                >
                  {t('weightage.view')}
                </Button>
              </div>
            )}
          </div>
          <div className="hidden w-full lg:block lg:w-72 lg:flex-shrink-0" />
        </div>
      )}

      {weightageJson != null && (
        <WeightageModal
          open={isWeightageOpen}
          weightageJson={weightageJson}
          jdId={jdId}
          fieldValues={fieldValues}
          orgDnaSnapshot={orgDnaSnapshot}
          onClose={() => { setIsWeightageOpen(false); }}
          onWeightageUpdated={onWeightageGenerated}
        />
      )}
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div>
      <p className="text-xs font-medium text-text-muted">{label}</p>
      <p className="mt-0.5 text-xs text-text capitalize">{value}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function AddJdPage(): JSX.Element {
  const { t } = useT('jd');
  const navigate = useNavigate();
  const { jdId: jdIdParam } = useParams<{ jdId?: string }>();
  const urlJdId = jdIdParam != null ? Number(jdIdParam) : null;
  const isViewMode = urlJdId != null;

  // ── API hooks ───────────────────────────────────────────────────────────────
  const { data: _moduleId } = useGetModuleIdQuery('JD_MODULE');
  const { data: masterData, isLoading: isMasterDataLoading, isError: isMasterDataError } =
    useGetMasterDataQuery();
  const [startJd, { isLoading: isStarting }] = useStartJdMutation();
  const [submitJdAnswer, { isLoading: isSubmitting }] = useSubmitJdAnswerMutation();
  const [editJdQa, { isLoading: isEditSubmitting }] = useEditJdQaMutation();

  const { data: jdDetails, isLoading: isDetailsLoading, isError: isDetailsError, refetch: refetchJdDetails } =
    useGetJdDetailsByIdQuery(urlJdId!, { skip: !isViewMode, refetchOnMountOrArgChange: true });

  // ── Q&A state ───────────────────────────────────────────────────────────────
  const [selectedJobTitle, setSelectedJobTitle] = useState<MasterDataItem | null>(null);
  const [selectedSeniority, setSelectedSeniority] = useState<MasterDataItem | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [resolvedConflicts, setResolvedConflicts] = useState<ResolvedConflict[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [theory, setTheory] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [startError, setStartError] = useState(false);
  const [totalQuestionsCount, setTotalQuestionsCount] = useState<number | undefined>(undefined);

  // ── Edit state ──────────────────────────────────────────────────────────────
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentJdId, setCurrentJdId] = useState<number | null>(null);
  const [currentFieldValues, setCurrentFieldValues] = useState<FieldValues>({});
  const [currentFieldProgress, setCurrentFieldProgress] = useState<Record<string, unknown>>({});
  const [editingFieldKey, setEditingFieldKey] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editModalStep, setEditModalStep] = useState<EditStep>('collect_reason');
  const [editModalQuestion, setEditModalQuestion] = useState<EditNextQuestion | null>(null);

  // ── View mode: auto-start session if status is NOT completed ────────────────
  useEffect(() => {
    if (jdDetails == null) return;

    setCurrentJdId(jdDetails.jdId);
    setCurrentFieldValues(jdDetails.dataBlob.field_values);
    setCurrentFieldProgress(jdDetails.dataBlob.field_progress ?? {});
    if (jdDetails.totalQuestionsCount != null) setTotalQuestionsCount(jdDetails.totalQuestionsCount);

    if (jdDetails.statusName === 'Completed') return;

    void (async () => {
      try {
        setSessionStarted(true);
        const data = await startJd({ jdId: jdDetails.jdId, dataBlob: jdDetails.dataBlob }).unwrap();
        if (data.jdId != null) setCurrentJdId(data.jdId);
        if (data.field_values != null) setCurrentFieldValues(data.field_values);
        if (data.field_progress != null) setCurrentFieldProgress(data.field_progress);
        if (data.totalQuestionsCount != null) setTotalQuestionsCount(data.totalQuestionsCount);
        setCurrentQuestion(data.next_question);
        setInteractions(data.interactions);
        setResolvedConflicts(data.resolved_conflict_ids);
        setIsCompleted(data.next_question == null);
      } catch {
        setStartError(true);
        setSessionStarted(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jdDetails]);

  // ── View mode: match selected dropdowns from master data by ID ───────────────
  useEffect(() => {
    if (jdDetails == null || masterData == null) return;
    const jobTitle = masterData.jobTitles.find((j) => j.id === jdDetails.jobTitleId) ?? null;
    const seniority = masterData.seniorities.find((s) => s.id === jdDetails.seniorityId) ?? null;
    setSelectedJobTitle(jobTitle);
    setSelectedSeniority(seniority);
  }, [jdDetails, masterData]);

  // ── Create mode: auto-start when both dropdowns selected ────────────────────
  useEffect(() => {
    if (isViewMode) return;
    if (selectedJobTitle != null && selectedSeniority != null && !sessionStarted) {
      void handleStartJd();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedJobTitle, selectedSeniority]);

  async function handleStartJd(): Promise<void> {
    try {
      setSessionStarted(true);
      const data = await startJd().unwrap();
      if (data.jdId != null) setCurrentJdId(data.jdId);
      if (data.field_values != null) setCurrentFieldValues(data.field_values);
      if (data.field_progress != null) setCurrentFieldProgress(data.field_progress);
      if (data.totalQuestionsCount != null) setTotalQuestionsCount(data.totalQuestionsCount);
      setCurrentQuestion(data.next_question);
      setInteractions(data.interactions);
      setResolvedConflicts(data.resolved_conflict_ids);
      setIsCompleted(data.next_question == null);
    } catch {
      setStartError(true);
      setSessionStarted(false);
    }
  }

  async function handleSubmitAnswer(answer: string): Promise<void> {
    if (selectedJobTitle == null && !isViewMode) return;
    if (selectedSeniority == null && !isViewMode) return;

    const jobTitleId = isViewMode ? jdDetails!.jobTitleId : selectedJobTitle!.id;
    const seniorityId = isViewMode ? jdDetails!.seniorityId : selectedSeniority!.id;

    try {
      const data = await submitJdAnswer({
        ...(currentJdId != null && { jd_id: currentJdId }),
        answer,
        job_title_id: jobTitleId,
        seniority_id: seniorityId,
      }).unwrap();
      if (data.message) toastService.success(data.message);
      if (data.jdId != null) {
        if (urlJdId == null) {
          window.history.replaceState(null, '', `/jd/create/${data.jdId}`);
        }
        setCurrentJdId(data.jdId);
      }
      setInteractions(data.interactions);
      setResolvedConflicts(data.resolved_conflict_ids);
      if (data.field_values != null) setCurrentFieldValues(data.field_values);
      if (data.field_progress != null) setCurrentFieldProgress(data.field_progress);

      if (data.next_question == null) {
        setIsCompleted(true);
        setCurrentQuestion(null);
        if (data.theory != null) setTheory(data.theory);
      } else {
        setCurrentQuestion(data.next_question);
      }
    } catch {
      // error handled by apiToastMiddleware
    }
  }

  function handleStartEdit(fieldKey: string): void {
    setEditingFieldKey((prev) => (prev === fieldKey ? null : fieldKey));
  }

  async function handleSubmitEdit(fieldKey: string, answer: string): Promise<void> {
    if (currentJdId == null) return;
    try {
      const data = await editJdQa({
        jd_id: currentJdId,
        field_key: fieldKey,
        answer,
        field_values: currentFieldValues,
        field_progress: currentFieldProgress,
      }).unwrap();
      setEditingFieldKey(null);
      setEditModalStep(data.step);
      setEditModalQuestion(data.question);
      setEditModalOpen(true);
    } catch {
      // error handled by apiToastMiddleware
    }
  }

  function handleEditSuccess(): void {
    setEditModalOpen(false);
    setEditModalQuestion(null);
    void refetchJdDetails();
  }

  // ── Loading / Error states ──────────────────────────────────────────────────
  if (isViewMode && isDetailsLoading) {
    return (
      <PageContainer>
        <JdDetailSkeleton />
      </PageContainer>
    );
  }

  if (!isViewMode && isMasterDataLoading) {
    return (
      <PageContainer>
        <JdDetailSkeleton />
      </PageContainer>
    );
  }

  if (isViewMode && isDetailsError) {
    return (
      <PageContainer>
        <p className="text-xs text-error">{t('errors.fetchFailed')}</p>
      </PageContainer>
    );
  }

  if (!isViewMode && isMasterDataError) {
    return (
      <PageContainer>
        <p className="text-xs text-error">{t('errors.masterDataFailed')}</p>
      </PageContainer>
    );
  }

  if (startError) {
    return (
      <PageContainer>
        <p className="text-xs text-error">{t('errors.startFailed')}</p>
      </PageContainer>
    );
  }

  // ── Determine if JD is completed (view mode) ───────────────────────────────
  const isJdCompleted = isViewMode && jdDetails?.statusCode?.toLowerCase() !== 'draft';

  return (
    <PageContainer>
      <div className="flex flex-col gap-4">

        {/* Header with buttons */}
        <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              variant="secondary"
              size="xs"
              leadingIcon={<ArrowLeftIcon className="h-3.5 w-3.5" />}
              onClick={() => { navigate('/jd'); }}
            >
              {t('actions.back')}
            </Button>

            {isJdCompleted && (
              <>
                {isEditMode ? (
                  <Button
                    variant="primary"
                    size="xs"
                    leadingIcon={<PencilIcon className="h-3.5 w-3.5" />}
                    onClick={() => { setIsPreviewOpen(true); }}
                  >
                    {t('actions.viewJd')}
                  </Button>
                ) : (
                  <>
                    {jdDetails?.theory != null && (
                      <Button
                        variant="secondary"
                        size="xs"
                        leadingIcon={<EyeIcon className="h-3.5 w-3.5" />}
                        onClick={() => { setIsPreviewOpen(true); }}
                      >
                        {t('actions.previewJd')}
                      </Button>
                    )}
                    <Button
                      variant="primary"
                      size="xs"
                      leadingIcon={<PencilIcon className="h-3.5 w-3.5" />}
                      disabled={jdDetails?.statusCode?.toLowerCase() === 'ready'}
                      onClick={() => { setIsEditMode(true); }}
                    >
                      {t('actions.editJd')}
                    </Button>
                    <Button variant="primary" size="xs" leadingIcon={<UsersIcon className="h-3.5 w-3.5" />}>
                      {t('actions.viewCandidates')}
                    </Button>
                    <Button variant="primary" size="xs" leadingIcon={<ArrowUpTrayIcon className="h-3.5 w-3.5" />}>
                      {t('actions.uploadResumes')}
                    </Button>
                  </>
                )}
              </>
            )}

            {isViewMode && !isJdCompleted && isCompleted && (
              <Button variant="primary" size="xs" onClick={() => { setIsPreviewOpen(true); }}>
                {t('actions.previewJd')}
              </Button>
            )}
        </div>

        {/* Completed JD → detail view or edit (QA chat) */}
        {isJdCompleted && jdDetails != null && (
          isEditMode ? (
            <>
              <JdSection
                jobTitles={masterData?.jobTitles ?? []}
                seniorities={masterData?.seniorities ?? []}
                selectedJobTitle={selectedJobTitle}
                selectedSeniority={selectedSeniority}
                onJobTitleChange={setSelectedJobTitle}
                onSeniorityChange={setSelectedSeniority}
                disabled
              />
              <AiJdBuilder
                currentQuestion={null}
                interactions={jdDetails.dataBlob.interactions}
                resolvedConflicts={[]}
                isCompleted={true}
                theory={jdDetails.theory}
                fieldValues={jdDetails.dataBlob.field_values}
                isSubmitting={false}
                isEditSubmitting={isEditSubmitting}
                editingFieldKey={editingFieldKey}
                jdId={currentJdId}
                isPreviewOpen={isPreviewOpen}
                totalQuestionsCount={totalQuestionsCount}
                onSubmitAnswer={() => {}}
                onStartEdit={handleStartEdit}
                onSubmitEdit={(fieldKey, answer) => { void handleSubmitEdit(fieldKey, answer); }}
                onOpenPreview={() => { setIsPreviewOpen(true); }}
                onClosePreview={() => { setIsPreviewOpen(false); }}
                onTheoryUpdated={() => { void refetchJdDetails(); }}
              />
            </>
          ) : (
            <JdDetailView
              fieldValues={jdDetails.dataBlob.field_values}
              theory={jdDetails.theory}
              isWeightage={jdDetails.isWeightage}
              weightageJson={jdDetails.weightageJson}
              jdId={jdDetails.jdId}
              fieldProgress={jdDetails.dataBlob.field_progress ?? {}}
              orgDnaSnapshot={jdDetails.orgDnaSnapshot}
              onWeightageGenerated={() => { void refetchJdDetails(); }}
              t={t}
            />
          )
        )}

        {/* Not completed or create mode → show JD section + AI builder */}
        {!isJdCompleted && (
          <>
            <JdSection
              jobTitles={masterData?.jobTitles ?? []}
              seniorities={masterData?.seniorities ?? []}
              selectedJobTitle={selectedJobTitle}
              selectedSeniority={selectedSeniority}
              onJobTitleChange={setSelectedJobTitle}
              onSeniorityChange={setSelectedSeniority}
            />

            {sessionStarted && (
              isStarting ? (
                <p className="text-xs text-text-muted">{t('loading.starting')}</p>
              ) : (
                <AiJdBuilder
                  currentQuestion={currentQuestion}
                  interactions={interactions}
                  resolvedConflicts={resolvedConflicts}
                  isCompleted={isCompleted}
                  theory={theory}
                  fieldValues={currentFieldValues}
                  isSubmitting={isSubmitting}
                  isEditSubmitting={isEditSubmitting}
                  editingFieldKey={editingFieldKey}
                  jdId={currentJdId}
                  isPreviewOpen={isPreviewOpen}
                  totalQuestionsCount={totalQuestionsCount}
                  onSubmitAnswer={(answer) => { void handleSubmitAnswer(answer); }}
                  onStartEdit={handleStartEdit}
                  onSubmitEdit={(fieldKey, answer) => { void handleSubmitEdit(fieldKey, answer); }}
                  onOpenPreview={() => { setIsPreviewOpen(true); }}
                  onClosePreview={() => { setIsPreviewOpen(false); }}
                  onTheoryUpdated={() => { void refetchJdDetails(); }}
                />
              )
            )}
          </>
        )}
      </div>

      {/* Edit flow modal */}
      {editModalOpen && editModalQuestion != null && (
        <EditJdModal
          open={editModalOpen}
          initialStep={editModalStep}
          initialQuestion={editModalQuestion}
          onClose={() => { setEditModalOpen(false); }}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Page-level preview modal — for non-edit detail view */}
      {isJdCompleted && !isEditMode && jdDetails?.theory != null && jdDetails.jdId != null && (
        <JdPreviewModal
          open={isPreviewOpen}
          theory={jdDetails.theory}
          jdId={jdDetails.jdId}
          fieldValues={jdDetails.dataBlob.field_values}
          onClose={() => { setIsPreviewOpen(false); }}
          onTheoryUpdated={() => { void refetchJdDetails(); }}
        />
      )}
    </PageContainer>
  );
}
