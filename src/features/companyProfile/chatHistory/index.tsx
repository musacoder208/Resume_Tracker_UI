import { useState, type JSX } from 'react';
import clsx from 'clsx';
import { Textarea } from '@/components/ui/textarea/Textarea';
import { Radio } from '@/components/ui/radio/Radio';
import { Checkbox } from '@/components/ui/checkbox/Checkbox';
import { Button } from '@/components/ui/button';
import { PencilIcon, ClockIcon, ChevronDownIcon, ChevronUpIcon, PaperAirplaneIcon } from '@/icons';
import { useT } from '@/i18n/useT';
import type { Interaction, ResolvedConflict, QuestionMode, AnswerType } from '../types/companyProfile.types';

interface ChatHistoryProps {
  interactions: Interaction[];
  resolvedConflicts: ResolvedConflict[];
  editingFieldKey: string | null;
  isSubmitting: boolean;
  onStartEdit: (fieldKey: string) => void;
  onSubmitEdit: (fieldKey: string, answer: string) => void;
}

interface FieldGroup {
  fieldKey: string;
  items: Interaction[];
  displayQuestionText: string;
  displayAnswer: string;
}

function getResolvedAnswer(fieldKey: string, resolvedConflicts: ResolvedConflict[]): string | null {
  let result: string | null = null;
  for (const conflict of resolvedConflicts) {
    if (fieldKey in conflict && conflict[fieldKey] !== undefined) {
      const val = conflict[fieldKey];
      if (Array.isArray(val)) result = (val as string[]).join(', ');
      else if (typeof val === 'string') result = val;
    }
  }
  return result;
}

function normalizeAnswer(val: unknown): string {
  if (Array.isArray(val)) return (val as string[]).join(', ');
  return String(val ?? '');
}

function buildFieldGroups(
  interactions: Interaction[],
  resolvedConflicts: ResolvedConflict[]
): FieldGroup[] {
  const orderMap = new Map<string, number>();
  const groupMap = new Map<string, Interaction[]>();

  for (const item of interactions) {
    if (!groupMap.has(item.field_key)) {
      orderMap.set(item.field_key, orderMap.size);
      groupMap.set(item.field_key, []);
    }
    groupMap.get(item.field_key)!.push(item);
  }

  const groups: FieldGroup[] = [];

  for (const [fieldKey, items] of groupMap) {
    // Sort by timestamp ascending
    const sorted = [...items].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const initialItem = sorted.find((i) => i.mode === 'initial');
    const clarifications = sorted.filter((i) => i.mode === 'clarification');
    const latestClarification = clarifications.at(-1);

    const displayQuestionText = initialItem?.question_text ?? sorted[0]?.question_text ?? '';

    let displayAnswer = normalizeAnswer(initialItem?.raw_answer ?? sorted[0]?.raw_answer ?? '');
    if (latestClarification != null) {
      displayAnswer = normalizeAnswer(latestClarification.raw_answer);
    }

    // Override with resolved conflict if present
    const resolved = getResolvedAnswer(fieldKey, resolvedConflicts);
    if (resolved !== null) displayAnswer = resolved;

    groups.push({ fieldKey, items: sorted, displayQuestionText, displayAnswer });
  }

  // Restore first-appearance order
  return groups.sort(
    (a, b) => (orderMap.get(a.fieldKey) ?? 0) - (orderMap.get(b.fieldKey) ?? 0)
  );
}

const modeBadgeClasses: Record<QuestionMode, string> = {
  initial: 'bg-info/10 text-info',
  clarification: 'bg-warning/10 text-warning',
  crossfield: 'bg-primary/10 text-primary',
};

interface InlineEditProps {
  interaction: Interaction;
  initialAnswer: string;
  isSubmitting: boolean;
  onSubmit: (answer: string) => void;
}

function InlineEdit({ interaction, initialAnswer, isSubmitting, onSubmit }: InlineEditProps): JSX.Element {
  const { t } = useT('companyProfile');

  const [textValue, setTextValue] = useState(initialAnswer);
  const [selectedSingle, setSelectedSingle] = useState(initialAnswer);
  const [selectedMulti, setSelectedMulti] = useState<string[]>(
    initialAnswer.split(',').map((v) => v.trim()).filter(Boolean)
  );

  const answerType: AnswerType = interaction.answer_type;

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

  const allSelected =
    interaction.allowed_values != null &&
    interaction.allowed_values.length > 0 &&
    selectedMulti.length === interaction.allowed_values.length;

  return (
    <div className="mt-2 flex flex-col gap-2">
      {answerType === 'FREE_TEXT' && (
        <Textarea
          value={textValue}
          onChange={(e) => { setTextValue(e.target.value); }}
          rows={2}
          disabled={isSubmitting}
          className="text-xs"
        />
      )}

      {answerType === 'SINGLE_ENUM' && interaction.allowed_values != null && (
        <div className="flex flex-col gap-1">
          {interaction.allowed_values.map((val) => (
            <Radio
              key={val}
              label={val}
              value={val}
              name={`edit-${interaction.field_key}`}
              checked={selectedSingle === val}
              onChange={() => { setSelectedSingle(val); }}
              disabled={isSubmitting}
            />
          ))}
        </div>
      )}

      {answerType === 'MULTI_SELECT' && interaction.allowed_values != null && (
        <div className="flex flex-col gap-1">
          <Checkbox
            label={t('actions.selectAll')}
            checked={allSelected}
            onChange={(e) => {
              setSelectedMulti(e.target.checked ? (interaction.allowed_values ?? []) : []);
            }}
            disabled={isSubmitting}
          />
          <hr className="border-border" />
          {interaction.allowed_values.map((val) => (
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

      {hasAnswer && (
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="sm"
            leadingIcon={<PaperAirplaneIcon className="h-4 w-4" />}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {t('actions.submit')}
          </Button>
        </div>
      )}
    </div>
  );
}

export function ChatHistory({
  interactions,
  resolvedConflicts,
  editingFieldKey,
  isSubmitting,
  onStartEdit,
  onSubmitEdit,
}: ChatHistoryProps): JSX.Element | null {
  const { t } = useT('companyProfile');
  const [expandedFieldKey, setExpandedFieldKey] = useState<string | null>(null);

  if (interactions.length === 0) return null;

  const groups = buildFieldGroups(interactions, resolvedConflicts);

  function toggleExpand(fieldKey: string): void {
    setExpandedFieldKey((prev) => (prev === fieldKey ? null : fieldKey));
  }

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group) => {
        const isEditing = editingFieldKey === group.fieldKey;
        const isExpanded = expandedFieldKey === group.fieldKey;
        const hasHistory = group.items.length > 1;

        // Find the interaction to use for edit (latest clarification, else initial)
        const editTarget =
          group.items.filter((i) => i.mode === 'clarification').at(-1) ??
          group.items.find((i) => i.mode === 'initial') ??
          group.items[0];

        return (
          <div
            key={group.fieldKey}
            className="rounded-xl border border-border bg-surface p-4"
          >
            {/* Q&A display row */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-xs font-medium text-text-muted">
                  {group.displayQuestionText}
                </p>
                {!isEditing && (
                  <p className="break-words text-xs font-semibold text-text">{group.displayAnswer}</p>
                )}
              </div>

              {/* Action icons */}
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  title={t('chat.editTooltip')}
                  onClick={() => { onStartEdit(group.fieldKey); }}
                  disabled={isSubmitting}
                  className={clsx(
                    'rounded-md p-1 text-text-muted hover:bg-surface-muted hover:text-text',
                    isEditing && 'bg-surface-muted text-primary'
                  )}
                >
                  <PencilIcon className="h-4 w-4" />
                </button>

                {hasHistory && (
                  <button
                    type="button"
                    title={t('chat.historyTooltip')}
                    onClick={() => { toggleExpand(group.fieldKey); }}
                    className={clsx(
                      'rounded-md p-1 text-text-muted hover:bg-surface-muted hover:text-text',
                      isExpanded && 'bg-surface-muted text-primary'
                    )}
                  >
                    <ClockIcon className="h-4 w-4" />
                  </button>
                )}

                {hasHistory && (
                  <button
                    type="button"
                    onClick={() => { toggleExpand(group.fieldKey); }}
                    className="rounded-md p-1 text-text-muted hover:bg-surface-muted hover:text-text"
                  >
                    {isExpanded ? (
                      <ChevronUpIcon className="h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Inline edit area */}
            {isEditing && editTarget != null && (
              <InlineEdit
                interaction={editTarget}
                initialAnswer={group.displayAnswer}
                isSubmitting={isSubmitting}
                onSubmit={(answer) => { onSubmitEdit(group.fieldKey, answer); }}
              />
            )}

            {/* Expanded history */}
            {isExpanded && (
              <div className="mt-3 border-t border-border pt-3">
                <p className="mb-2 text-xs font-medium text-text-muted">
                  {t('chat.previousAnswers')}
                </p>
                <div className="flex flex-col gap-2">
                  {group.items.map((item) => (
                    <div
                      key={item.question_id}
                      className="rounded-lg border border-border/50 bg-background p-3"
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <span
                          className={clsx(
                            'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                            modeBadgeClasses[item.mode]
                          )}
                        >
                          {t(`modes.${item.mode}`)}
                        </span>
                        <span className="text-xs text-text-muted">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="mb-0.5 text-xs text-text-muted">{item.question_text}</p>
                      <p className="break-words text-xs font-semibold text-text">
                        {normalizeAnswer(item.raw_answer)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
