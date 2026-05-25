import React, { useRef } from 'react';
import { ChevronRightIcon as ChevronRight } from '@/icons';
import { useNavigate } from 'react-router-dom';
import type { SubMenuItemProps } from '../../utils/menu.types';
import { SubMenu } from '../SubMenu';
import { useHoverMenu, useSubmenuPosition } from '../../utils/menu.hooks';

export const SubMenuItem: React.FC<SubMenuItemProps> = ({
  item,
  onMenuClose,
}): React.ReactElement => {
  const itemRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { position, calculatePosition } = useSubmenuPosition(itemRef);
  const { showSubmenu, handleMouseEnter, handleMouseLeave, clearHoverTimeout } = useHoverMenu();

  React.useEffect(() => {
    if (showSubmenu) {
      calculatePosition();
    }
  }, [showSubmenu, calculatePosition]);

  const onMouseEnter = (): void => {
    if (item.items && item.items.length > 0) {
      handleMouseEnter(calculatePosition);
    }
  };

  const handleClick = (): void => {
    if (item.path) {
      void navigate(item.path);
      onMenuClose?.();
    }
  };

  return (
    <>
      <div
        ref={itemRef}
        onMouseEnter={onMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="px-4 py-2 hover:bg-surface-hover cursor-pointer flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="p-1">{item.icon}</div>
          <span className="text-sm text-text">{item.title}</span>
        </div>
        {item.items && item.items.length > 0 && (
          <ChevronRight className="w-3 h-3 text-text-muted" />
        )}
      </div>

      {showSubmenu && item.items && item.items.length > 0 && (
        <SubMenu
          items={item.items}
          position={position}
          onMouseEnter={clearHoverTimeout}
          onMouseLeave={handleMouseLeave}
          onMenuClose={onMenuClose}
        />
      )}
    </>
  );
};
