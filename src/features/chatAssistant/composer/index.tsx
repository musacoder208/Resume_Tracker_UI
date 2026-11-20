import type { KeyboardEvent } from 'react';
import clsx from 'clsx';
import { Textarea } from '@/components/ui/textarea';
import { IconButton } from '@/components/ui/button';
import { PaperAirplaneIcon, StopIcon } from '@/icons';
import { useT } from '@/i18n/useT';
import { rtlFlipClass } from '@/utils/utils';

interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  /** A question is running in this chat — Send becomes ■ Stop */
  running: boolean;
  /** Stop is possible only once the running row exists on the server */
  canStop: boolean;
  /** The last question is waiting for a method / free text */
  waitingForReply: boolean;
}

/** Main question box. No character limit. Typing stays allowed while a question runs. */
export function Composer({ value, onChange, onSend, onStop, running, canStop, waitingForReply }: ComposerProps) {
  const { t } = useT('chatAssistant');
  const canSend = !running && value.trim() !== '';

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (canSend) onSend();
    }
  };

  const hint = running
    ? t('composer.hintRunning')
    : waitingForReply
      ? t('composer.hintWaiting')
      : t('composer.hint');

  return (
    <div className="border-t border-border-muted p-3">
      <div className="flex items-end gap-2 rounded-xl border border-border bg-surface p-1.5 ps-3">
        <Textarea
          id="chat-assistant-question"
          aria-label={t('composer.label')}
          rows={2}
          value={value}
          placeholder={t('composer.placeholder')}
          onChange={(e) => { onChange(e.target.value); }}
          onKeyDown={handleKeyDown}
          className="resize-none border-none px-0 focus:outline-none"
        />
        {running ? (
          <IconButton
            icon={<StopIcon className="size-5" />}
            ariaLabel={t('composer.stop')}
            title={t('composer.stop')}
            variant="secondary"
            size="md"
            disabled={!canStop}
            onClick={onStop}
          />
        ) : (
          <IconButton
            icon={<PaperAirplaneIcon className={clsx('size-5', rtlFlipClass())} />}
            ariaLabel={t('composer.send')}
            title={t('composer.send')}
            variant="primary"
            size="md"
            disabled={!canSend}
            onClick={onSend}
          />
        )}
      </div>
      <p className={clsx('mt-1 px-1 text-xs', running ? 'text-warning-text' : 'text-text-disabled')}>{hint}</p>
    </div>
  );
}
