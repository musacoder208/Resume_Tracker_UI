import type { RoundActionCode } from '../types/interviewProcess.types';

const DECISION_VARIANT: Record<RoundActionCode, 'success' | 'error' | 'warning' | 'neutral'> = {
  SHORTLISTED: 'success',
  MOVE_TO_NEXT_ROUND: 'success',
  FINAL_SELECT: 'success',
  HOLD: 'warning',
  REJECTED: 'error',
};

// Decision text is shown straight from each round's own `actionName` (the DB's mst_roundaction
// name) wherever it's available — this only maps a code to a color, never to display text.
export function decisionVariant(code: RoundActionCode | null): 'success' | 'error' | 'warning' | 'neutral' {
  return code != null ? DECISION_VARIANT[code] : 'neutral';
}
