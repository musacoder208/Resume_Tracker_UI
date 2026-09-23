import type { RoundActionCode } from '../types/interviewProcess.types';

const DECISION_VARIANT: Record<RoundActionCode, 'success' | 'error' | 'warning' | 'neutral'> = {
  SHORTLISTED: 'success',
  MOVE_TO_NEXT_ROUND: 'success',
  FINAL_SELECT: 'success',
  HOLD: 'warning',
  REJECTED: 'error',
};

/** Loosely typed so it works with either the real i18next TFunction or a tab's own narrower `t` prop type. */
export function decisionLabel(t: (key: string) => string, code: RoundActionCode | null): string {
  return code == null ? '—' : t(`details.interviewProcess.decisionLabels.${code}`);
}

export function decisionVariant(code: RoundActionCode | null): 'success' | 'error' | 'warning' | 'neutral' {
  return code != null ? DECISION_VARIANT[code] : 'neutral';
}
