import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { SkeletonBlock } from '@/components/ui/loader';
import { SparklesIcon } from '@/icons';
import { useT } from '@/i18n/useT';
import type { ChatResponse, ChatMessage } from '../types/chatAssistant.types';
import { isCardStatus } from './conversation.utils';
import { MessageItem } from '../messageItem';
import { BotBubble, BotLoading } from '../botBubble';
import { UserBubble } from '../userBubble';

const SUGGESTION_KEYS = ['uploadedToday', 'aiCost', 'shortlisted', 'followUps'] as const;

interface ConversationProps {
  sessionId: string | null;
  messages: ChatMessage[];
  /** Text sent from this tab while Python is answering (null when nothing is running) */
  pendingText: string | null;
  /** The user pressed Stop on the last call */
  stopped: boolean;
  loading: boolean;
  error: boolean;
  userName: string | null;
  onReply: (response: ChatResponse, selected: string | null, text: string | null) => void;
  onAskAgain: (question: string) => void;
  onNewChat: () => void;
}

export function Conversation({
  sessionId,
  messages,
  pendingText,
  stopped,
  loading,
  error,
  userName,
  onReply,
  onAskAgain,
  onNewChat,
}: ConversationProps) {
  const { t } = useT('chatAssistant');
  const endRef = useRef<HTMLDivElement | null>(null);
  const sending = pendingText != null;

  // Scroll when something visible changes
  const scrollKey = `${messages.length}|${pendingText ?? ''}|${String(stopped)}`;
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [scrollKey]);

  // Only the last message can be an open card, and only while nothing is running
  const lastMessage = messages.at(-1);
  const openCardMessageId =
    lastMessage != null && isCardStatus(lastMessage.response.status) && !sending ? lastMessage.messageId : null;

  const isEmpty = sessionId == null && messages.length === 0 && pendingText == null;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto bg-background px-3 py-4 sm:px-6">
      {isEmpty && (
        <div className="m-auto flex w-full max-w-xl flex-col items-center gap-2 text-center">
          <span className="mb-2 flex size-14 items-center justify-center rounded-2xl bg-primary-subtle text-primary">
            <SparklesIcon className="size-7" aria-hidden="true" />
          </span>
          <h2 className="text-base font-semibold text-text">
            {userName != null && userName !== ''
              ? t('welcome.greeting', { name: userName })
              : t('welcome.greetingNoName')}
          </h2>
          <p className="text-xs text-text-muted">{t('welcome.description')}</p>
          <div className="mt-4 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
            {SUGGESTION_KEYS.map((key) => (
              <Button
                key={key}
                variant="secondary"
                size="sm"
                className="justify-start rounded-xl text-start text-xs"
                onClick={() => { onAskAgain(t(`welcome.suggestions.${key}`)); }}
              >
                {t(`welcome.suggestions.${key}`)}
              </Button>
            ))}
          </div>
        </div>
      )}

      {loading && messages.length === 0 && (
        <div className="flex flex-col gap-3">
          <SkeletonBlock className="h-10 w-1/2 self-end" />
          <SkeletonBlock className="h-24 w-3/4" />
        </div>
      )}

      {error && <p className="m-auto text-xs text-error">{t('errors.chatNotFound')}</p>}

      {messages.map((message, index) => {
        const nextMessage = messages.at(index + 1);
        return (
          <MessageItem
            key={message.messageId}
            message={message}
            previousResponse={index > 0 ? messages[index - 1].response : null}
            interactive={message.messageId === openCardMessageId}
            sending={sending}
            answeredSelected={nextMessage?.messageType === 'reply' ? nextMessage.request.selected : null}
            onReply={onReply}
            onAskAgain={onAskAgain}
            onNewChat={onNewChat}
          />
        );
      })}

      {pendingText != null && (
        <div className="flex flex-col gap-3">
          {pendingText !== '' && <UserBubble text={pendingText} />}
          <BotBubble>
            <BotLoading text={t('status.thinking')} />
          </BotBubble>
        </div>
      )}

      {stopped && pendingText == null && (
        <BotBubble tone="muted">
          <p className="text-xs text-text-muted">{t('errors.stopped')}</p>
        </BotBubble>
      )}

      <div ref={endRef} />
    </div>
  );
}
