import { useState, useEffect, useMemo, type Dispatch, type SetStateAction, type JSX } from 'react';
import { BaseModal } from '@/components/modals/BaseModal';
import { useT } from '@/i18n/useT';
import { toastService } from '@/components/ui/toast/toastService';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import {
  useUpdateWeightageMutation,
  useUpdateWeightageConstraintsMutation,
  useGetConstraintDetailsQuery,
} from '../api/jd.api';
import type {
  WeightageJson,
  WeightageCapability,
  WeightageConstraint,
  FieldValues,
  ConstraintDetail,
  AdditionalNoteInstruction,
} from '../types/jd.types';

interface WeightageModalProps {
  open: boolean;
  weightageJson: WeightageJson | null;
  jdId: number;
  fieldValues: FieldValues;
  orgDnaSnapshot: Record<string, unknown>;
  onClose: () => void;
  onWeightageUpdated: () => void;
  onGenerateWeight: (additionalNotes: AdditionalNoteInstruction[]) => void | Promise<void>;
  isGenerating: boolean;
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

// Splits a template like "Prefer candidates from #location#" into the text
// before/after the #keyword# placeholder, so a control can be inlined between them.
function splitTemplate(name: string): { before: string; after: string } | null {
  const match = name.match(/#[^#]+#/);
  if (match?.index == null) return null;
  return { before: name.slice(0, match.index), after: name.slice(match.index + match[0].length) };
}

const CONSTRAINT_INT_MAX_LENGTH = 4;

// No org_id source exists in the frontend yet (no auth field, no tenant slice value) —
// hardcoded until there's a real one to wire in. ip_address has no source either; the
// backend contract calls for a placeholder there for now.
const PLACEHOLDER_ORG_ID = '1';
const PLACEHOLDER_IP_ADDRESS = 'string';

// type: "string" -> letters/text only, "int" -> digits only (max 4 chars), null -> no restriction
function sanitizeConstraintValue(type: string | null | undefined, raw: string): string {
  switch (type?.toUpperCase()) {
    case 'INT':
      return raw.replace(/[^0-9]/g, '').slice(0, CONSTRAINT_INT_MAX_LENGTH);
    case 'STRING':
      return raw.replace(/[0-9]/g, '');
    default:
      return raw;
  }
}

function getCheckboxOptions(detail: ConstraintDetail): string[] {
  return (detail.values ?? []).flatMap((v) => v.split(',').map((s) => s.trim())).filter(Boolean);
}

// Reverses the template-before + value + template-after composition used when building
// outgoing instructions, to recover just the entered value from a saved reason sentence.
// Falls back to the full reason when the reason doesn't match that shape (e.g. reworded by the AI).
function extractReasonValue(detail: ConstraintDetail, reason: string | undefined): string {
  if (reason == null) return '';

  // Numeric fields: pull the number out directly rather than relying on exact template-text
  // matching, which is too brittle against real-world wording differences in the saved reason.
  if (detail.type?.toUpperCase() === 'INT') {
    const match = reason.match(/\d+/);
    return match != null ? match[0] : reason;
  }

  const template = splitTemplate(detail.name);
  if (template == null) return reason;
  const { before, after } = template;
  if (reason.startsWith(before) && reason.endsWith(after) && reason.length >= before.length + after.length) {
    return reason.slice(before.length, reason.length - after.length);
  }
  return reason;
}

// Options are single-select, so pre-select at most the first option whose text appears in the
// saved reason sentence.
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchReasonOptions(detail: ConstraintDetail, reason: string | undefined): string[] {
  if (reason == null) return [];
  // Word-boundary match, not a plain substring check — otherwise "Male" wrongly matches
  // inside "female" (fe-MALE), since "male" is literally a substring of "female".
  const match = getCheckboxOptions(detail).find((option) => {
    const pattern = new RegExp(`\\b${escapeRegExp(option)}\\b`, 'i');
    return pattern.test(reason);
  });
  return match != null ? [match] : [];
}

function ConstraintDetailRow({
  detail,
  textValue,
  onTextChange,
  checkedValues,
  onOptionSelect,
  selected,
  onSelectedChange,
}: {
  detail: ConstraintDetail;
  textValue: string;
  onTextChange: (value: string) => void;
  checkedValues: string[];
  onOptionSelect: (option: string) => void;
  selected: boolean;
  onSelectedChange: (checked: boolean) => void;
}): JSX.Element {
  const template = splitTemplate(detail.name);
  const isInt = detail.type?.toUpperCase() === 'INT';

  let content: JSX.Element;

  if (detail.controls === 'TEXTAREA') {
    content = (
      <div className="flex flex-wrap items-center gap-2 text-xs text-text">
        {template != null && <span>{template.before}</span>}
        <textarea
          value={textValue}
          onChange={(e) => { onTextChange(sanitizeConstraintValue(detail.type, e.target.value)); }}
          rows={2}
          maxLength={isInt ? CONSTRAINT_INT_MAX_LENGTH : undefined}
          inputMode={isInt ? 'numeric' : 'text'}
          className="min-w-[10rem] flex-1 resize-none rounded-md border border-border bg-surface px-2 py-1 text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {template != null && <span>{template.after}</span>}
      </div>
    );
  } else if (detail.controls === 'TEXTBOX') {
    content = (
      <div className="flex flex-wrap items-center gap-2 text-xs text-text">
        {template != null && <span>{template.before}</span>}
        <input
          type="text"
          value={textValue}
          onChange={(e) => { onTextChange(sanitizeConstraintValue(detail.type, e.target.value)); }}
          maxLength={isInt ? CONSTRAINT_INT_MAX_LENGTH : undefined}
          inputMode={isInt ? 'numeric' : 'text'}
          className="min-w-[8rem] flex-1 rounded-md border border-border bg-surface px-2 py-1 text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {template != null && <span>{template.after}</span>}
      </div>
    );
  } else if (detail.controls === 'CHECKBOX') {
    // Single-select: options are mutually exclusive (e.g. Gender: Male / Female), so render radios.
    const options = getCheckboxOptions(detail);
    content = (
      <div className="flex flex-wrap items-center gap-2 text-xs text-text">
        <span>{template?.before ?? detail.name}</span>
        {options.map((option) => (
          <label key={option} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1">
            <input
              type="radio"
              name={`constraint-${detail.id}`}
              checked={checkedValues.includes(option)}
              onChange={() => { onOptionSelect(option); }}
              className="h-3.5 w-3.5 cursor-pointer accent-primary"
            />
            <span>{option}</span>
          </label>
        ))}
        {template != null && <span>{template.after}</span>}
      </div>
    );
  } else {
    content = <p className="text-xs text-text">{detail.name}</p>;
  }

  return (
    <div className="flex items-start gap-2">
      <input
        type="checkbox"
        checked={selected}
        onChange={(e) => { onSelectedChange(e.target.checked); }}
        className="mt-1 h-3.5 w-3.5 shrink-0 cursor-pointer accent-primary"
      />
      <span className="mt-0.5 shrink-0 text-xs font-semibold text-text-muted">{detail.id}.</span>
      <div className="flex-1">{content}</div>
    </div>
  );
}

interface ConstraintGroup {
  categoryId: number;
  categoryName: string;
  items: ConstraintDetail[];
}

function groupByCategory(details: ConstraintDetail[]): ConstraintGroup[] {
  const groups: ConstraintGroup[] = [];
  const indexByCategory = new Map<number, number>();
  for (const item of details) {
    let idx = indexByCategory.get(item.categoryId);
    if (idx == null) {
      idx = groups.length;
      indexByCategory.set(item.categoryId, idx);
      groups.push({ categoryId: item.categoryId, categoryName: item.categoryName, items: [] });
    }
    groups[idx].items.push(item);
  }
  return groups;
}

// Shared rendering for both the pre-generation questionnaire and the post-generation
// Constraint tab. A row defaults to selected if the API's own isSelected flag says so, OR if
// there's a matching saved constraint by id (belt-and-suspenders in case the backend hasn't
// started populating isSelected on getConstraintDetails yet — the saved-constraints match is
// the more reliable signal today). Its text/checkbox answer is pre-filled from that saved reason.
function ConstraintGroupsList({
  t,
  isLoading,
  groups,
  savedConstraintsById,
  textareaAnswers,
  setTextareaAnswers,
  checkboxAnswers,
  setCheckboxAnswers,
  selectedDetailIds,
  setSelectedDetailIds,
}: {
  t: (key: string) => string;
  isLoading: boolean;
  groups: ConstraintGroup[];
  savedConstraintsById: Map<string, WeightageConstraint>;
  textareaAnswers: Record<number, string>;
  setTextareaAnswers: Dispatch<SetStateAction<Record<number, string>>>;
  checkboxAnswers: Record<number, string[]>;
  setCheckboxAnswers: Dispatch<SetStateAction<Record<number, string[]>>>;
  selectedDetailIds: Record<number, boolean>;
  setSelectedDetailIds: Dispatch<SetStateAction<Record<number, boolean>>>;
}): JSX.Element {
  if (isLoading) {
    return <p className="text-xs text-text-muted">{t('weightage.loadingConstraints')}</p>;
  }
  if (groups.length === 0) {
    return <p className="text-xs italic text-text-muted">{t('weightage.noConstraints')}</p>;
  }

  return (
    <>
      {groups.map((group) => (
        <div key={group.categoryId} className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{group.categoryName}</p>
          <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
            {group.items.map((item) => {
              const saved = savedConstraintsById.get(String(item.id));
              return (
                <ConstraintDetailRow
                  key={item.id}
                  detail={item}
                  textValue={textareaAnswers[item.id] ?? extractReasonValue(item, saved?.reason)}
                  onTextChange={(value) => {
                    setTextareaAnswers((prev) => ({ ...prev, [item.id]: value }));
                  }}
                  checkedValues={checkboxAnswers[item.id] ?? matchReasonOptions(item, saved?.reason)}
                  onOptionSelect={(option) => {
                    setCheckboxAnswers((prev) => ({ ...prev, [item.id]: [option] }));
                  }}
                  selected={selectedDetailIds[item.id] ?? (item.isSelected || saved != null)}
                  onSelectedChange={(checked) => {
                    setSelectedDetailIds((prev) => ({ ...prev, [item.id]: checked }));
                  }}
                />
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

// Builds the additional_notes payload from selected constraint rows, substituting
// each row's #keyword# placeholder with the user's entered value/selection.
function buildAdditionalNotes(
  details: ConstraintDetail[],
  selectedIds: Record<number, boolean>,
  textAnswers: Record<number, string>,
  checkboxSelections: Record<number, string[]>
): AdditionalNoteInstruction[] {
  const notes: AdditionalNoteInstruction[] = [];

  for (const detail of details) {
    // Defaults to what the API says is already selected; overridden by whatever the user toggled.
    const isSelected = selectedIds[detail.id] ?? detail.isSelected;
    if (!isSelected) continue;

    const template = splitTemplate(detail.name);
    let instruction: string;

    if (detail.controls === 'TEXTAREA' || detail.controls === 'TEXTBOX') {
      const value = (textAnswers[detail.id] ?? '').trim();
      if (value === '') continue;
      instruction = template != null ? `${template.before}${value}${template.after}` : `${detail.name} ${value}`;
    } else if (detail.controls === 'CHECKBOX') {
      const values = checkboxSelections[detail.id] ?? [];
      if (values.length === 0) continue;
      const joined = values.join(', ');
      instruction = template != null ? `${template.before}${joined}${template.after}` : `${detail.name} ${joined}`;
    } else {
      instruction = detail.name;
    }

    notes.push({ id: String(detail.id), instruction, isSelected: true });
  }

  return notes;
}

// Builds the add_requests payload for "Update Constraint" — unlike buildAdditionalNotes,
// every row is included (not just selected/filled ones), each carrying its current isSelected state.
function buildConstraintRequests(
  details: ConstraintDetail[],
  selectedIds: Record<number, boolean>,
  textAnswers: Record<number, string>,
  checkboxSelections: Record<number, string[]>,
  savedConstraintsById: Map<string, WeightageConstraint>
): AdditionalNoteInstruction[] {
  return details.map((detail) => {
    const saved = savedConstraintsById.get(String(detail.id));
    const isSelected = selectedIds[detail.id] ?? (detail.isSelected || saved != null);
    const template = splitTemplate(detail.name);
    let instruction: string;

    if (detail.controls === 'TEXTAREA' || detail.controls === 'TEXTBOX') {
      const value = textAnswers[detail.id] ?? extractReasonValue(detail, saved?.reason);
      instruction = template != null
        ? `${template.before}${value}${template.after}`
        : `${detail.name} ${value}`.trim();
    } else if (detail.controls === 'CHECKBOX') {
      const values = checkboxSelections[detail.id] ?? matchReasonOptions(detail, saved?.reason);
      const joined = values.join(', ');
      instruction = template != null
        ? `${template.before}${joined}${template.after}`
        : `${detail.name} ${joined}`.trim();
    } else {
      instruction = detail.name;
    }

    return { id: String(detail.id), instruction, isSelected };
  });
}

export function WeightageModal({
  open,
  weightageJson,
  jdId,
  fieldValues,
  orgDnaSnapshot,
  onClose,
  onWeightageUpdated,
  onGenerateWeight,
  isGenerating,
}: WeightageModalProps): JSX.Element {
  const { t } = useT('jd');
  const currentUser = useCurrentUser();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [aiError, setAiError] = useState('');
  const [weightError, setWeightError] = useState('');
  const [updateWeightage, { isLoading: isUpdating }] = useUpdateWeightageMutation();
  const [updateConstraints, { isLoading: isUpdatingConstraints }] = useUpdateWeightageConstraintsMutation();

  // Pre-generation mode: no weightage exists yet, so show the predefined constraint
  // questions (fetched below) instead of the capability/constraint-adjustment view.
  const isPreGeneration = weightageJson == null;

  // Fetched whenever the modal is open — used pre-generation to render the blank
  // questionnaire, and post-generation (Constraint tab) to render it seeded with saved answers.
  const { data: constraintDetails, isFetching: isLoadingConstraints } = useGetConstraintDetailsQuery(undefined, {
    skip: !open,
  });
  const constraintGroups = useMemo(() => groupByCategory(constraintDetails ?? []), [constraintDetails]);
  const [textareaAnswers, setTextareaAnswers] = useState<Record<number, string>>({});
  const [checkboxAnswers, setCheckboxAnswers] = useState<Record<number, string[]>>({});
  // Explicit per-row overrides for the leading select checkbox. Falls back to
  // "has a control" (detail.controls != null) as the default when no override exists.
  const [selectedDetailIds, setSelectedDetailIds] = useState<Record<number, boolean>>({});

  // Post-generation view is split into a Constraint tab and a Weightage tab.
  const [activeTab, setActiveTab] = useState<'constraint' | 'weightage'>('constraint');

  useEffect(() => {
    if (!open) {
      setTextareaAnswers({});
      setCheckboxAnswers({});
      setSelectedDetailIds({});
      setActiveTab('constraint');
    }
  }, [open]);

  const [adjustedWeights, setAdjustedWeights] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      Object.entries(weightageJson?.capabilities ?? {}).map(([k, v]) => [k, v.weight])
    )
  );

  // Re-seeds from the saved weightageJson whenever it changes AND whenever the modal
  // opens/closes, so any unsaved edits (adjusted weights) made in a previous open are
  // discarded rather than lingering into the next one.
  useEffect(() => {
    setAdjustedWeights(
      Object.fromEntries(
        Object.entries(weightageJson?.capabilities ?? {}).map(([k, v]) => [k, v.weight])
      )
    );
    setWeightError('');
    setAiError('');
  }, [weightageJson, open]);

  const totalWeight = useMemo(
    () => Object.values(adjustedWeights).reduce((sum, w) => sum + w, 0),
    [adjustedWeights]
  );

  // Button enabled only when at least one weight differs from the original
  const hasChanges = useMemo(
    () => Object.entries(adjustedWeights).some(([k, v]) => v !== weightageJson?.capabilities[k]?.weight),
    [adjustedWeights, weightageJson]
  );

  // Auto-build user_command from the changed weights
  const userCommand = useMemo(() => {
    const changes = Object.entries(adjustedWeights)
      .filter(([k, v]) => v !== weightageJson?.capabilities[k]?.weight)
      .map(([k, v]) => {
        const original = weightageJson?.capabilities[k]?.weight;
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

    if (weightageJson == null) return;

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

  async function handleUpdateConstraints(): Promise<void> {
    if (weightageJson == null) return;

    const addRequests = buildConstraintRequests(
      constraintDetails ?? [],
      selectedDetailIds,
      textareaAnswers,
      checkboxAnswers,
      savedConstraintsById
    );

    try {
      const data = await updateConstraints({
        jd_id: String(jdId),
        current_weights: weightageJson,
        current_constraints: weightageJson.constraints,
        add_requests: addRequests,
        org_id: PLACEHOLDER_ORG_ID,
        user_id: String(currentUser?.userId ?? ''),
        ip_address: PLACEHOLDER_IP_ADDRESS,
      }).unwrap();
      if (data.message) toastService.success(data.message);
      onClose();
      onWeightageUpdated();
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

  const rows: CapabilityRow[] = Object.entries(weightageJson?.capabilities ?? {})
    .map(([key, data]) => ({ key, label: toLabel(key), data }))
    .sort((a, b) => b.data.weight - a.data.weight);

  // Saved constraints keyed by id, used to seed the Constraint tab's rows with what was
  // already generated: matched rows show as selected with their saved reason pre-filled.
  const savedConstraintsById = new Map((weightageJson?.constraints ?? []).map((c) => [c.id, c]));

  return (
    <BaseModal open={open} title={t('weightage.modalTitle')} onClose={onClose} size="2xl" panelClassName="!max-w-5xl">
      {isPreGeneration ? (
      <div className="flex flex-col gap-4">
        <div className="flex max-h-[62vh] flex-col gap-5 overflow-y-auto pr-1">
          <ConstraintGroupsList
            t={t}
            isLoading={isLoadingConstraints}
            groups={constraintGroups}
            savedConstraintsById={savedConstraintsById}
            textareaAnswers={textareaAnswers}
            setTextareaAnswers={setTextareaAnswers}
            checkboxAnswers={checkboxAnswers}
            setCheckboxAnswers={setCheckboxAnswers}
            selectedDetailIds={selectedDetailIds}
            setSelectedDetailIds={setSelectedDetailIds}
          />
        </div>
        <div className="flex justify-end border-t border-border pt-3">
          <button
            type="button"
            disabled={isGenerating}
            onClick={() => {
              const notes = buildAdditionalNotes(
                constraintDetails ?? [],
                selectedDetailIds,
                textareaAnswers,
                checkboxAnswers
              );
              void onGenerateWeight(notes);
            }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isGenerating ? t('loading.submitting') : t('weightage.generateWeight')}
          </button>
        </div>
      </div>
      ) : (
      <div className="flex flex-col gap-0">

        {/* ── Tabs header ── */}
        <div className="mb-3 flex gap-1 border-b border-border">
          <button
            type="button"
            onClick={() => { setActiveTab('constraint'); }}
            className={`border-b-2 px-3 py-2 text-xs font-semibold transition-colors ${
              activeTab === 'constraint'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            {t('weightage.constraintTab')}
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('weightage'); }}
            className={`border-b-2 px-3 py-2 text-xs font-semibold transition-colors ${
              activeTab === 'weightage'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            {t('weightage.weightageTab')}
          </button>
        </div>

        {activeTab === 'constraint' ? (
          <>
            {/* ── Constraint tab content ── */}
            <div className="flex max-h-[62vh] flex-col gap-5 overflow-y-auto pr-1">
              <ConstraintGroupsList
                t={t}
                isLoading={isLoadingConstraints}
                groups={constraintGroups}
                savedConstraintsById={savedConstraintsById}
                textareaAnswers={textareaAnswers}
                setTextareaAnswers={setTextareaAnswers}
                checkboxAnswers={checkboxAnswers}
                setCheckboxAnswers={setCheckboxAnswers}
                selectedDetailIds={selectedDetailIds}
                setSelectedDetailIds={setSelectedDetailIds}
              />
            </div>

            {/* ── Fixed footer — Constraint tab ── */}
            <div className="flex flex-col gap-2 border-t border-border pt-3">
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isUpdatingConstraints || isLoadingConstraints}
                  onClick={() => { void handleUpdateConstraints(); }}
                  className="rounded-md border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isUpdatingConstraints ? t('loading.submitting') : 'Update Constraint'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* ── Weightage tab content ── */}
            <div className="flex max-h-[62vh] flex-col gap-4 overflow-y-auto pb-4 pr-1">
              {/* Capabilities table */}
              <div className="rounded-lg border border-border">
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
                        <button
                          type="button"
                          onClick={() => { toggle(key); }}
                          className="text-[10px] text-text-muted text-start"
                        >
                          {isOpen ? '▼' : '▶'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { toggle(key); }}
                          className="text-xs font-medium text-text text-start transition-colors hover:text-primary"
                        >
                          {label}
                        </button>
                        <div className="flex items-center gap-2 pe-1">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${Math.min(originalWeight, 100)}%` }}
                            />
                          </div>
                          <span className="w-8 text-end text-xs font-semibold text-text">{originalWeight}</span>
                        </div>
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
                <div className="grid grid-cols-[2rem_1fr_9rem_7rem] items-center border-t-2 border-border bg-surface-muted px-3 py-2">
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
            </div>

            {/* ── Fixed footer — Weightage tab ── */}
            <div className="flex flex-col gap-2 border-t border-border pt-3">
              {(weightError !== '' || aiError !== '') && (
                <p className="text-xs font-bold text-error">{weightError !== '' ? weightError : aiError}</p>
              )}
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={!hasChanges || isUpdating}
                  onClick={() => { void handleSubmit(); }}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isUpdating ? t('loading.submitting') : t('weightage.validateWithAi')}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      )}

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
    </BaseModal>
  );
}
