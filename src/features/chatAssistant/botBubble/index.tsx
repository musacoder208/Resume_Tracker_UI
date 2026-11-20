import type { ReactNode } from 'react';
import clsx from 'clsx';
import { ExclamationTriangleIcon, SparklesIcon } from '@/icons';

type BotBubbleTone = 'default' | 'error' | 'muted';

interface BotBubbleProps {
  tone?: BotBubbleTone;
  children: ReactNode;
}

const avatarClasses: Record<BotBubbleTone, string> = {
  default: 'bg-primary-subtle text-primary',
  error: 'bg-error-subtle text-error',
  muted: 'bg-surface-muted text-text-muted',
};

const bubbleClasses: Record<BotBubbleTone, string> = {
  default: 'border-border bg-surface',
  error: 'border-error/40 bg-error-subtle',
  muted: 'border-dashed border-border bg-background',
};

/** Assistant-side message: avatar + bubble. Used for every Python step. */
export function BotBubble({ tone = 'default', children }: BotBubbleProps) {
  const Icon = tone === 'error' ? ExclamationTriangleIcon : SparklesIcon;

  return (
    <div className="flex w-full items-start gap-2.5 md:max-w-3xl">
      <span
        className={clsx('flex size-8 shrink-0 items-center justify-center rounded-lg', avatarClasses[tone])}
        aria-hidden="true"
      >
        <Icon className="size-4" />
      </span>
      <div
        className={clsx(
          'min-w-0 flex-1 rounded-xl rounded-ss-sm border px-3.5 py-3 text-sm text-text shadow-sm',
          bubbleClasses[tone]
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface BotLoadingProps {
  text: string;
}

/** "Understanding your question…" / "Preparing your answer…" */
export function BotLoading({ text }: BotLoadingProps) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-text-muted" role="status">
      <span className="size-1.5 animate-pulse rounded-full bg-text-subtle" />
      <span className="size-1.5 animate-pulse rounded-full bg-text-subtle opacity-70" />
      <span className="size-1.5 animate-pulse rounded-full bg-text-subtle opacity-40" />
      <span className="ms-1">{text}</span>
    </div>
  );
}
