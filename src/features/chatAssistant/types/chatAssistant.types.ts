// ── Raw API shapes ─────────────────────────────────────────────────────────────
// /chat/ask and /chat/reply return the Python response unchanged (sql removed).
// /chat/sessions and /chat/sessions/{id}/messages read what Python saved.

export type ChatResponseStatus =
  | 'answer'
  | 'confirm'
  | 'select'
  | 'clarify'
  | 'not_found'
  | 'refused'
  | 'limitation'
  | 'guide'
  | 'cancelled'
  | 'error';

export interface RawChatOption {
  id: string;
  label: string;
}

export interface RawChatResult {
  summary: string | null;
  executed: boolean;
  /** Column keys, e.g. ["candidate_id", "full_name", ...] */
  columns: string[] | null;
  /** One object per row, keyed by column, e.g. { "full_name": "Roshani Patil", "github_url": null } */
  rows: Record<string, unknown>[] | null;
  row_count: number | null;
  truncated: boolean | null;
  how_calculated: string | null;
}

export interface RawChatResponse {
  session_id: string | null;
  /** tbl_chat_message.message_id — kept as Python sent it (number or string) */
  question_id: number | string | null;
  status: ChatResponseStatus;
  needs_correction: boolean | null;
  correction_reason: string | null;
  original_question: string | null;
  new_generated_question: string | null;
  message: string | null;
  assumptions: unknown[] | null;
  notes: unknown[] | null;
  options: RawChatOption[] | null;
  result: RawChatResult | null;
  error: { code: string; message: string } | null;
  elapsed_ms: number | null;
  /** true → result.rows hold every row and the answer offers an Excel download */
  need_excel?: boolean | null;
}

export interface RawChatSession {
  session_id: string;
  title: string | null;
  created_date: string;
  modified_date: string | null;
}

/** Request saved by Python — ask: { question } · reply: { selected, text, ... } */
export interface RawChatMessageRequest {
  question?: string | null;
  selected?: string | null;
  text?: string | null;
}

export interface RawChatMessage {
  /** "<message_id>-<position in history>" — unique per ask / reply */
  id: string;
  question_id: number | string | null;
  message_type: 'ask' | 'reply';
  request: RawChatMessageRequest;
  response: RawChatResponse;
  created_date: string;
}

export interface RawChatSessionMessages {
  session_id: string;
  messages: RawChatMessage[];
}

// ── Domain types ───────────────────────────────────────────────────────────────

export interface ChatSession {
  sessionId: string;
  title: string;
  /** modified_date, or created_date when the chat was never modified */
  lastActivity: string;
}

export interface ChatOption {
  id: string;
  label: string;
}

export interface ChatResultColumn {
  key: string;
  label: string;
}

export type ChatResultRow = Record<string, string>;

/** Row for the Excel file — numbers stay numbers so Excel can sum / filter them */
export type ChatExportRow = Record<string, string | number | null>;

export interface ChatResult {
  summary: string;
  columns: ChatResultColumn[];
  rows: ChatResultRow[];
  /** Same rows with their original values — filled only when the response asks for Excel */
  exportRows: ChatExportRow[];
  rowCount: number;
  truncated: boolean;
  howCalculated: string;
}

export interface ChatResponse {
  sessionId: string | null;
  /** Sent back unchanged in /reply */
  questionId: number | string | null;
  status: ChatResponseStatus;
  /** true when Python rewrote / questioned the user's question */
  needsCorrection: boolean;
  correctionReason: string;
  originalQuestion: string;
  newGeneratedQuestion: string | null;
  message: string;
  assumptions: string[];
  notes: string[];
  options: ChatOption[];
  result: ChatResult | null;
  errorCode: string | null;
  /** Show the Export Excel button for this answer */
  needExcel: boolean;
}

/** What the user sent in this message */
export interface ChatMessageRequest {
  question: string | null;
  selected: string | null;
  text: string | null;
}

/** One Python call: the user's input + the bot's response */
export interface ChatMessage {
  messageId: string;
  messageType: 'ask' | 'reply';
  request: ChatMessageRequest;
  response: ChatResponse;
  createdDate: string;
}

export interface ChatAskParams {
  sessionId: string | null;
  question: string;
}

export interface ChatReplyParams {
  sessionId: string;
  questionId: number | string;
  newGeneratedQuestion: string | null;
  selected: string | null;
  text: string | null;
}
