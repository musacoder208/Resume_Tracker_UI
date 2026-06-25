import type { JSX } from 'react';
import { SparklesIcon } from '@/icons';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n/useT';
import { ProfileProgress } from '@/features/companyProfile/profileProgress';
import { ChatHistory } from '../chatHistory';
import { ChatQuestion } from '../chatQuestion';
import { JdPreviewModal } from '../jdPreviewModal';
import type { Question, Interaction, ResolvedConflict, FieldValues } from '../types/jd.types';

interface AiJdBuilderProps {
  currentQuestion: Question | null;
  interactions: Interaction[];
  resolvedConflicts: ResolvedConflict[];
  isCompleted: boolean;
  theory: string | null;
  fieldValues: FieldValues;
  isSubmitting: boolean;
  isEditSubmitting: boolean;
  editingFieldKey: string | null;
  jdId: number | null;
  isPreviewOpen: boolean;
  totalQuestionsCount?: number;
  onSubmitAnswer: (answer: string) => void;
  onStartEdit: (fieldKey: string) => void;
  onSubmitEdit: (fieldKey: string, answer: string) => void;
  onOpenPreview: () => void;
  onClosePreview: () => void;
  onTheoryUpdated: () => void;
}

export function AiJdBuilder({
  currentQuestion,
  interactions,
  resolvedConflicts,
  isCompleted,
  theory,
  fieldValues,
  isSubmitting,
  isEditSubmitting,
  editingFieldKey,
  jdId,
  isPreviewOpen,
  totalQuestionsCount,
  onSubmitAnswer,
  onStartEdit,
  onSubmitEdit,
  onOpenPreview,
  onClosePreview,
  onTheoryUpdated,
}: AiJdBuilderProps): JSX.Element {
  const { t } = useT('jd');
  const answeredFieldKeys = new Set(interactions.map((i) => i.field_key));
  if (currentQuestion != null) answeredFieldKeys.delete(currentQuestion.field_key);
  const answeredCount = answeredFieldKeys.size;

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="mb-1 flex items-center gap-2">
        <SparklesIcon className="h-5 w-5 text-primary" />
        <h2 className="text-sm font-semibold text-text">{t('sections.aiBuilder')}</h2>
      </div>

      {totalQuestionsCount != null && totalQuestionsCount > 0 && (
        <div className="mb-4">
          <ProfileProgress
            answered={answeredCount}
            total={totalQuestionsCount}
            isCompleted={isCompleted}
          />
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* Past Q&A history */}
        <ChatHistory
          interactions={interactions}
          resolvedConflicts={resolvedConflicts}
          editingFieldKey={editingFieldKey}
          jdId={jdId}
          isSubmitting={isSubmitting || isEditSubmitting}
          onStartEdit={onStartEdit}
          onSubmitEdit={onSubmitEdit}
        />

        {/* Active question */}
        {currentQuestion != null && !isCompleted && (
          <ChatQuestion
            question={currentQuestion}
            questionNumber={new Set(interactions.map((i) => i.field_key)).size + 1}
            isSubmitting={isSubmitting}
            onSubmit={onSubmitAnswer}
          />
        )}

        {/* Preview button after completion */}
        {isCompleted && (
          <div className="flex justify-center pt-2">
            <Button variant="primary" size="md" onClick={onOpenPreview}>
              {t('actions.previewJd')}
            </Button>
          </div>
        )}
      </div>

      {/* Preview modal */}
      {isCompleted && theory != null && jdId != null && (
        <JdPreviewModal
          open={isPreviewOpen}
          theory={theory}
          jdId={jdId}
          fieldValues={fieldValues}
          onClose={onClosePreview}
          onTheoryUpdated={onTheoryUpdated}
        />
      )}
    </div>
  );
}
