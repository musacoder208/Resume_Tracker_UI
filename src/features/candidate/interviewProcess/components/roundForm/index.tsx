import { useMemo, useState } from 'react';
import type { JSX, ReactNode } from 'react';
import type { TFunction } from 'i18next';
import { Button } from '@/components/ui/button';
import { AutocompleteSelect } from '@/components/ui/autocompleteSelect';
import { Checkbox } from '@/components/ui/checkbox';
import { toastService } from '@/components/ui/toast/toastService';
import { InterviewerPicker } from '../interviewerPicker';
import { CalendarPicker } from '../calendarPicker';
import { TimePicker } from '../timePicker';
import { InterviewTypeToggle } from '../interviewTypeToggle';
import { QuestionBlock } from '../questionBlock';
import {
  useGetRoundsQuery,
  useGetInterviewersQuery,
  useGetInterviewModesQuery,
  useGetContactStatusesQuery,
  useGetRoundActionsQuery,
  useLazyGetQuestionsQuery,
  useSaveContactStatusMutation,
  useSaveRoundMutation,
} from '../../api/interviewProcess.api';
import { combineToISODateTime, splitISODateTime } from '../../utils/dateTime';
import { PRE_SCREENING_ROUND_CODE } from '../../types/interviewProcess.types';
import type {
  CandidateInterviewSnapshot,
  Interviewer,
  InterviewModeCode,
  RoundActionCode,
  SaveRoundAnswer,
} from '../../types/interviewProcess.types';

export interface RoundFormProps {
  candidateId: number;
  jdId: number | null;
  /** Fallback source for seniority when the snapshot itself doesn't carry one (see `seniorityId` below). */
  seniorityId: number | null;
  snapshot: CandidateInterviewSnapshot;
  t: TFunction;
}

const NEXT_ROUND_ACTION: RoundActionCode = 'MOVE_TO_NEXT_ROUND';
const PRE_SCREENING_ACTIONS: RoundActionCode[] = ['SHORTLISTED', 'REJECTED'];
const OTHER_ROUND_ACTIONS: RoundActionCode[] = ['MOVE_TO_NEXT_ROUND', 'FINAL_SELECT', 'HOLD', 'REJECTED'];

/**
 * Merges the real interviewer directory with any interviewer already recorded on this
 * candidate (e.g. someone no longer active in the directory who conducted a past round) so
 * their name still renders as a chip even if they'd no longer appear in a fresh pick-list.
 */
function mergeInterviewers(directory: Interviewer[], snapshot: CandidateInterviewSnapshot): Interviewer[] {
  const map = new Map<number, Interviewer>();
  directory.forEach((i) => { map.set(i.id, i); });
  snapshot.pendingRound?.interviewers.forEach((i) => { if (!map.has(i.id)) map.set(i.id, i); });
  snapshot.history.forEach((h) => {
    h.interviewers.forEach((i) => { if (!map.has(i.id)) map.set(i.id, i); });
    h.nextInterviewers.forEach((i) => { if (!map.has(i.id)) map.set(i.id, i); });
  });
  return Array.from(map.values());
}

export function RoundForm({ candidateId, jdId, seniorityId: seniorityIdFallback, snapshot, t }: RoundFormProps): JSX.Element {
  const tp = (key: string, opts?: Record<string, unknown>): string => t(`details.interviewProcess.${key}`, opts);

  const { data: roundOptions = [] } = useGetRoundsQuery();
  const { data: interviewerDirectory = [] } = useGetInterviewersQuery();
  const { data: modeOptions = [] } = useGetInterviewModesQuery();
  const { data: contactStatusOptions = [] } = useGetContactStatusesQuery();
  const { data: actionOptions = [] } = useGetRoundActionsQuery();
  const [fetchQuestions, { data: questions = [], isFetching: isFetchingQuestions }] = useLazyGetQuestionsQuery();
  const [saveContactStatus, { isLoading: isSavingContactStatus }] = useSaveContactStatusMutation();
  const [saveRound, { isLoading: isSavingRound }] = useSaveRoundMutation();

  const interviewerOptions = useMemo(
    () => mergeInterviewers(interviewerDirectory, snapshot),
    [interviewerDirectory, snapshot]
  );
  const nextRoundOptions = useMemo(
    () => roundOptions.filter((r) => r.code !== PRE_SCREENING_ROUND_CODE),
    [roundOptions]
  );

  const pendingRound = snapshot.pendingRound;
  const initialDateTime = useMemo(() => splitISODateTime(pendingRound?.interviewDatetime ?? null), [pendingRound]);

  // The parent keys this component by pendingRound identity (see InterviewProcessTab), so a
  // fresh pending round or a completed save simply remounts the form — these lazy initializers
  // read the starting values once, with no reset effect needed.
  const [roundId, setRoundId] = useState(() => (pendingRound != null ? String(pendingRound.roundId) : ''));
  const [interviewerIds, setInterviewerIds] = useState<number[]>(() => pendingRound?.interviewers.map((i) => i.id) ?? []);
  const [date, setDate] = useState(() => initialDateTime.date);
  const [time, setTime] = useState(() => initialDateTime.time);
  const [interviewType, setInterviewType] = useState<InterviewModeCode | null>(() => pendingRound?.interviewType ?? null);
  const [contactStatusId, setContactStatusId] = useState(() =>
    snapshot.currentContactStatusId != null ? String(snapshot.currentContactStatusId) : ''
  );
  const [actionId, setActionId] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [nextEnabled, setNextEnabled] = useState(false);
  const [nextRoundId, setNextRoundId] = useState('');
  const [nextInterviewerIds, setNextInterviewerIds] = useState<number[]>([]);
  const [nextDate, setNextDate] = useState('');
  const [nextTime, setNextTime] = useState('');
  const [nextInterviewType, setNextInterviewType] = useState<InterviewModeCode | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  const selectedRound = roundOptions.find((r) => r.value === roundId);
  const roundCode = selectedRound?.code ?? null;
  const isPreScreening = roundCode === PRE_SCREENING_ROUND_CODE;

  const allowedActionCodes = isPreScreening ? PRE_SCREENING_ACTIONS : OTHER_ROUND_ACTIONS;
  const decisionOptions = useMemo(
    () =>
      actionOptions
        .filter((a) => allowedActionCodes.includes(a.code as RoundActionCode))
        .map((a) => ({ ...a, label: tp(`decisionLabels.${a.code}`) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tp is stable enough for this list to only depend on the underlying data
    [actionOptions, isPreScreening]
  );

  const selectedAction = actionOptions.find((a) => a.value === actionId);
  const actionCode = (selectedAction?.code as RoundActionCode | undefined) ?? null;

  const selectedContactStatus = contactStatusOptions.find((c) => c.value === contactStatusId);
  const contactStatusCode = selectedContactStatus?.code ?? null;
  const canSaveContactStatus = !isPreScreening && contactStatusId !== '' && contactStatusCode !== 'CONNECTED' && roundId !== '';

  const seniorityId = snapshot.seniorityId ?? seniorityIdFallback;
  const questionsAvailable = jdId != null && seniorityId != null;

  function handleRoundChange(value: string): void {
    setRoundId(value);
    setActionId('');
    setAnswers({});
  }

  function handleActionChange(value: string): void {
    setActionId(value);
    setAnswers({});
    if (questionsAvailable && roundId !== '' && value !== '') {
      void fetchQuestions({ jdId, seniorityId, roundId: Number(roundId), actionId: Number(value) });
    }
  }

  async function handleSaveContactStatus(): Promise<void> {
    if (!canSaveContactStatus) return;
    try {
      await saveContactStatus({
        candidateId,
        roundId: Number(roundId),
        contactStatusId: Number(contactStatusId),
      }).unwrap();
      toastService.success(tp('actions.contactStatusSaved'));
    } catch {
      // errors handled by apiToastMiddleware
    }
  }

  function validate(): string[] {
    const errors: string[] = [];
    if (roundId === '') errors.push(tp('errors.roundRequired'));
    if (interviewerIds.length === 0) errors.push(tp('errors.interviewersRequired'));
    if (!isPreScreening) {
      if (combineToISODateTime(date, time) == null) errors.push(tp('errors.dateTimeRequired'));
      if (interviewType == null) errors.push(tp('errors.interviewTypeRequired'));
    }
    if (actionId === '') errors.push(tp('errors.decisionRequired'));
    questions.forEach((q) => {
      if (q.isRequired && (answers[q.mappingId] ?? '').trim() === '') {
        errors.push(tp('errors.answerRequired', { text: q.text.slice(0, 40) }));
      }
    });
    if (actionCode === NEXT_ROUND_ACTION && nextEnabled) {
      if (nextRoundId === '' || nextInterviewerIds.length === 0 || combineToISODateTime(nextDate, nextTime) == null || nextInterviewType == null) {
        errors.push(tp('errors.nextRoundRequired'));
      }
    }
    return errors;
  }

  async function handleSaveRound(): Promise<void> {
    const errors = validate();
    if (errors.length > 0) {
      setShowErrors(true);
      toastService.info(tp('errors.fixHighlighted'));
      return;
    }

    const answerPayload: SaveRoundAnswer[] = questions.map((q) => ({
      questionId: q.questionId,
      mappingId: q.mappingId,
      answerText: (answers[q.mappingId] ?? '').trim(),
    }));

    const includeNextRound = actionCode === NEXT_ROUND_ACTION && nextEnabled;

    try {
      await saveRound({
        candidateId,
        roundId: Number(roundId),
        interviewerIds,
        ...(isPreScreening
          ? {}
          : {
              interviewDatetime: combineToISODateTime(date, time) ?? undefined,
              interviewType: interviewType ?? undefined,
            }),
        actionId: Number(actionId),
        answers: answerPayload,
        ...(includeNextRound
          ? {
              nextRound: {
                roundId: Number(nextRoundId),
                interviewerIds: nextInterviewerIds,
                interviewDatetime: combineToISODateTime(nextDate, nextTime) ?? '',
                interviewType: nextInterviewType as InterviewModeCode,
              },
            }
          : {}),
      }).unwrap();
      toastService.success(tp('actions.roundSaved'));
      setShowErrors(false);
    } catch {
      // errors handled by apiToastMiddleware
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Round details */}
      <div className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-5">
        <span className="text-[11px] font-bold uppercase tracking-wide text-text-muted">{tp('roundDetails')}</span>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label={tp('fields.round')}>
            <AutocompleteSelect
              value={roundId}
              onChange={handleRoundChange}
              options={roundOptions}
              placeholder={tp('fields.roundPlaceholder')}
              hasError={showErrors && roundId === ''}
            />
          </Field>
          <Field label={tp('fields.interviewers')}>
            <InterviewerPicker
              options={interviewerOptions}
              selectedIds={interviewerIds}
              onChange={setInterviewerIds}
              placeholder={tp('fields.interviewersPlaceholder')}
              emptyOptionsText={tp('fields.noInterviewers')}
              hasError={showErrors && interviewerIds.length === 0}
            />
          </Field>
          {!isPreScreening && (
            <>
              <Field label={tp('fields.dateTime')}>
                <div className="flex items-center gap-2">
                  <CalendarPicker value={date} onChange={setDate} placeholder={tp('fields.datePlaceholder')} hasError={showErrors && date === ''} />
                  <TimePicker value={time} onChange={setTime} placeholder={tp('fields.timePlaceholder')} hasError={showErrors && time === ''} />
                </div>
              </Field>
              <Field label={tp('fields.interviewType')}>
                <InterviewTypeToggle options={modeOptions} value={interviewType} onChange={setInterviewType} />
                {showErrors && interviewType == null && (
                  <span className="text-[10px] font-semibold text-error">{tp('errors.interviewTypeRequired')}</span>
                )}
              </Field>
              <Field label={tp('fields.contactStatus')}>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <AutocompleteSelect
                      value={contactStatusId}
                      onChange={setContactStatusId}
                      options={contactStatusOptions}
                      placeholder={tp('fields.contactStatusPlaceholder')}
                    />
                  </div>
                  {canSaveContactStatus && (
                    <Button variant="secondary" size="sm" disabled={isSavingContactStatus} onClick={() => { void handleSaveContactStatus(); }}>
                      {isSavingContactStatus ? tp('actions.saving') : tp('actions.saveContactStatus')}
                    </Button>
                  )}
                </div>
                <span className="text-[10px] text-text-subtle">{tp('contactStatusNote')}</span>
              </Field>
            </>
          )}
        </div>
      </div>

      {/* Decision + questions */}
      <div className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wide text-text-muted">{tp('questions.title')}</span>
          <div className="w-56">
            <AutocompleteSelect
              value={actionId}
              onChange={handleActionChange}
              options={decisionOptions}
              placeholder={tp('fields.decisionPlaceholder')}
              hasError={showErrors && actionId === ''}
            />
          </div>
        </div>

        {actionId === '' ? (
          <div className="flex min-h-[80px] items-center justify-center rounded-lg border border-dashed border-border-muted bg-surface-muted/40 p-4 text-center">
            <p className="text-[11px] text-text-subtle">{tp('questions.chooseDecision')}</p>
          </div>
        ) : !questionsAvailable ? (
          <div className="flex min-h-[80px] items-center justify-center rounded-lg border border-dashed border-border-muted bg-surface-muted/40 p-4 text-center">
            <p className="text-[11px] text-text-subtle">{tp('questions.unavailable')}</p>
          </div>
        ) : isFetchingQuestions ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-muted" />
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="flex min-h-[80px] items-center justify-center rounded-lg border border-dashed border-border-muted bg-surface-muted/40 p-4 text-center">
            <p className="text-[11px] text-text-subtle">{tp('questions.none')}</p>
          </div>
        ) : (
          questions.map((q) => (
            <QuestionBlock
              key={q.mappingId}
              question={q}
              value={answers[q.mappingId] ?? ''}
              onChange={(v) => { setAnswers((prev) => ({ ...prev, [q.mappingId]: v })); }}
              showError={showErrors}
              requiredLabel={tp('questions.required')}
              optionalLabel={tp('questions.optional')}
              requiredErrorText={tp('questions.requiredError')}
              textPlaceholder={tp('questions.textPlaceholder')}
              textareaPlaceholder={tp('questions.textareaPlaceholder')}
            />
          ))
        )}
      </div>

      {/* Optional next-round scheduling */}
      {actionCode === NEXT_ROUND_ACTION && (
        <div className="flex flex-col gap-4 rounded-xl border border-primary bg-primary-subtle/40 p-5">
          <label className="flex cursor-pointer items-center gap-2.5">
            <Checkbox checked={nextEnabled} onChange={(e) => { setNextEnabled(e.target.checked); }} />
            <span className="text-xs font-semibold text-text">{tp('nextRound.toggle')}</span>
          </label>

          {nextEnabled && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Field label={tp('nextRound.round')}>
                <AutocompleteSelect
                  value={nextRoundId}
                  onChange={setNextRoundId}
                  options={nextRoundOptions}
                  placeholder={tp('fields.roundPlaceholder')}
                  hasError={showErrors && nextRoundId === ''}
                />
              </Field>
              <Field label={tp('nextRound.interviewers')}>
                <InterviewerPicker
                  options={interviewerOptions}
                  selectedIds={nextInterviewerIds}
                  onChange={setNextInterviewerIds}
                  placeholder={tp('fields.interviewersPlaceholder')}
                  emptyOptionsText={tp('fields.noInterviewers')}
                  hasError={showErrors && nextInterviewerIds.length === 0}
                />
              </Field>
              <Field label={tp('fields.dateTime')}>
                <div className="flex items-center gap-2">
                  <CalendarPicker value={nextDate} onChange={setNextDate} placeholder={tp('fields.datePlaceholder')} hasError={showErrors && nextDate === ''} />
                  <TimePicker value={nextTime} onChange={setNextTime} placeholder={tp('fields.timePlaceholder')} hasError={showErrors && nextTime === ''} />
                </div>
              </Field>
              <Field label={tp('fields.interviewType')}>
                <InterviewTypeToggle options={modeOptions} value={nextInterviewType} onChange={setNextInterviewType} />
              </Field>
            </div>
          )}
        </div>
      )}

      {showErrors && (
        <div className="rounded-xl border border-error bg-error-subtle px-4 py-3 text-[11px] font-semibold text-error">
          {tp('errors.fixHighlighted')}
        </div>
      )}

      <div className="flex justify-end">
        <Button variant="primary" size="md" disabled={isSavingRound} onClick={() => { void handleSaveRound(); }}>
          {isSavingRound ? tp('actions.saving') : tp('actions.saveRound')}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-text-muted">{label}</span>
      {children}
    </div>
  );
}
