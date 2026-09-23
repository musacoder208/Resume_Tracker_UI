import type { JSX } from 'react';
import clsx from 'clsx';
import { StatusBadge } from '@/components/ui/statusBadge';
import type { InterviewQuestion } from '../../types/interviewProcess.types';

export interface QuestionBlockProps {
  question: InterviewQuestion;
  value: string;
  onChange: (value: string) => void;
  showError: boolean;
  requiredLabel: string;
  optionalLabel: string;
  requiredErrorText: string;
  textPlaceholder: string;
  textareaPlaceholder: string;
}

export function QuestionBlock({
  question,
  value,
  onChange,
  showError,
  requiredLabel,
  optionalLabel,
  requiredErrorText,
  textPlaceholder,
  textareaPlaceholder,
}: QuestionBlockProps): JSX.Element {
  const isEmpty = question.isRequired && value.trim() === '';
  const hasError = showError && isEmpty;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-text">{question.text}</span>
        {question.isRequired && <span className="text-xs font-bold text-error">*</span>}
        <StatusBadge
          className="ms-auto"
          dot={false}
          variant={question.isRequired ? 'error' : 'neutral'}
          label={question.isRequired ? requiredLabel : optionalLabel}
        />
      </div>
      {question.controlType === 'textbox' ? (
        <input
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); }}
          placeholder={textPlaceholder}
          className={clsx(
            'w-full rounded-lg border bg-surface-muted/40 p-3 text-xs text-text placeholder:text-text-muted',
            hasError ? 'border-error' : 'border-border-muted'
          )}
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => { onChange(e.target.value); }}
          placeholder={textareaPlaceholder}
          className={clsx(
            'min-h-[64px] w-full resize-y rounded-lg border bg-surface-muted/40 p-3 text-xs text-text placeholder:text-text-muted',
            hasError ? 'border-error' : 'border-border-muted'
          )}
        />
      )}
      {hasError && <span className="text-[11px] font-semibold text-error">{requiredErrorText}</span>}
    </div>
  );
}
