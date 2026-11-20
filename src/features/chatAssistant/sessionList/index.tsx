import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import { SkeletonBlock } from '@/components/ui/loader';
import { PlusIcon } from '@/icons';
import { useT } from '@/i18n/useT';
import type { ChatSession } from '../types/chatAssistant.types';
import { groupSessions } from '../conversation/conversation.utils';

interface SessionListProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  loading: boolean;
  error: boolean;
  /** Time of the last fetch — used for the Today / Yesterday groups */
  now: number;
  onNewChat: () => void;
  onSelect: (sessionId: string) => void;
  className?: string;
}

/** Left panel: ＋ New chat + saved chats grouped by date */
export function SessionList({
  sessions,
  activeSessionId,
  loading,
  error,
  now,
  onNewChat,
  onSelect,
  className,
}: SessionListProps) {
  const { t } = useT('chatAssistant');
  const groups = groupSessions(sessions, now);

  return (
    <aside className={clsx('min-h-0 flex-col rounded-xl border border-border bg-surface', className)}>
      <div className="border-b border-border-muted p-3">
        <Button fullWidth size="sm" onClick={onNewChat} leadingIcon={<PlusIcon className="size-4" aria-hidden="true" />}>
          {t('sessions.newChat')}
        </Button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto p-2" aria-label={t('sessions.showChats')}>
        {loading && (
          <div className="flex flex-col gap-2 p-2">
            <SkeletonBlock className="h-4 w-1/3" />
            <SkeletonBlock className="h-8 w-full" />
            <SkeletonBlock className="h-8 w-full" />
            <SkeletonBlock className="h-8 w-full" />
          </div>
        )}

        {!loading && error && <p className="p-2 text-xs text-error">{t('sessions.loadError')}</p>}

        {!loading && !error && sessions.length === 0 && (
          <p className="p-2 text-xs text-text-muted">{t('sessions.empty')}</p>
        )}

        {groups.map((group) => (
          <div key={group.key} className="mb-1">
            <p className="px-2 pt-2.5 pb-1 text-xs font-semibold uppercase tracking-wide text-text-subtle">
              {t(`sessions.groups.${group.key}`)}
            </p>
            {group.sessions.map((session) => {
              const isActive = session.sessionId === activeSessionId;
              return (
                <Button
                  key={session.sessionId}
                  variant="unstyled"
                  size="xs"
                  onClick={() => { onSelect(session.sessionId); }}
                  aria-current={isActive ? 'page' : undefined}
                  title={session.title}
                  className={clsx(
                    'relative min-h-9 w-full justify-start gap-2 text-start',
                    isActive
                      ? 'bg-primary-subtle font-semibold text-primary'
                      : 'text-text-muted hover:bg-surface-hover hover:text-text'
                  )}
                >
                  {isActive && (
                    <span className="absolute start-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-e-sm bg-primary" />
                  )}
                  <span className="min-w-0 flex-1 truncate">{session.title}</span>
                </Button>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
