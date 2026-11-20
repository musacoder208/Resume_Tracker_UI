import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/query/react';
import clsx from 'clsx';
import { PageContainer } from '@/components/containers/PageContainer';
import { Button } from '@/components/ui/button';
import { ChatBubbleLeftRightIcon } from '@/icons';
import { useT } from '@/i18n/useT';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAppDispatch } from '@/hooks/reduxHooks';
import {
  chatAssistantApi,
  useGetChatSessionsQuery,
  useGetChatMessagesQuery,
  useAskChatQuestionMutation,
  useReplyToChatQuestionMutation,
} from '../api/chatAssistant.api';
import type { ChatResponse, ChatMessage, ChatMessageRequest } from '../types/chatAssistant.types';
import { describeReply, isCardStatus } from '../conversation/conversation.utils';
import { SessionList } from '../sessionList';
import { Conversation } from '../conversation';
import { Composer } from '../composer';

const CHAT_ROUTE = '/assistant';

/** A call running from this tab, shown in the chat it was sent from */
interface PendingCall {
  sessionId: string | null;
  text: string;
}

interface AbortableCall {
  abort: () => void;
}

const isAbortError = (error: unknown): boolean => (error as { name?: string } | null)?.name === 'AbortError';

export function ChatAssistantPage() {
  const { t } = useT('chatAssistant');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useCurrentUser();
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId ?? null;

  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState<PendingCall | null>(null);
  const [stopped, setStopped] = useState(false);
  // Response that came back without a session (e.g. an error on the very first question)
  const [unsavedMessage, setUnsavedMessage] = useState<ChatMessage | null>(null);
  const [showSessions, setShowSessions] = useState(false);

  const runningCall = useRef<AbortableCall | null>(null);
  const currentSessionId = useRef(sessionId);
  useEffect(() => {
    currentSessionId.current = sessionId;
  }, [sessionId]);

  const sessionsQuery = useGetChatSessionsQuery();
  const messagesQuery = useGetChatMessagesQuery(sessionId ?? skipToken);
  const [ask] = useAskChatQuestionMutation();
  const [reply] = useReplyToChatQuestionMutation();

  const savedMessages = sessionId != null ? (messagesQuery.data ?? []) : [];
  const messages = sessionId == null && unsavedMessage != null ? [unsavedMessage] : savedMessages;
  const pendingText = pending != null && pending.sessionId === sessionId ? pending.text : null;
  const sending = pending != null;
  const lastMessage = messages.at(-1);
  const waitingForReply = lastMessage != null && isCardStatus(lastMessage.response.status);

  /** Python saved the message already — add it to the cached history instead of refetching */
  function addMessage(targetSessionId: string, messageType: ChatMessage['messageType'], request: ChatMessageRequest, response: ChatResponse): void {
    const message: ChatMessage = {
      messageId: `local-${Date.now()}`,
      messageType,
      request,
      response,
      createdDate: new Date().toISOString(),
    };
    if (targetSessionId === sessionId) {
      dispatch(chatAssistantApi.util.updateQueryData('getChatMessages', targetSessionId, (draftMessages) => {
        draftMessages.push(message);
      }));
    } else {
      void dispatch(chatAssistantApi.util.upsertQueryData('getChatMessages', targetSessionId, [message]));
    }
  }

  async function handleAsk(text: string): Promise<void> {
    const question = text.trim();
    if (question === '' || sending) return;

    const fromSessionId = sessionId;
    setDraft('');
    setStopped(false);
    setUnsavedMessage(null);
    setPending({ sessionId: fromSessionId, text: question });

    const call = ask({ sessionId: fromSessionId, question });
    runningCall.current = call;
    try {
      const response = await call.unwrap();
      const request: ChatMessageRequest = { question, selected: null, text: null };
      const targetSessionId = response.sessionId ?? fromSessionId;

      if (targetSessionId == null) {
        setUnsavedMessage({ messageId: `local-${Date.now()}`, messageType: 'ask', request, response, createdDate: new Date().toISOString() });
        return;
      }
      addMessage(targetSessionId, 'ask', request, response);
      // First question of a new chat: Python created the session — open it (unless the user moved on)
      if (targetSessionId !== fromSessionId && currentSessionId.current === fromSessionId) {
        await navigate(`${CHAT_ROUTE}/${targetSessionId}`);
      }
    } catch (error) {
      // Network / server error: the toast comes from the API middleware — give the text back
      if (!isAbortError(error)) setDraft(question);
    } finally {
      runningCall.current = null;
      setPending(null);
    }
  }

  async function handleReply(response: ChatResponse, selected: string | null, text: string | null): Promise<void> {
    if (sessionId == null || response.questionId == null || sending) return;

    const fromSessionId = sessionId;
    setStopped(false);
    setPending({
      sessionId: fromSessionId,
      text: describeReply(selected, text, response.options, {
        yes: t('reply.yes'),
        no: t('reply.no'),
        all: t('reply.all'),
        cancel: t('reply.cancel'),
      }),
    });

    const call = reply({
      sessionId: fromSessionId,
      questionId: response.questionId,
      newGeneratedQuestion: response.newGeneratedQuestion,
      selected,
      text,
    });
    runningCall.current = call;
    try {
      const result = await call.unwrap();
      addMessage(result.sessionId ?? fromSessionId, 'reply', { question: null, selected, text }, result);
    } catch {
      // error toast comes from the API middleware; the card stays open to try again
    } finally {
      runningCall.current = null;
      setPending(null);
    }
  }

  // Stop only stops waiting here — Python still finishes and saves the message
  function handleStop(): void {
    runningCall.current?.abort();
    runningCall.current = null;
    setPending(null);
    setStopped(true);
  }

  function handleNewChat(): void {
    setShowSessions(false);
    setStopped(false);
    setUnsavedMessage(null);
    void navigate(CHAT_ROUTE);
  }

  function handleSelectSession(id: string): void {
    setShowSessions(false);
    setStopped(false);
    setUnsavedMessage(null);
    void navigate(`${CHAT_ROUTE}/${id}`);
  }

  const sessions = sessionsQuery.data ?? [];
  const activeTitle =
    sessionId == null
      ? t('sessions.newChat')
      : (sessions.find((s) => s.sessionId === sessionId)?.title ?? savedMessages[0]?.request.question ?? '');

  return (
    <PageContainer>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-text">{t('title')}</h1>
            <p className="text-xs text-text-muted">{t('subtitle')}</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="md:hidden"
            onClick={() => { setShowSessions((v) => !v); }}
            leadingIcon={<ChatBubbleLeftRightIcon className="size-4" aria-hidden="true" />}
          >
            {showSessions ? t('sessions.hideChats') : t('sessions.showChats')}
          </Button>
        </div>

        <div className="flex h-(--layout-chat-panel-height) min-h-(--layout-chat-panel-min-height) flex-col gap-4 md:flex-row">
          <SessionList
            sessions={sessions}
            activeSessionId={sessionId}
            loading={sessionsQuery.isLoading}
            error={sessionsQuery.isError}
            now={sessionsQuery.fulfilledTimeStamp ?? 0}
            onNewChat={handleNewChat}
            onSelect={handleSelectSession}
            className={clsx(showSessions ? 'flex flex-1' : 'hidden', 'md:flex md:w-72 md:flex-none')}
          />

          <section
            className={clsx(
              'min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-surface',
              showSessions ? 'hidden md:flex' : 'flex'
            )}
          >
            <header className="flex h-12 shrink-0 items-center border-b border-border-muted px-4">
              <h2 className="truncate text-sm font-semibold text-text" title={activeTitle}>
                {activeTitle}
              </h2>
            </header>

            <Conversation
              sessionId={sessionId}
              messages={messages}
              pendingText={pendingText}
              stopped={stopped}
              loading={messagesQuery.isLoading}
              error={sessionId != null && messagesQuery.isError}
              userName={user?.name ?? null}
              onReply={(response, selected, text) => { void handleReply(response, selected, text); }}
              onAskAgain={(question) => { void handleAsk(question); }}
              onNewChat={handleNewChat}
            />

            <Composer
              value={draft}
              onChange={setDraft}
              onSend={() => { void handleAsk(draft); }}
              onStop={handleStop}
              running={sending}
              canStop={sending}
              waitingForReply={waitingForReply}
            />
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
