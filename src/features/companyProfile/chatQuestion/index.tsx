import { useState, useEffect, type JSX } from 'react';
import clsx from 'clsx';
import { Textarea } from '@/components/ui/textarea/Textarea';
import { Radio } from '@/components/ui/radio/Radio';
import { Checkbox } from '@/components/ui/checkbox/Checkbox';
import { Button } from '@/components/ui/button';
import { PaperAirplaneIcon } from '@/icons';
import { useT } from '@/i18n/useT';
import type { Question, QuestionMode } from '../types/companyProfile.types';

interface ChatQuestionProps {
  question: Question;
  isSubmitting: boolean;
  onSubmit: (answer: string) => void;
}

const modeBadgeClasses: Record<QuestionMode, string> = {
  initial: 'bg-info/10 text-info',
  clarification: 'bg-warning/10 text-warning',
  crossfield: 'bg-primary/10 text-primary',
};

export function ChatQuestion({ question, isSubmitting, onSubmit }: ChatQuestionProps): JSX.Element {
  const { t } = useT('companyProfile');
  const [textValue, setTextValue] = useState('');
  const [selectedSingle, setSelectedSingle] = useState('');
  const [selectedMulti, setSelectedMulti] = useState<string[]>([]);

  // Reset answer state whenever the question changes
  useEffect(() => {
    setTextValue('');
    setSelectedSingle('');
    setSelectedMulti([]);
  }, [question.question_id]);

  const hasAnswer = (() => {
    if (question.answer_type === 'FREE_TEXT') return textValue.trim().length > 0;
    if (question.answer_type === 'SINGLE_ENUM') return selectedSingle !== '';
    return selectedMulti.length > 0;
  })();

  function handleSubmit(): void {
    if (!hasAnswer) return;
    if (question.answer_type === 'FREE_TEXT') onSubmit(textValue.trim());
    else if (question.answer_type === 'SINGLE_ENUM') onSubmit(selectedSingle);
    else onSubmit(selectedMulti.join(','));
  }

  function handleSkip(): void {
    onSubmit('skip');
  }

  function toggleMulti(value: string): void {
    setSelectedMulti((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  function handleSelectAll(checked: boolean): void {
    setSelectedMulti(checked ? (question.allowed_values ?? []) : []);
  }

  const allSelected =
    question.allowed_values != null &&
    question.allowed_values.length > 0 &&
    selectedMulti.length === question.allowed_values.length;

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      {/* Mode badge + question text */}
      <div className="mb-3 flex flex-wrap items-start gap-2">
        <span
          className={clsx(
            'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
            modeBadgeClasses[question.mode]
          )}
        >
          {t(`modes.${question.mode}`)}
        </span>
        <p className="flex-1 text-xs font-medium text-text">{question.text}</p>
      </div>

      {/* Answer input */}
      <div className="mb-3">
        {question.answer_type === 'FREE_TEXT' && (
          <Textarea
            value={textValue}
            onChange={(e) => { setTextValue(e.target.value); }}
            rows={3}
            disabled={isSubmitting}
            className="text-xs"
          />
        )}

        {question.answer_type === 'SINGLE_ENUM' && question.allowed_values != null && (
          <div className="flex flex-col gap-2">
            {question.allowed_values.map((val) => (
              <Radio
                key={val}
                label={val}
                value={val}
                name={question.question_id}
                checked={selectedSingle === val}
                onChange={() => { setSelectedSingle(val); }}
                disabled={isSubmitting}
              />
            ))}
          </div>
        )}

        {question.answer_type === 'MULTI_SELECT' && question.allowed_values != null && (
          <div className="flex flex-col gap-2">
            <Checkbox
              label={t('actions.selectAll')}
              checked={allSelected}
              onChange={(e) => { handleSelectAll(e.target.checked); }}
              disabled={isSubmitting}
            />
            <hr className="border-border" />
            {question.allowed_values.map((val) => (
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
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        {question.can_be_skipped && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSkip}
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
