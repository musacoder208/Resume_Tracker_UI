import type { ApiResponse } from '@/types/apiResponse';
import type {
  RawChatSession,
  RawChatResponse,
  RawChatResult,
  RawChatSessionMessages,
  RawChatMessage,
  ChatSession,
  ChatResponse,
  ChatResult,
  ChatResultColumn,
  ChatExportRow,
  ChatMessage,
} from '../types/chatAssistant.types';

const toText = (value: unknown): string => {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
};

/** Excel cell value — numbers and strings kept as sent, everything else as text */
const toExportValue = (value: unknown): string | number | null => {
  if (value == null) return null;
  if (typeof value === 'number' || typeof value === 'string') return value;
  return toText(value);
};

const toTextList = (values: unknown[] | null): string[] =>
  (values ?? []).map(toText).filter((v) => v !== '');

const UPPERCASE_WORDS = new Set(['ai', 'id', 'url', 'jd', 'hr', 'llm', 'ocr']);

/** "ai_final_score" → "AI Final Score" — result columns arrive as database column keys */
const toColumnLabel = (key: string): string =>
  key
    .split(/[_\s]+/)
    .filter((word) => word !== '')
    .map((word) =>
      UPPERCASE_WORDS.has(word.toLowerCase())
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(' ');

const mapResult = (raw: RawChatResult | null, needExcel: boolean): ChatResult | null => {
  if (raw == null) return null;
  const columns: ChatResultColumn[] = (raw.columns ?? []).map((key) => ({ key, label: toColumnLabel(key) }));
  const rawRows = raw.rows ?? [];
  // null cells become '' here; the table shows them as "—"
  const rows = rawRows.map((row) =>
    Object.fromEntries(columns.map((column) => [column.key, toText(row[column.key])]))
  );
  // Built only when Excel is offered — large results are not copied twice otherwise
  const exportRows: ChatExportRow[] = needExcel
    ? rawRows.map((row) =>
        Object.fromEntries(columns.map((column) => [column.key, toExportValue(row[column.key])]))
      )
    : [];
  return {
    summary: raw.summary ?? '',
    columns,
    rows,
    exportRows,
    rowCount: raw.row_count ?? rows.length,
    truncated: raw.truncated === true,
    howCalculated: raw.how_calculated ?? '',
  };
};

export const mapChatResponse = (raw: RawChatResponse): ChatResponse => {
  // need_excel sits at the top of the response, next to status
  const needExcel = raw.need_excel === true;
  return {
    sessionId: raw.session_id,
    questionId: raw.question_id,
    status: raw.status,
    needsCorrection: raw.needs_correction === true,
    correctionReason: raw.correction_reason ?? '',
    originalQuestion: raw.original_question ?? '',
    newGeneratedQuestion: raw.new_generated_question,
    message: raw.message ?? '',
    assumptions: toTextList(raw.assumptions),
    notes: toTextList(raw.notes),
    options: (raw.options ?? []).map((o) => ({ id: toText(o.id), label: toText(o.label) })),
    result: mapResult(raw.result, needExcel),
    errorCode: raw.error?.code ?? null,
    needExcel,
  };
};

const mapMessage = (raw: RawChatMessage): ChatMessage => ({
  messageId: raw.id,
  messageType: raw.message_type,
  request: {
    question: raw.request.question ?? null,
    selected: raw.request.selected ?? null,
    text: raw.request.text ?? null,
  },
  response: mapChatResponse(raw.response),
  createdDate: raw.created_date,
});

const mapChatSession = (raw: RawChatSession): ChatSession => ({
  sessionId: raw.session_id,
  title: raw.title ?? '',
  lastActivity: raw.modified_date ?? raw.created_date,
});

export const mapChatSessionsResponse = (raw: ApiResponse<RawChatSession[]>): ChatSession[] =>
  (raw.data ?? []).map(mapChatSession);

export const mapChatMessagesResponse = (raw: ApiResponse<RawChatSessionMessages>): ChatMessage[] =>
  (raw.data?.messages ?? []).map(mapMessage);

export const mapChatCallResponse = (raw: ApiResponse<RawChatResponse>): ChatResponse =>
  mapChatResponse(raw.data);
