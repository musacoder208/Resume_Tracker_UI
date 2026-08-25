import { useState, useEffect, type JSX } from 'react';
import { BaseModal } from '@/components/modals/BaseModal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea/Textarea';
import { Radio } from '@/components/ui/radio/Radio';
import { Checkbox } from '@/components/ui/checkbox/Checkbox';
import { PaperAirplaneIcon, ExclamationTriangleIcon } from '@/icons';
import { useT } from '@/i18n/useT';
import { useToast } from '@/hooks/useToast';
import { useUpdateJdAnswerMutation } from '../api/jd.api';
import type { EditNextQuestion, EditStep } from '../types/jd.types';

interface EditJdModalProps {
  open: boolean;
  initialStep: EditStep;
  initialQuestion: EditNextQuestion;
  onClose: () => void;
  onSuccess: () => void;
}

interface AnswerInputProps {
  question: EditNextQuestion;
  isSubmitting: boolean;
  onSubmit: (answer: string) => void;
}

function AnswerInput({ question, isSubmitting, onSubmit }: AnswerInputProps): JSX.Element {
  const { t } = useT('jd');
  const [textValue, setTextValue] = useState('');
  const [selectedSingle, setSelectedSingle] = useState('');
  const [selectedMulti, setSelectedMulti] = useState<string[]>([]);

  useEffect(() => {
    setTextValue('');
    setSelectedSingle('');
    setSelectedMulti([]);
  }, [question.field_key, question.text]);

  const answerType = question.answer_type ?? 'FREE_TEXT';
  const allowedValues = question.allowed_values ?? [];

  const hasAnswer = (() => {
    if (answerType === 'FREE_TEXT') return textValue.trim().length > 0;
    if (answerType === 'SINGLE_ENUM') return selectedSingle !== '';
    return selectedMulti.length > 0;
  })();

  function handleSubmit(): void {
    if (!hasAnswer) return;
    if (answerType === 'FREE_TEXT') onSubmit(textValue.trim());
    else if (answerType === 'SINGLE_ENUM') onSubmit(selectedSingle);
    else onSubmit(selectedMulti.join(','));
  }

  function toggleMulti(value: string): void {
    setSelectedMulti((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  const allSelected = allowedValues.length > 0 && selectedMulti.length === allowedValues.length;

  return (
    <div className="flex flex-col gap-3">
      {answerType === 'FREE_TEXT' && (
        <Textarea
          value={textValue}
          onChange={(e) => { setTextValue(e.target.value); }}
          rows={3}
          disabled={isSubmitting}
          className="text-xs"
        />
      )}

      {answerType === 'SINGLE_ENUM' && allowedValues.length > 0 && (
        <div className="flex flex-col gap-2">
          {allowedValues.map((val) => (
            <Radio
              key={val}
              label={val}
              value={val}
              name={`edit-modal-${question.field_key}`}
              checked={selectedSingle === val}
              onChange={() => { setSelectedSingle(val); }}
              disabled={isSubmitting}
            />
          ))}
        </div>
      )}

      {answerType === 'MULTI_SELECT' && allowedValues.length > 0 && (
        <div className="flex flex-col gap-2">
          <Checkbox
            label={t('actions.selectAll')}
            checked={allSelected}
            onChange={(e) => { setSelectedMulti(e.target.checked ? allowedValues : []); }}
            disabled={isSubmitting}
          />
          <hr className="border-border" />
          {allowedValues.map((val) => (
            <Checkbox
              key={val}
              label={val}
              checked={selectedMulti.includes(val)}
              onChange={() => { toggleMulti(val); }}
              disabled={isSubmitting}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        {question.can_be_skipped === true && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => { onSubmit('skip'); }}
            disabled={isSubmitting}
          >
            {t('actions.skip')}
          </Button>
        )}
        {hasAnswer && (
          <Button
            variant="primary"
            size="sm"
            leadingIcon={<PaperAirplaneIcon className="h-4 w-4" />}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {t('actions.submit')}
          </Button>
        )}
      </div>
    </div>
  );
}

export function EditJdModal({
  open,
  initialStep,
  initialQuestion,
  onClose,
  onSuccess,
}: EditJdModalProps): JSX.Element {
  const { t } = useT('jd');
  const { showToast } = useToast();

  const [updateJdAnswer, { isLoading: isSubmitting }] = useUpdateJdAnswerMutation();

  const [currentStep, setCurrentStep] = useState<EditStep>(initialStep);
  const [currentQuestion, setCurrentQuestion] = useState<EditNextQuestion>(initialQuestion);

  useEffect(() => {
    if (open) {
      setCurrentStep(initialStep);
      setCurrentQuestion(initialQuestion);
    }
  }, [open, initialStep, initialQuestion]);

  async function handleAnswerSubmit(answer: string): Promise<void> {
    try {
      const data = await updateJdAnswer({ answer }).unwrap();

      if (data.cancelled === true) {
        onClose();
      } else if (data.step != null && data.question != null) {
        setCurrentStep(data.step);
        setCurrentQuestion(data.question);
      } else {
        showToast('success', t('edit.successTitle'), data.message);
        onSuccess();
      }
    } catch {
      // error handled by apiToastMiddleware
    }
  }

  async function handleFinalConfirm(answer: 'confirm' | 'cancel'): Promise<void> {
    if (answer === 'cancel') {
      onClose();
      return;
    }

    try {
      const data = await updateJdAnswer({ answer }).unwrap();

      if (data.cancelled === true) {
        onClose();
      } else {
        showToast('success', t('edit.successTitle'), data.message);
        onSuccess();
      }
    } catch {
      // error handled by apiToastMiddleware
    }
  }

  return (
    <BaseModal
      open={open}
      title={t('edit.modalTitle')}
      onClose={onClose}
      size="2xl"
      panelClassName="min-h-96"
      disableBackdropClose
    >
      <div className="flex flex-col gap-4">
        {currentStep !== 'final_confirm' && (
          <>
            <p className="text-xs text-text">{currentQuestion.text}</p>
            <AnswerInput
              question={currentQuestion}
              isSubmitting={isSubmitting}
              onSubmit={(answer) => { void handleAnswerSubmit(answer); }}
            />
          </>
        )}

        {currentStep === 'final_confirm' && (
          <div className="rounded-xl border border-warning/40 bg-warning/5 p-5">
            <div className="mb-4 flex items-start gap-3">
              <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              <p className="text-sm font-medium text-text">{t('edit.confirmMessage')}</p>
            </div>
            <hr className="mb-4 border-warning/20" />
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { void handleFinalConfirm('cancel'); }}
                disabled={isSubmitting}
              >
                {t('edit.cancel')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => { void handleFinalConfirm('confirm'); }}
                disabled={isSubmitting}
              >
                {t('edit.confirm')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  );
}
