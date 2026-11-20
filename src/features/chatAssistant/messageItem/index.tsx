import type { TFunction } from 'i18next';
import { Button } from '@/components/ui/button';
import { ArrowPathIcon, PlusIcon } from '@/icons';
import { useT } from '@/i18n/useT';
import type { ChatResponse, ChatMessage } from '../types/chatAssistant.types';
import { describeReply, formatChatTime, isCardStatus, isInfoStatus } from '../conversation/conversation.utils';
import { BotBubble } from '../botBubble';
import { ClarificationCard } from '../clarificationCard';
import { AnswerCard } from '../answerCard';
import { UserBubble } from '../userBubble';

interface MessageItemProps {
  message: ChatMessage;
  /** Response of the message before — used to show the label of a picked option */
  previousResponse: ChatResponse | null;
  /** This message is the open card the user can answer */
  interactive: boolean;
  sending: boolean;
  /** Option the user picked on this message's card (from the reply that follows), else null */
  answeredSelected: string | null;
  onReply: (response: ChatResponse, selected: string | null, text: string | null) => void;
  onAskAgain: (question: string) => void;
  onNewChat: () => void;
}

/** What the user sent in this message, as shown in their bubble */
function describeUserInput(message: ChatMessage, previousResponse: ChatResponse | null, t: TFunction): string {
  const { question, selected, text } = message.request;
  if (message.messageType === 'ask') return question ?? '';
  return describeReply(selected, text, previousResponse?.options ?? [], {
    yes: t('reply.yes'),
    no: t('reply.no'),
    all: t('reply.all'),
    cancel: t('reply.cancel'),
  });
}

/** One Python call: the user's input + the response */
export function MessageItem({ message, previousResponse, interactive, sending, answeredSelected, onReply, onAskAgain, onNewChat }: MessageItemProps) {
  const { t, i18n } = useT('chatAssistant');
  const { response } = message;
  const userText = describeUserInput(message, previousResponse, t);
  const askAgainQuestion = response.originalQuestion !== '' ? response.originalQuestion : (message.request.question ?? '');

  return (
    <div className="flex flex-col gap-3">
      {userText !== '' && <UserBubble text={userText} time={formatChatTime(message.createdDate, i18n.language)} />}

      {response.status === 'answer' && (
        <BotBubble>
          <AnswerCard response={response} />
        </BotBubble>
      )}

      {isCardStatus(response.status) && (
        <BotBubble tone={interactive ? 'default' : 'muted'}>
          <ClarificationCard
            messageId={message.messageId}
            response={response}
            interactive={interactive}
            sending={sending}
            answeredSelected={answeredSelected}
            onReply={(selected, text) => { onReply(response, selected, text); }}
          />
        </BotBubble>
      )}

      {isInfoStatus(response.status) && (
        <BotBubble tone="muted">
          <p className="whitespace-pre-wrap">{response.message}</p>
        </BotBubble>
      )}

      {response.status === 'cancelled' && (
        <BotBubble tone="muted">
          <p className="text-xs text-text-muted">{response.message !== '' ? response.message : t('cancelled')}</p>
        </BotBubble>
      )}

      {response.status === 'error' && (
        <BotBubble tone="error">
          <p className="font-semibold text-error">
            {t(`errors.${response.errorCode ?? 'generic'}`, { defaultValue: t('errors.generic') })}
          </p>
          <div className="mt-2">
            {response.errorCode === 'SESSION_NOT_FOUND' ? (
              <Button
                variant="secondary"
                size="xs"
                onClick={onNewChat}
                leadingIcon={<PlusIcon className="size-4" aria-hidden="true" />}
              >
                {t('actions.newChat')}
              </Button>
            ) : (
              askAgainQuestion !== '' && (
                <Button
                  variant="secondary"
                  size="xs"
                  disabled={sending}
                  onClick={() => { onAskAgain(askAgainQuestion); }}
                  leadingIcon={<ArrowPathIcon className="size-4" aria-hidden="true" />}
                >
                  {t('actions.askAgain')}
                </Button>
              )
            )}
          </div>
        </BotBubble>
      )}
    </div>
  );
}
