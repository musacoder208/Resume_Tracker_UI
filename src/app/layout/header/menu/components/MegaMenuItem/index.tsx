import React, { useRef } from 'react';
import { ChevronRightIcon as ChevronRight } from '@/icons';
import type { MenuItemProps } from '../../utils/menu.types';
import { SubMenu } from '../SubMenu';
import { useHoverMenu, useSubmenuPosition } from '../../utils/menu.hooks';

export const MenuItem: React.FC<MenuItemProps> = ({
  menu,
  highlighted = false,
  onMenuClose,
}): React.ReactElement => {
  const itemRef = useRef<HTMLDivElement>(null);
  const { position, calculatePosition } = useSubmenuPosition(itemRef);
  const { showSubmenu, handleMouseEnter, handleMouseLeave, clearHoverTimeout } = useHoverMenu();

  React.useEffect(() => {
    if (showSubmenu) {
      calculatePosition();
    }
  }, [showSubmenu, calculatePosition]);

  const onMouseEnter = (): void => {
    if (menu.items && menu.items.length > 0) {
      handleMouseEnter(calculatePosition);
    }
  };

  return (
    <div className="mb-2 relative">
      <div
        ref={itemRef}
        onMouseEnter={onMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors cursor-pointer ${
          highlighted
            ? 'bg-surface-hover ring-1 ring-primary'
            : 'bg-surface-muted hover:bg-surface-hover'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded ${menu.color}`}>{menu.icon}</div>
          <span className="font-medium text-text text-sm">{menu.title}</span>
        </div>
        {menu.items && menu.items.length > 0 && (
          <ChevronRight className="w-4 h-4 text-text-muted" />
        )}
      </div>

      {showSubmenu && menu.items && menu.items.length > 0 && (
        <SubMenu
          items={menu.items}
          position={position}
          onMouseEnter={clearHoverTimeout}
          onMouseLeave={handleMouseLeave}
          onMenuClose={onMenuClose}
        />
      )}
    </div>
  );
};
