import { useState, useRef, useEffect, useCallback, type JSX } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { ChevronRightIcon } from '@/icons';
import { useT } from '@/i18n/useT';
import type { MenuItem } from '@/app/menu/menu.types';
import { SidebarCascade } from './SidebarCascade';

interface SidebarItemProps {
  item: MenuItem;
  collapsed: boolean;
  onNavigate: () => void;
}

export function SidebarItem({ item, collapsed, onNavigate }: SidebarItemProps): JSX.Element {
  const { t } = useT('common');
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [isHovered, setIsHovered] = useState(false);
  const [wrapperEl, setWrapperEl] = useState<HTMLDivElement | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasChildren = Boolean(item.children?.length);

  const isActive =
    Boolean(item.path && (pathname === item.path || pathname.startsWith(item.path + '/'))) ||
    Boolean(
      item.children?.some(
        (child) => child.path && (pathname === child.path || pathname.startsWith(child.path + '/'))
      )
    );

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleHover = useCallback((): void => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
  }, []);

  const handleLeave = useCallback((): void => {
    hoverTimeoutRef.current = setTimeout(() => setIsHovered(false), 100);
  }, []);

  const handleClick = (): void => {
    if (!hasChildren && item.path) {
      void navigate(item.path);
      onNavigate();
    }
  };

  const Icon = item.icon;

  const activeClass = isHovered
    ? 'bg-white/15 text-white'
    : isActive
      ? 'bg-white/10 text-white'
      : 'text-white/80 hover:bg-white/10 hover:text-white';

  // Collapsed: icon-only with hover cascade
  if (collapsed) {
    return (
      <div
        ref={setWrapperEl}
        className="relative flex justify-center"
        onMouseEnter={handleHover}
        onMouseLeave={handleLeave}
      >
        <button
          type="button"
          onClick={handleClick}
          title={t(item.labelKey)}
          aria-label={t(item.labelKey)}
          aria-haspopup={hasChildren ? 'menu' : undefined}
          aria-expanded={hasChildren ? isHovered : undefined}
          className={clsx(
            'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
            activeClass
          )}
        >
          {Icon && <Icon className="h-[18px] w-[18px]" />}
        </button>

        {isHovered && hasChildren && item.children && (
          <SidebarCascade
            items={item.children}
            title={item.labelKey}
            collapsed={collapsed}
            triggerRef={wrapperEl}
            onNavigate={() => {
              setIsHovered(false);
              onNavigate();
            }}
            onMouseEnter={handleHover}
            onMouseLeave={handleLeave}
          />
        )}
      </div>
    );
  }

  // Expanded: full row with hover cascade for children
  return (
    <div
      ref={setWrapperEl}
      className="relative"
      onMouseEnter={handleHover}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        onClick={handleClick}
        aria-haspopup={hasChildren ? 'menu' : undefined}
        aria-expanded={hasChildren ? isHovered : undefined}
        className={clsx(
          'flex h-10 w-full items-center gap-2.5 rounded-lg px-2.5 transition-colors',
          activeClass
        )}
      >
        {isActive && (
          <div className="absolute start-0 top-1/2 h-[18px] w-[3px] -translate-y-1/2 rounded-e-sm bg-white" />
        )}
        {Icon && (
          <div
            className={clsx(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors',
              isActive ? 'bg-white/20' : 'bg-white/10'
            )}
          >
            <Icon className="h-4 w-4 text-white" />
          </div>
        )}
        <span className="flex-1 truncate text-start text-[13px] font-medium">{t(item.labelKey)}</span>
        {hasChildren && <ChevronRightIcon className="h-3 w-3 shrink-0 text-white/40" />}
      </button>

      {isHovered && hasChildren && item.children && (
        <SidebarCascade
          items={item.children}
          title={item.labelKey}
          collapsed={collapsed}
          triggerRef={wrapperEl}
          onNavigate={() => {
            setIsHovered(false);
            onNavigate();
          }}
          onMouseEnter={handleHover}
          onMouseLeave={handleLeave}
        />
      )}
    </div>
  );
}
