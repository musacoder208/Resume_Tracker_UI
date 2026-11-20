import { useState, type KeyboardEvent } from 'react';
import clsx from 'clsx';
import { Radio } from '@/components/ui/radio/Radio';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CheckIcon, PaperAirplaneIcon, XMarkIcon } from '@/icons';
import { useT } from '@/i18n/useT';
import { rtlFlipClass } from '@/utils/utils';
import type { ChatResponse } from '../types/chatAssistant.types';
import { REPLY_SELECTED } from '../conversation/conversation.utils';
import { ResponseDetails } from '../responseDetails';

interface ClarificationCardProps {
  /** Unique per message — used for input ids */
  messageId: string;
  response: ChatResponse;
  /** Only the last open card of the chat can be answered */
  interactive: boolean;
  sending: boolean;
  /** Option the user already picked for this card (request.selected of the reply that follows) */
  answeredSelected: string | null;
  onReply: (selected: string | null, text: string | null) => void;
}

/** Python asked the user something: confirm (yes / no), select (options) or clarify (text) */
export function ClarificationCard({ messageId, response, interactive, sending, answeredSelected, onReply }: ClarificationCardProps) {
  const { t } = useT('chatAssistant');
  const [text, setText] = useState('');
  const [showChange, setShowChange] = useState(false);
  // Option clicked on this card — shown filled only while its reply is being sent
  // (if the reply fails, sending ends and the radio clears so the user can pick again)
  const [pickedId, setPickedId] = useState<string | null>(null);
  const checkedId = interactive ? (sending ? pickedId : null) : answeredSelected;

  const enabled = interactive && !sending;
  const { status } = response;

  // confirm "No" and select "None of these" send selected "no"; clarify sends null
  const textSelected = status === 'clarify' ? null : REPLY_SELECTED.no;
  const showTextBox =
    interactive && (status === 'clarify' || status === 'select' || (status === 'confirm' && showChange));
  const textLabel =
    status === 'confirm'
      ? t('card.changeLabel')
      : status === 'select'
        ? t('card.noneOfTheseLabel')
        : null;
  const textPlaceholder =
    status === 'confirm'
      ? t('card.changePlaceholder')
      : status === 'select'
        ? t('card.noneOfThesePlaceholder')
        : t('card.clarifyPlaceholder');

  // confirm buttons come from Python's options (e.g. "Yes, create the query" / "No, change something");
  // the plain Yes / No labels are only a fallback when no options are sent
  const confirmOptions =
    response.options.length > 0
      ? response.options
      : [
          { id: REPLY_SELECTED.yes, label: t('card.yes') },
          { id: REPLY_SELECTED.no, label: t('card.no') },
        ];

  const canSendText = enabled && text.trim() !== '';

  const sendText = (): void => {
    if (!canSendText) return;
    onReply(textSelected, text.trim());
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      sendText();
    }
  };

  return (
    <div className={clsx('flex flex-col gap-2', !interactive && 'opacity-70')}>
      {response.message !== '' && <p className="whitespace-pre-wrap">{response.message}</p>}

      {status === 'confirm' && response.newGeneratedQuestion != null && (
        <p className="rounded-md border-s-4 border-primary bg-surface-muted px-3 py-2 font-medium">
          {response.newGeneratedQuestion}
        </p>
      )}

      {response.needsCorrection && (
        <ResponseDetails
          correctionReason={response.correctionReason}
          assumptions={response.assumptions}
          notes={response.notes}
        />
      )}

      {status === 'confirm' && interactive && !showChange && (
        <div className="flex flex-wrap gap-2">
          {confirmOptions.map((option) =>
            option.id === REPLY_SELECTED.no ? (
              <Button
                key={option.id}
                variant="secondary"
                size="sm"
                disabled={!enabled}
                onClick={() => { setShowChange(true); }}
              >
                {option.label}
              </Button>
            ) : (
              <Button
                key={option.id}
                size="sm"
                disabled={!enabled}
                onClick={() => { onReply(option.id, null); }}
                leadingIcon={option.id === REPLY_SELECTED.yes ? <CheckIcon className="size-4" aria-hidden="true" /> : undefined}
              >
                {option.label}
              </Button>
            )
          )}
        </div>
      )}

      {status === 'select' && response.options.length > 0 && (
        <div className="flex flex-col gap-1.5" role="radiogroup">
          {response.options.map((option) => (
            <div
              key={option.id}
              className={clsx(
                'rounded-lg border border-border bg-surface px-3 py-2 transition-colors',
                enabled && 'hover:border-primary hover:bg-primary-subtle'
              )}
            >
              <Radio
                id={`chat-option-${messageId}-${option.id}`}
                name={`chat-options-${messageId}`}
                value={option.id}
                label={option.label}
                checked={checkedId === option.id}
                disabled={!enabled}
                onChange={() => {
                  setPickedId(option.id);
                  onReply(option.id, null);
                }}
              />
            </div>
          ))}
        </div>
      )}

      {showTextBox && (
        <div className="mt-1 flex flex-col gap-1.5">
          {textLabel != null && (
            <label htmlFor={`chat-reply-text-${messageId}`} className="text-xs font-semibold text-text">
              {textLabel}
            </label>
          )}
          <div className="flex items-end gap-2">
            <Textarea
              id={`chat-reply-text-${messageId}`}
              rows={1}
              value={text}
              placeholder={textPlaceholder}
              disabled={!enabled}
              onChange={(e) => { setText(e.target.value); }}
              onKeyDown={handleKeyDown}
              className="resize-none"
            />
            <Button
              size="sm"
              disabled={!canSendText}
              onClick={sendText}
              leadingIcon={<PaperAirplaneIcon className={clsx('size-4', rtlFlipClass())} aria-hidden="true" />}
            >
              {t('card.send')}
            </Button>
          </div>
        </div>
      )}

      {interactive && (
        <div>
          <Button
            variant="outline"
            size="xs"
            disabled={!enabled}
            onClick={() => { onReply(REPLY_SELECTED.cancel, null); }}
            leadingIcon={<XMarkIcon className="size-4" aria-hidden="true" />}
          >
            {t('card.cancel')}
          </Button>
        </div>
      )}
    </div>
  );
}
