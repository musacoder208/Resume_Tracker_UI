import { useState, useRef, useEffect, useMemo, type JSX } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useT } from '@/i18n/useT';
import {
  BellIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  Bars3Icon,
} from '@/icons';
import { useAppSelector } from '@/hooks/reduxHooks';
import { selectIsAuthenticated } from '@/features/auth/redux/auth.selectors';
import { useGlobalSearch } from '@/hooks/useGlobalSearchContext';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { APP_MENU } from '@/app/menu/appMenu';
import type { MenuItem } from '@/app/menu/menu.types';
import { AvatarMenu } from './AvatarMenu';

// ─── Live date ────────────────────────────────────────────────────────────────

function useLiveDate(): string {
  const [date, setDate] = useState(() =>
    new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  );
  useEffect(() => {
    const interval = setInterval(() => {
      setDate(
        new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    }, 60000);
    return () => clearInterval(interval);
  }, []);
  return date;
}

// ─── MegaMenuCascade (sub-items flyout below module card) ─────────────────────

function MegaMenuCascade({
  items,
  pathname,
  onNavigate,
  t,
}: {
  items: MenuItem[];
  pathname: string;
  onNavigate: (path?: string) => void;
  t: (key: string) => string;
}): JSX.Element {
  const isActive = (path?: string): boolean =>
    Boolean(path && (pathname === path || pathname.startsWith(path + '/')));

  return (
    <>
      <div className="absolute start-0 top-full z-[59] h-1 w-full" />
      <div className="absolute start-0 top-[calc(100%+4px)] z-[60] w-56 rounded-lg border border-border-muted bg-surface p-1 shadow-xl lg:w-[350px]">
        {/* Triangle pointer */}
        <div className="absolute -top-[6px] start-4 h-0 w-0 border-x-[6px] border-b-[8px] border-x-transparent border-b-surface" />
        {items.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.path)}
              className={clsx(
                'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm',
                active ? 'bg-primary text-white font-semibold' : 'text-text hover:bg-surface-hover'
              )}
            >
              {Icon && (
                <span
                  className={clsx(
                    'flex h-4 w-4 shrink-0 items-center justify-center',
                    active ? 'text-white' : 'text-text-muted'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
              )}
              <span className="flex-1 text-start">{t(item.labelKey ?? '')}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

// ─── NavBar ───────────────────────────────────────────────────────────────────

export function NavBar(): JSX.Element {
  const { t } = useT('common');
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const liveDate = useLiveDate();

  // Mega menu state
  const [showModules, setShowModules] = useState(false);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [megaSearch, setMegaSearch] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const menuHoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Global search state
  const [searchInput, setSearchInput] = useState('');
  const { setSearchTerm } = useGlobalSearch();
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  useEffect(() => {
    setSearchTerm(debouncedSearch);
  }, [debouncedSearch, setSearchTerm]);

  // Mega menu search results — includes top-level items without children too
  const flatResults = useMemo(() => {
    const q = megaSearch.trim().toLowerCase();
    if (!q) return [];
    return APP_MENU.flatMap((mod) => {
      const hasChildren = Boolean(mod.children?.length);
      if (hasChildren) {
        return (mod.children ?? [])
          .filter((item) => (item.label ?? t(item.labelKey ?? '')).toLowerCase().includes(q))
          .map((item) => ({ item, moduleTitle: item.label ?? t(mod.labelKey ?? ''), moduleId: mod.id }));
      }
      if ((mod.label ?? t(mod.labelKey ?? '')).toLowerCase().includes(q)) {
        return [{ item: mod, moduleTitle: '', moduleId: mod.id }];
      }
      return [];
    });
  }, [megaSearch, t]);

  const openModules = (): void => {
    if (menuHoverTimeout.current) {
      clearTimeout(menuHoverTimeout.current);
      menuHoverTimeout.current = null;
    }
    setShowModules(true);
    setExpandedModule(null);
  };

  const closeModulesDelayed = (): void => {
    menuHoverTimeout.current = setTimeout(() => {
      setShowModules(false);
      setExpandedModule(null);
      setMegaSearch('');
    }, 150);
  };

  // Close mega menu on outside click
  useEffect(() => {
    if (!showModules) return;
    const handler = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowModules(false);
        setExpandedModule(null);
        setMegaSearch('');
      }
    };
    setTimeout(() => document.addEventListener('mousedown', handler), 80);
    return () => document.removeEventListener('mousedown', handler);
  }, [showModules]);

  return (
    <header className="relative z-30 flex h-14 shrink-0 items-center justify-end border-b border-border bg-surface px-6">
      {/* Left — All Modules + Search */}
      {/* {isAuthenticated && (
        <div className="flex items-center gap-4">
          <div className="relative" onMouseEnter={openModules} onMouseLeave={closeModulesDelayed}>
            <button
              type="button"
              className="flex h-10 items-center gap-2 rounded-lg border border-primary-border bg-primary-subtle px-4 text-sm font-semibold text-primary shadow-sm"
            >
              {showModules ? (
                <XMarkIcon className="h-[18px] w-[18px] text-primary" />
              ) : (
                <Bars3Icon className="h-[18px] w-[18px] text-primary" />
              )}
              {t('nav.allModules')}
              <ChevronDownIcon className="h-4 w-4 text-primary" />
            </button>
          </div>

          <div className="hidden h-11 w-[400px] items-center gap-2 rounded-lg border border-border bg-surface px-3.5 shadow-sm sm:flex lg:w-[500px]">
            <MagnifyingGlassIcon className="h-5 w-5 shrink-0 text-text-muted" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('nav.searchPlaceholder')}
              className="flex-1 border-none bg-transparent text-sm text-text placeholder:text-text-muted focus:outline-none"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="shrink-0 text-text-muted hover:text-text"
              >
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )} */}

      {/* Right — date + bell + avatar */}
      {isAuthenticated && (
        <div className="flex items-center gap-5">
          <span className="hidden text-sm text-text-muted sm:inline">{liveDate}</span>

          {/* Notification bell */}
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-subtle">
              <BellIcon className="h-[22px] w-[22px] text-text" />
            </div>
            <div className="absolute end-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-surface bg-error text-[9px] font-bold text-white">
              3
            </div>
          </div>

          {/* Avatar menu */}
          <AvatarMenu />
        </div>
      )}

      {/* All Modules Mega Menu */}
      {/* {showModules && (
        <div
          ref={menuRef}
          className="absolute inset-x-3 top-full z-[200] rounded-b-lg border border-border-muted bg-surface shadow-xl"
          onMouseEnter={openModules}
          onMouseLeave={closeModulesDelayed}
        >
          <div className="absolute -top-2 start-6 h-0 w-0 border-x-[8px] border-b-[8px] border-x-transparent border-b-primary" />

          <div className="flex items-center justify-between gap-3 rounded-t-lg bg-primary px-5 py-2.5">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-white">
                {t('nav.allModules')} ({APP_MENU.length})
              </span>
              <div className="flex h-7 w-56 items-center gap-2 rounded-md bg-white px-2.5">
                <MagnifyingGlassIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                <input
                  type="text"
                  value={megaSearch}
                  onChange={(e) => setMegaSearch(e.target.value)}
                  placeholder={t('nav.searchPlaceholder')}
                  className="flex-1 border-none bg-transparent text-xs text-gray-900 caret-gray-900 placeholder:text-gray-400 focus:outline-none"
                />
                {megaSearch && (
                  <button
                    type="button"
                    onClick={() => setMegaSearch('')}
                    className="shrink-0 text-gray-400 hover:text-gray-700"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowModules(false);
                setExpandedModule(null);
                setMegaSearch('');
              }}
              className="flex h-6 w-6 items-center justify-center rounded-md text-white/70 hover:bg-white/20 hover:text-white"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>

          {megaSearch.trim() ? (
            <div className="max-h-[60vh] overflow-y-auto px-4 py-3">
              {flatResults.length === 0 ? (
                <div className="py-10 text-center text-sm text-text-muted">
                  {t('grid.noRecords')}
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {flatResults.map(({ item, moduleTitle, moduleId }) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={`${moduleId}-${item.id}`}
                        type="button"
                        onClick={() => {
                          setShowModules(false);
                          setExpandedModule(null);
                          setMegaSearch('');
                          if (item.path) void navigate(item.path);
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-surface-hover"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-primary">
                          {Icon && <Icon className="h-4 w-4" />}
                        </span>
                        <span className="flex-1 text-sm text-text">{item.label ?? t(item.labelKey ?? '')}</span>
                        <span className="shrink-0 rounded-full bg-surface-muted px-2.5 py-0.5 text-xs text-text-muted">
                          {moduleTitle}
                        </span>
                        <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 p-5">
              {APP_MENU.map((mod) => {
                const Icon = mod.icon;
                const hasChildren = Boolean(mod.children?.length);
                return (
                  <div
                    key={mod.id}
                    className="relative"
                    onMouseEnter={() => setExpandedModule(mod.id)}
                    onMouseLeave={() => setExpandedModule(null)}
                  >
                    <div className="flex min-w-[260px] items-center rounded-lg border border-border-muted bg-background shadow-md transition-shadow hover:shadow-xl">
                      <button
                        type="button"
                        onClick={() => {
                          if (!hasChildren && mod.path) {
                            setShowModules(false);
                            void navigate(mod.path);
                          }
                        }}
                        className="flex flex-1 items-center gap-3 px-2.5 py-2"
                      >
                        {Icon && (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                            <Icon className="h-5 w-5" />
                          </div>
                        )}
                        <div className="text-start">
                          <div className="text-xs font-semibold text-text">{mod.label ?? t(mod.labelKey ?? '')}</div>
                          {hasChildren && (
                            <div className="text-xs text-text-muted">
                              {mod.children?.length} {t('nav.items')}
                            </div>
                          )}
                        </div>
                      </button>
                      {hasChildren && (
                        <div className="flex h-full items-center px-2 text-text-muted">
                          <ChevronRightIcon
                            className={clsx(
                              'h-4 w-4 transition-transform',
                              expandedModule === mod.id && 'rotate-90'
                            )}
                          />
                        </div>
                      )}
                    </div>

                    {expandedModule === mod.id && hasChildren && mod.children && (
                      <MegaMenuCascade
                        items={mod.children}
                        pathname={pathname}
                        onNavigate={(path) => {
                          setShowModules(false);
                          setExpandedModule(null);
                          if (path) void navigate(path);
                        }}
                        t={t}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )} */}
    </header>
  );
}
