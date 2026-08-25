import { useState, useEffect, useRef, type JSX } from 'react';
import { useSelector } from 'react-redux';
import { PageContainer } from '@/components/containers/PageContainer';
import { toastService } from '@/components/ui/toast/toastService';
import { useT } from '@/i18n/useT';
import { selectPageAccess } from '@/features/auth/redux/auth.selectors';
import {
  useStartProfileMutation,
  useSubmitAnswerMutation,
  useEditQuestionMutation,
  useGetProfileDetailsQuery,
} from '../api/companyProfile.api';
import { CompanyInformation } from '../companyInformation';
import { AiProfileBuilder } from '../aiProfileBuilder';
import { EditQuestionModal } from '../editQuestionModal';
import type {
  Question,
  Interaction,
  ResolvedConflict,
  EditNextQuestion,
  EditStep,
} from '../types/companyProfile.types';

export function CompanyProfilePage(): JSX.Element {
  const { t } = useT('companyProfile');

  const pageAccess = useSelector(selectPageAccess);
  const canCreate = pageAccess
    .find((p) => p.route === '/company-profile')
    ?.permissions.includes('create') ?? false;

  const [startProfile, { isLoading: isStarting }] = useStartProfileMutation();
  const [submitAnswer, { isLoading: isSubmitting }] = useSubmitAnswerMutation();
  const [editQuestion, { isLoading: isEditSubmitting }] = useEditQuestionMutation();

  // View-only users call GET /details instead of POST /start
  const {
    data: profileDetails,
    isLoading: isDetailsLoading,
    isError: isDetailsError,
  } = useGetProfileDetailsQuery(undefined, { skip: canCreate });

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [resolvedConflicts, setResolvedConflicts] = useState<ResolvedConflict[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [theory, setTheory] = useState<string | null>(null);
  const [totalQuestionsCount, setTotalQuestionsCount] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingFieldKey, setEditingFieldKey] = useState<string | null>(null);
  const [startError, setStartError] = useState(false);
  const isInitialLoad = useRef(true);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editModalStep, setEditModalStep] = useState<EditStep>('collect_reason');
  const [editModalQuestion, setEditModalQuestion] = useState<EditNextQuestion | null>(null);

  async function loadProfile(): Promise<void> {
    try {
      const data = await startProfile().unwrap();
      setCurrentQuestion(data.next_question);
      setInteractions(data.interactions);
      setResolvedConflicts(data.resolved_conflict_ids);
      setTheory(data.theory);
      setIsCompleted(data.next_question == null && data.interactions.length > 0);
      if (data.total_questions_count > 0) setTotalQuestionsCount(data.total_questions_count);
    } catch {
      if (isInitialLoad.current) setStartError(true);
    } finally {
      isInitialLoad.current = false;
    }
  }

  useEffect(() => {
    if (canCreate) void loadProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmitAnswer(answer: string): Promise<void> {
    try {
      const data = await submitAnswer({ answer }).unwrap();
      setInteractions(data.interactions);
      setResolvedConflicts(data.resolved_conflict_ids);
      setEditingFieldKey(null);

      if (data.message) toastService.success(data.message);

      if (data.next_question == null) {
        // Show button immediately, then reload to get full interactions (data_blob absent on completion)
        setIsCompleted(true);
        setCurrentQuestion(null);
        if (data.theory != null) setTheory(data.theory);
        void loadProfile();
      } else {
        setCurrentQuestion(data.next_question);
      }
    } catch {
      // error handled by apiToastMiddleware
    }
  }

  async function handleSubmitEdit(fieldKey: string, answer: string): Promise<void> {
    try {
      const data = await editQuestion({ field_key: fieldKey, answer }).unwrap();
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
    void loadProfile();
  }

  function handleStartEdit(fieldKey: string): void {
    setEditingFieldKey((prev) => (prev === fieldKey ? null : fieldKey));
  }

  if (canCreate ? (isStarting && isInitialLoad.current) : isDetailsLoading) {
    return (
      <PageContainer>
        <p className="text-xs text-text-muted">{t('loading.starting')}</p>
      </PageContainer>
    );
  }

  if (canCreate ? startError : isDetailsError) {
    return (
      <PageContainer>
        <p className="text-xs text-error">{t('errors.startFailed')}</p>
      </PageContainer>
    );
  }

  // For view-only users derive state from the details query
  const effectiveTheory = canCreate ? theory : (profileDetails?.theory ?? null);
  const effectiveIsCompleted = canCreate ? isCompleted : (profileDetails?.theory != null);

  const answeredFieldKeys = new Set(interactions.map((i) => i.field_key));
  if (currentQuestion?.mode === 'clarification' || currentQuestion?.mode === 'crossfield') {
    answeredFieldKeys.delete(currentQuestion.field_key);
  }
  const answeredCount = answeredFieldKeys.size;

  return (
    <PageContainer className="h-full flex flex-col !pt-0">
      <div className="flex flex-col gap-3 flex-1 min-h-0">
        {/* Section 1 */}
        <div className="shrink-0">
          <CompanyInformation />
        </div>

        {/* Section 2 */}
        <AiProfileBuilder
          currentQuestion={currentQuestion}
          interactions={interactions}
          resolvedConflicts={resolvedConflicts}
          isCompleted={effectiveIsCompleted}
          theory={effectiveTheory}
          isSubmitting={isSubmitting || isEditSubmitting}
          editingFieldKey={editingFieldKey}
          isPreviewOpen={isPreviewOpen}
          answeredCount={answeredCount}
          totalQuestionsCount={totalQuestionsCount}
          canCreate={canCreate}
          onSubmitAnswer={(answer) => { void handleSubmitAnswer(answer); }}
          onStartEdit={handleStartEdit}
          onSubmitEdit={(fieldKey, answer) => { void handleSubmitEdit(fieldKey, answer); }}
          onOpenPreview={() => { setIsPreviewOpen(true); }}
          onClosePreview={() => { setIsPreviewOpen(false); }}
        />
      </div>

      {/* Edit flow modal */}
      {editModalOpen && editModalQuestion != null && (
        <EditQuestionModal
          open={editModalOpen}
          initialStep={editModalStep}
          initialQuestion={editModalQuestion}
          onClose={() => { setEditModalOpen(false); }}
          onSuccess={handleEditSuccess}
        />
      )}
    </PageContainer>
  );
}
