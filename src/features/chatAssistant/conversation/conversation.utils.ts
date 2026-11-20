import type { ChatOption, ChatResponseStatus, ChatSession } from '../types/chatAssistant.types';

const DAY_MS = 24 * 60 * 60 * 1000;
const PREVIOUS_DAYS = 7;

/** Statuses where Python waits for the user (a /reply follows) */
const CARD_STATUSES: readonly ChatResponseStatus[] = ['confirm', 'select', 'clarify'];

/** Statuses that end the question with a message only */
const INFO_STATUSES: readonly ChatResponseStatus[] = ['not_found', 'refused', 'limitation', 'guide'];

export function isCardStatus(status: ChatResponseStatus): boolean {
  return CARD_STATUSES.includes(status);
}

export function isInfoStatus(status: ChatResponseStatus): boolean {
  return INFO_STATUSES.includes(status);
}

/** Reply `selected` values defined by the Python API */
export const REPLY_SELECTED = {
  yes: 'yes',
  no: 'no',
  all: 'all',
  cancel: 'cancel',
} as const;

export interface ReplyLabels {
  yes: string;
  no: string;
  all: string;
  cancel: string;
}

/** Text of the user's bubble for a /reply — typed text wins, else the picked choice */
export function describeReply(
  selected: string | null,
  text: string | null,
  options: readonly ChatOption[],
  labels: ReplyLabels
): string {
  if (text != null && text !== '') return text;
  switch (selected) {
    case null:
      return '';
    case REPLY_SELECTED.yes:
      return labels.yes;
    case REPLY_SELECTED.no:
      return labels.no;
    case REPLY_SELECTED.all:
      return labels.all;
    case REPLY_SELECTED.cancel:
      return labels.cancel;
    default:
      return options.find((o) => o.id === selected)?.label ?? selected;
  }
}

export type SessionGroupKey = 'today' | 'yesterday' | 'previous7Days' | 'older';

export interface SessionGroup {
  key: SessionGroupKey;
  sessions: ChatSession[];
}

function startOfDay(time: number): number {
  const d = new Date(time);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Sessions arrive newest first; groups keep that order. `now` = time of the last fetch. */
export function groupSessions(sessions: readonly ChatSession[], now: number): SessionGroup[] {
  const today = startOfDay(now);
  const keyFor = (session: ChatSession): SessionGroupKey => {
    const time = new Date(session.lastActivity).getTime();
    if (time >= today) return 'today';
    if (time >= today - DAY_MS) return 'yesterday';
    if (time >= today - PREVIOUS_DAYS * DAY_MS) return 'previous7Days';
    return 'older';
  };

  const groups: SessionGroup[] = [];
  for (const session of sessions) {
    const key = keyFor(session);
    const group = groups.find((g) => g.key === key);
    if (group != null) group.sessions.push(session);
    else groups.push({ key, sessions: [session] });
  }
  return groups;
}

export function formatChatTime(iso: string, language: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return '';
  return d.toLocaleTimeString(language, { hour: 'numeric', minute: '2-digit' });
}
