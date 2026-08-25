import { useState, useLayoutEffect, type JSX } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { ChevronRightIcon } from '@/icons';
import { useT } from '@/i18n/useT';
import type { MenuItem } from '@/app/menu/menu.types';

interface SidebarCascadeProps {
  items: MenuItem[];
  title: string;
  collapsed: boolean;
  triggerRef: HTMLDivElement | null;
  onNavigate: (path?: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function getSidebarWidth(collapsed: boolean): number {
  return collapsed ? 60 : 240;
}

export function SidebarCascade({
  items,
  title,
  collapsed,
  triggerRef,
  onNavigate,
  onMouseEnter,
  onMouseLeave,
}: SidebarCascadeProps): JSX.Element | null {
  const { t } = useT('common');
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [position, setPosition] = useState<{ top: number; left: number }>(() => {
    if (!triggerRef) return { top: 0, left: 0 };
    const rect = triggerRef.getBoundingClientRect();
    return { top: rect.top, left: getSidebarWidth(collapsed) + 4 };
  });

  useLayoutEffect(() => {
    if (!triggerRef) return;
    const compute = (): void => {
      const rect = triggerRef.getBoundingClientRect();
      setPosition({ top: rect.top, left: getSidebarWidth(collapsed) + 4 });
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [triggerRef, collapsed]);

  if (!triggerRef) return null;

  const isActive = (path?: string): boolean =>
    Boolean(path && (pathname === path || pathname.startsWith(path + '/')));

  return (
    <div
      className="fixed z-[200] w-[280px] rounded-lg bg-primary p-1 shadow-xl"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Triangle pointer */}
      <div className="absolute -start-2 top-3 h-0 w-0 border-y-[6px] border-e-[8px] border-y-transparent border-e-primary" />

      <div className="border-b border-white/20 px-3 py-2 text-sm font-bold text-white/90">
        {t(title)}
      </div>

      <div className="p-1">
        {items.map((child) => {
          const active = isActive(child.path);
          const Icon = child.icon;
          return (
            <button
              key={child.id}
              type="button"
              onClick={() => {
                if (child.path) {
                  void navigate(child.path);
                  onNavigate(child.path);
                }
              }}
              className={clsx(
                'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm',
                active
                  ? 'bg-white/20 font-semibold text-white'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              )}
            >
              {Icon && (
                <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                  <Icon className="h-4 w-4" />
                </span>
              )}
              <span className="flex-1 text-start">{t(child.labelKey ?? '')}</span>
              {child.children && child.children.length > 0 && (
                <ChevronRightIcon className="h-3 w-3 shrink-0 text-white/40" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
