import { useState, type JSX } from 'react';
import { SparklesIcon, WavingHandIcon } from '@/icons';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n/useT';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer/MarkdownRenderer';
import { ChatHistory } from '../chatHistory';
import { ChatQuestion } from '../chatQuestion';
import { ProfilePreviewModal } from '../profilePreviewModal';
import { ProfileProgress } from '../profileProgress';
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
  answeredCount: number;
  totalQuestionsCount: number;
  canCreate: boolean;
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
  answeredCount,
  totalQuestionsCount,
  canCreate,
  onSubmitAnswer,
  onStartEdit,
  onSubmitEdit,
  onOpenPreview,
  onClosePreview,
}: AiProfileBuilderProps): JSX.Element {
  const { t } = useT('companyProfile');
  const [showHistory, setShowHistory] = useState(false);

  const showTheoryView = isCompleted && theory != null && !showHistory;
  const showHistoryView = canCreate && (!isCompleted || showHistory);

  return (
    <div className="flex flex-col flex-1 min-h-0 rounded-xl border border-border bg-surface">
      {/* Locked header — hidden in theory view */}
      {!showTheoryView && (
        <div className="shrink-0 px-6 pt-4 pb-3">
          <div className="mb-4 flex items-center gap-2">
            {/* Alternating hand wave → sparkle icon */}
            <div className="relative h-5 w-5 shrink-0">
              <span className="animate-wave-hand absolute inset-0 flex items-center justify-center">
                <WavingHandIcon className="h-5 w-5 text-primary" />
              </span>
              <span className="animate-sparkle-icon absolute inset-0 flex items-center justify-center">
                <SparklesIcon className="h-5 w-5 text-primary" />
              </span>
            </div>
            <h2 className="text-sm font-semibold text-text">{t('sections.aiBuilder')}</h2>
          </div>
          {totalQuestionsCount > 0 && (
            <ProfileProgress
              answered={answeredCount}
              total={totalQuestionsCount}
              isCompleted={isCompleted}
            />
          )}
        </div>
      )}

      {/* Scrollable content */}
      <div className={['flex-1 min-h-0 overflow-y-auto px-6 pb-6', showTheoryView ? 'pt-6' : ''].join(' ')}>

        {/* ── No permission + not completed ── */}
        {!canCreate && !isCompleted && (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <p className="text-sm font-semibold text-text">{t('noPermission.notCreated')}</p>
            <p className="text-xs text-text-muted">{t('noPermission.contactAdmin')}</p>
          </div>
        )}

        {/* ── Theory view (profile complete) ── */}
        {showTheoryView && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              {canCreate && (
                <Button variant="secondary" size="sm" onClick={() => { setShowHistory(true); }}>
                  {t('actions.editAnswers')}
                </Button>
              )}
              <Button variant="primary" size="sm" onClick={onOpenPreview}>
                {t('actions.previewProfile')}
              </Button>
            </div>
            <MarkdownRenderer content={theory} />
          </div>
        )}

        {/* ── Q&A / history view (create permission only) ── */}
        {showHistoryView && (
          <div className="flex flex-col gap-4">
            {isCompleted && (
              <div className="flex justify-end">
                <Button variant="secondary" size="sm" onClick={() => { setShowHistory(false); }}>
                  {t('actions.viewProfile')}
                </Button>
              </div>
            )}

            <ChatHistory
              interactions={interactions}
              resolvedConflicts={resolvedConflicts}
              editingFieldKey={editingFieldKey}
              isSubmitting={isSubmitting}
              onStartEdit={onStartEdit}
              onSubmitEdit={onSubmitEdit}
            />

            {currentQuestion != null && !isCompleted && (
              <ChatQuestion
                question={currentQuestion}
                questionNumber={new Set(interactions.map((i) => i.field_key)).size + 1}
                isSubmitting={isSubmitting}
                onSubmit={onSubmitAnswer}
              />
            )}
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
