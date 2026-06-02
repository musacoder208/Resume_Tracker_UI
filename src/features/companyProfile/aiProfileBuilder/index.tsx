import type { JSX } from 'react';
import { SparklesIcon } from '@/icons';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n/useT';
import { ChatHistory } from '../chatHistory';
import { ChatQuestion } from '../chatQuestion';
import { ProfilePreviewModal } from '../profilePreviewModal';
import type { Question, Interaction, ResolvedConflict } from '../types/companyProfile.types';

interface AiProfileBuilderProps {
  currentQuestion: Question | null;
  interactions: Interaction[];
  resolvedConflicts: ResolvedConflict[];
  isCompleted: boolean;
  theory: string | null;
  isSubmitting: boolean;
  editingFieldKey: string | null;
  isPreviewOpen: boolean;
  onSubmitAnswer: (answer: string) => void;
  onStartEdit: (fieldKey: string) => void;
  onSubmitEdit: (fieldKey: string, answer: string) => void;
  onOpenPreview: () => void;
  onClosePreview: () => void;
}

export function AiProfileBuilder({
  currentQuestion,
  interactions,
  resolvedConflicts,
  isCompleted,
  theory,
  isSubmitting,
  editingFieldKey,
  isPreviewOpen,
  onSubmitAnswer,
  onStartEdit,
  onSubmitEdit,
  onOpenPreview,
  onClosePreview,
}: AiProfileBuilderProps): JSX.Element {
  const { t } = useT('companyProfile');

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="mb-4 flex items-center gap-2">
        <SparklesIcon className="h-5 w-5 text-primary" />
        <h2 className="text-sm font-semibold text-text">{t('sections.aiBuilder')}</h2>
      </div>

      <div className="flex flex-col gap-4">
        {/* Past Q&A history */}
        <ChatHistory
          interactions={interactions}
          resolvedConflicts={resolvedConflicts}
          editingFieldKey={editingFieldKey}
          isSubmitting={isSubmitting}
          onStartEdit={onStartEdit}
          onSubmitEdit={onSubmitEdit}
        />

        {/* Active question */}
        {currentQuestion != null && !isCompleted && (
          <ChatQuestion
            question={currentQuestion}
            isSubmitting={isSubmitting}
            onSubmit={onSubmitAnswer}
          />
        )}

        {/* Preview button after completion */}
        {isCompleted && (
          <div className="flex justify-center pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                onOpenPreview();
              }}
            >
              {t('actions.previewProfile')}
            </Button>
          </div>
        )}
      </div>

      {/* Preview modal */}
      {isCompleted && theory != null && (
        <ProfilePreviewModal
          open={isPreviewOpen}
          theory={theory}
          onClose={onClosePreview}
          onEditAnswer={onClosePreview}
        />
      )}
    </div>
  );
}
