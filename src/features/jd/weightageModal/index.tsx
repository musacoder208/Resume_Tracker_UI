import { useState, type JSX } from 'react';
import { BaseModal } from '@/components/modals/BaseModal';
import { PaperAirplaneIcon } from '@/icons';
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
  const [userText, setUserText] = useState('');
  const [updateWeightage, { isLoading: isUpdating }] = useUpdateWeightageMutation();

  async function handleSubmit(): Promise<void> {
    if (userText.trim() === '') return;
    try {
      const data = await updateWeightage({
        jd_id: jdId,
        user_command: userText,
        field_values: fieldValues,
        current_weights: weightageJson,
        company_info: orgDnaSnapshot,
      }).unwrap();
      if (data.message) toastService.success(data.message);
      if (data.success) {
        setUserText('');
        onClose();
        onWeightageUpdated();
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
          <div className="grid grid-cols-[2rem_1fr_9rem] bg-surface-muted px-3 py-2 text-xs font-semibold text-text-muted sticky top-0">
            <span />
            <span>{t('weightage.capability')}</span>
            <span>{t('weightage.weight')}</span>
          </div>

          {rows.map(({ key, label, data }) => {
            const isOpen = expanded.has(key);
            return (
              <div key={key} className="border-t border-border">
                <button
                  type="button"
                  onClick={() => { toggle(key); }}
                  className="grid w-full grid-cols-[2rem_1fr_9rem] items-center px-3 py-3 text-start transition-colors hover:bg-surface-muted/50"
                >
                  <span className="text-[10px] text-text-muted">{isOpen ? '▼' : '▶'}</span>
                  <span className="text-xs font-medium text-text">{label}</span>
                  <div className="flex items-center gap-2 pe-1">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${data.weight}%` }}
                      />
                    </div>
                    <span className="w-5 text-right text-xs font-semibold text-text">{data.weight}</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-border bg-surface-muted/30 px-5 py-4 flex flex-col gap-4">
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
        </div>

        {/* Input row */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold text-text">{t('chat.discussWithAi')}</p>
          <div className="flex items-end gap-2">
            <textarea
              value={userText}
              onChange={(e) => { setUserText(e.target.value); }}
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
        </div>
      </div>
    </BaseModal>
  );
}
