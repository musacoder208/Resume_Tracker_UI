import { useRef, useEffect, useMemo, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { ChevronLeftIcon, ChevronRightIcon, ArrowRightOnRectangleIcon } from '@/icons';
import { useT } from '@/i18n/useT';
import { useAppSelector, useAppDispatch } from '@/hooks/reduxHooks';
import { useLogoutMutation } from '@/features/auth/api/auth.api';
import { clearAuthContext } from '@/features/auth/redux/auth.slice';
import { selectUser, selectPageAccess } from '@/features/auth/redux/auth.selectors';
import { clearActiveSession } from '@/utils/authSession';
import { applyTheme } from '@/theme/applyTheme';
import { getStoredTheme, clearStoredTheme } from '@/utils/themeStorage';
import { buildMenuFromPageAccess } from '@/app/menu/appMenu';
import { SidebarItem } from './SidebarItem';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps): JSX.Element {
  const { t } = useT('common');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const pageAccess = useAppSelector(selectPageAccess);
  const [logout] = useLogoutMutation();
  const navRef = useRef<HTMLDivElement>(null);

  const menuItems = useMemo(() => buildMenuFromPageAccess(pageAccess), [pageAccess]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleSignOut = (): void => {
    void (async (): Promise<void> => {
      try {
        await logout().unwrap();
      } finally {
        clearActiveSession();
        dispatch(clearAuthContext());
        clearStoredTheme();
        applyTheme(getStoredTheme());
        await navigate('/login', { replace: true });
      }
    })();
  };

  return (
    <div
      className={clsx(
        'relative z-50 flex h-screen shrink-0 flex-col overflow-visible border-e border-border bg-surface shadow-sm transition-all duration-200',
        collapsed ? 'w-[60px]' : 'w-[240px]'
      )}
    >
      {/* Collapse / Expand toggle */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
        className="absolute -end-3 top-[52px] z-60 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface shadow-md"
      >
        {collapsed ? (
          <ChevronRightIcon className="h-3 w-3 text-text-muted" />
        ) : (
          <ChevronLeftIcon className="h-3 w-3 text-text-muted" />
        )}
      </button>

      {/* Logo */}
      <div className={clsx('flex h-16 shrink-0 items-center gap-3', collapsed ? 'justify-center px-3' : 'px-4')}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-subtle">
          <span className="text-xs font-bold tracking-widest text-primary">RT</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-sm font-bold text-text">Resume Tracker</div>
          </div>
        )}
      </div>

      <div className="h-px shrink-0 bg-border" />

      {/* Nav — scrollable */}
      <nav
        ref={navRef}
        className={clsx('flex-1 overflow-y-auto overflow-x-hidden', collapsed ? 'px-2 py-3' : 'px-3 py-3')}
      >
        <div className="flex flex-col gap-1">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              collapsed={collapsed}
              onNavigate={() => {}}
            />
          ))}
        </div>
      </nav>

      <div className="h-px shrink-0 bg-border" />

      {/* Footer */}
      <div
        className={clsx(
          'flex h-14 shrink-0 items-center gap-3',
          collapsed ? 'justify-center px-2' : 'px-3.5'
        )}
      >
        {!collapsed && (
          <>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-xs font-bold text-primary">
              U
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-bold text-text">
                {user != null ? `User #${user.userId}` : '—'}
              </div>
            </div>
          </>
        )}
        <button
          type="button"
          onClick={handleSignOut}
          title={t('nav.signOut')}
          aria-label={t('nav.signOut')}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
        >
          <ArrowRightOnRectangleIcon className="h-[18px] w-[18px]" />
        </button>
      </div>
    </div>
  );
}
