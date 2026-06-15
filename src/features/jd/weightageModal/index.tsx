import { useState, useEffect, useMemo, type JSX } from 'react';
import { BaseModal } from '@/components/modals/BaseModal';
import { useT } from '@/i18n/useT';
import { toastService } from '@/components/ui/toast/toastService';
import { useUpdateWeightageMutation } from '../api/jd.api';
import type { WeightageJson, WeightageCapability, FieldValues } from '../types/jd.types';

interface WeightageModalProps {
  open: boolean;
  weightageJson: WeightageJson;
  jdId: number;
  fieldValues: FieldValues;
  orgDnaSnapshot: Record<string, unknown>;
  onClose: () => void;
  onWeightageUpdated: () => void;
}

interface CapabilityRow {
  key: string;
  label: string;
  data: WeightageCapability;
}

function toLabel(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function SkillTable({
  title,
  skills,
  skillLabel,
  emptyText,
}: {
  title: string;
  skills: string[];
  skillLabel: string;
  emptyText?: string;
}): JSX.Element {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-text">{title}</p>
      {skills.length > 0 ? (
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-1.5 text-start font-medium text-text-muted">{skillLabel}</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((skill) => (
              <tr key={skill} className="border-b border-border/40 last:border-0">
                <td className="py-1.5 capitalize text-text">{skill.replace(/_/g, ' ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-xs italic text-text-muted">{emptyText}</p>
      )}
    </div>
  );
}

export function WeightageModal({
  open,
  weightageJson,
  jdId,
  fieldValues,
  orgDnaSnapshot,
  onClose,
  onWeightageUpdated,
}: WeightageModalProps): JSX.Element {
  const { t } = useT('jd');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [aiError, setAiError] = useState('');
  const [weightError, setWeightError] = useState('');
  const [updateWeightage, { isLoading: isUpdating }] = useUpdateWeightageMutation();

  const [adjustedWeights, setAdjustedWeights] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      Object.entries(weightageJson.capabilities).map(([k, v]) => [k, v.weight])
    )
  );

  useEffect(() => {
    setAdjustedWeights(
      Object.fromEntries(
        Object.entries(weightageJson.capabilities).map(([k, v]) => [k, v.weight])
      )
    );
    setWeightError('');
    setAiError('');
  }, [weightageJson]);

  const totalWeight = useMemo(
    () => Object.values(adjustedWeights).reduce((sum, w) => sum + w, 0),
    [adjustedWeights]
  );

  // Button enabled only when at least one weight differs from the original
  const hasChanges = useMemo(
    () => Object.entries(adjustedWeights).some(([k, v]) => v !== weightageJson.capabilities[k]?.weight),
    [adjustedWeights, weightageJson]
  );

  // Auto-build user_command from the changed weights
  const userCommand = useMemo(() => {
    const changes = Object.entries(adjustedWeights)
      .filter(([k, v]) => v !== weightageJson.capabilities[k]?.weight)
      .map(([k, v]) => {
        const original = weightageJson.capabilities[k]?.weight;
        const label = toLabel(k);
        return `${label} from ${original} to ${v}`;
      });
    if (changes.length === 0) return '';
    return `Adjust weights: ${changes.join(', ')}.`;
  }, [adjustedWeights, weightageJson]);

  function handleWeightChange(key: string, raw: string): void {
    const parsed = parseFloat(raw);
    const value = isNaN(parsed) || parsed < 0 ? 0 : parsed;
    setAdjustedWeights((prev) => ({ ...prev, [key]: value }));
    if (weightError) setWeightError('');
  }

  async function handleSubmit(): Promise<void> {
    // Validation 1 — empty check (input cleared = NaN stored as 0, but empty string from input)
    const hasEmpty = Object.values(adjustedWeights).some((v) => v === null || v === undefined || isNaN(v));
    if (hasEmpty) {
      setWeightError(t('weightage.emptyWeight'));
      return;
    }

    // Validation 2 — range check
    const outOfRange = Object.values(adjustedWeights).some((v) => v < 0 || v > 100);
    if (outOfRange) {
      setWeightError(t('weightage.weightOutOfRange'));
      return;
    }

    // Validation 3 — total must equal 100
    const rounded = Number(totalWeight.toFixed(2));
    if (rounded !== 100) {
      setWeightError(t('weightage.totalMustBe100'));
      return;
    }

    try {
      const data = await updateWeightage({
        jd_id: jdId,
        user_command: userCommand,
        field_values: fieldValues,
        current_weights: weightageJson,
        company_info: orgDnaSnapshot,
      }).unwrap();
      if (data.weightsUpdated) {
        if (data.message) toastService.success(data.message);
        setAiError('');
        setWeightError('');
        onWeightageUpdated();
      } else {
        setAiError(data.responseText);
      }
    } catch {
      // error handled by apiToastMiddleware
    }
  }

  function toggle(key: string): void {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); } else { next.add(key); }
      return next;
    });
  }

  const rows: CapabilityRow[] = Object.entries(weightageJson.capabilities)
    .map(([key, data]) => ({ key, label: toLabel(key), data }))
    .sort((a, b) => b.data.weight - a.data.weight);

  return (
    <BaseModal open={open} title={t('weightage.modalTitle')} onClose={onClose} size="2xl" panelClassName="!max-w-5xl">
      <div className="flex flex-col gap-4">
        {/* Capabilities table */}
        <div className="max-h-[50vh] overflow-y-auto rounded-lg border border-border">
          {/* Table header */}
          <div className="sticky top-0 grid grid-cols-[2rem_1fr_9rem_7rem] bg-surface-muted px-3 py-2 text-xs font-semibold text-text-muted">
            <span />
            <span>{t('weightage.capability')}</span>
            <span>{t('weightage.weight')}</span>
            <span className="text-end">{t('weightage.adjustWeight')}</span>
          </div>

          {rows.map(({ key, label, data }) => {
            const isOpen = expanded.has(key);
            const originalWeight = data.weight;
            const adjustedWeight = adjustedWeights[key] ?? originalWeight;

            return (
              <div key={key} className="border-t border-border">
                <div className="grid w-full grid-cols-[2rem_1fr_9rem_7rem] items-center px-3 py-3">
                  {/* Expand toggle */}
                  <button
                    type="button"
                    onClick={() => { toggle(key); }}
                    className="text-[10px] text-text-muted text-start"
                  >
                    {isOpen ? '▼' : '▶'}
                  </button>

                  {/* Capability name */}
                  <button
                    type="button"
                    onClick={() => { toggle(key); }}
                    className="text-xs font-medium text-text text-start transition-colors hover:text-primary"
                  >
                    {label}
                  </button>

                  {/* Weight bar — always shows original weight, never changes */}
                  <div className="flex items-center gap-2 pe-1">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(originalWeight, 100)}%` }}
                      />
                    </div>
                    <span className="w-8 text-end text-xs font-semibold text-text">{originalWeight}</span>
                  </div>

                  {/* Adjust weight input — editable, independent of original */}
                  <div className="flex justify-end">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="any"
                      value={adjustedWeight}
                      onChange={(e) => { handleWeightChange(key, e.target.value); }}
                      className="w-16 rounded border border-border bg-surface px-2 py-1 text-end text-xs text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                {isOpen && (
                  <div className="flex flex-col gap-4 border-t border-border bg-surface-muted/30 px-5 py-4">
                    <SkillTable
                      title={t('weightage.requiredSkills')}
                      skills={data.required}
                      skillLabel={t('weightage.skill')}
                    />
                    <SkillTable
                      title={t('weightage.optionalSkills')}
                      skills={data.optional}
                      skillLabel={t('weightage.skill')}
                      emptyText={t('weightage.noOptionalSkills')}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Total weight footer */}
          <div className="sticky bottom-0 grid grid-cols-[2rem_1fr_9rem_7rem] items-center border-t-2 border-border bg-surface-muted px-3 py-2">
            <span />
            <span className="text-xs font-semibold text-text">{t('weightage.totalWeight')}</span>
            <span />
            <div className="flex justify-end">
              <span className={`text-sm font-bold ${totalWeight === 100 ? 'text-success' : 'text-error'}`}>
                {Number(totalWeight.toFixed(2))}
              </span>
            </div>
          </div>
        </div>

        {/* Validation error */}
        {weightError !== '' && (
          <p className="text-xs font-bold text-error">{weightError}</p>
        )}

        {/* AI response error */}
        {aiError !== '' && (
          <p className="text-xs font-bold text-error">{aiError}</p>
        )}

        {/* Validate with AI button */}
        <div className="flex justify-end">
          <button
            type="button"
            disabled={!hasChanges || isUpdating}
            onClick={() => { void handleSubmit(); }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isUpdating ? t('loading.submitting') : t('weightage.validateWithAi')}
          </button>
        </div>

        {/* --- Textarea + send icon (hidden — kept for future use) ---
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold text-text">{t('chat.discussWithAi')}</p>
          <div className="flex items-end gap-2">
            <textarea
              value={userText}
              onChange={(e) => { setUserText(e.target.value); if (aiError) setAiError(''); }}
              rows={3}
              placeholder={t('preview.theoryInputPlaceholder')}
              className="flex-1 resize-none rounded-md border border-border bg-surface px-3 py-2 text-xs text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {userText.trim() !== '' && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => { void handleSubmit(); }}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white transition-opacity hover:opacity-80 disabled:opacity-50"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          {aiError !== '' && (
            <p className="text-xs font-bold text-error">{aiError}</p>
          )}
        </div>
        --- end hidden section --- */}
      </div>
    </BaseModal>
  );
}
