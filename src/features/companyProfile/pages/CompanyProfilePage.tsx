import { useState, useEffect, type JSX } from 'react';
import { PageContainer } from '@/components/containers/PageContainer';
import { useT } from '@/i18n/useT';
import {
  useStartProfileMutation,
  useSubmitAnswerMutation,
  useEditQuestionMutation,
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

  const [startProfile, { isLoading: isStarting }] = useStartProfileMutation();
  const [submitAnswer, { isLoading: isSubmitting }] = useSubmitAnswerMutation();
  const [editQuestion, { isLoading: isEditSubmitting }] = useEditQuestionMutation();

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [resolvedConflicts, setResolvedConflicts] = useState<ResolvedConflict[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [theory, setTheory] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingFieldKey, setEditingFieldKey] = useState<string | null>(null);
  const [startError, setStartError] = useState(false);

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
    } catch {
      setStartError(true);
    }
  }

  useEffect(() => {
    void loadProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmitAnswer(answer: string): Promise<void> {
    try {
      const data = await submitAnswer({ answer }).unwrap();
      setInteractions(data.interactions);
      setResolvedConflicts(data.resolved_conflict_ids);
      setEditingFieldKey(null);

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

  if (isStarting) {
    return (
      <PageContainer>
        <p className="text-xs text-text-muted">{t('loading.starting')}</p>
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

  return (
    <PageContainer>
      <div className="flex flex-col gap-6">
        {/* Section 1 */}
        <CompanyInformation />

        {/* Section 2 */}
        <AiProfileBuilder
          currentQuestion={currentQuestion}
          interactions={interactions}
          resolvedConflicts={resolvedConflicts}
          isCompleted={isCompleted}
          theory={theory}
          isSubmitting={isSubmitting || isEditSubmitting}
          editingFieldKey={editingFieldKey}
          isPreviewOpen={isPreviewOpen}
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
