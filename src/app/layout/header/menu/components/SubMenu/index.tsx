import React from 'react';
import type { SubMenuProps } from '../../utils/menu.types';
import { SubMenuItem } from '../SubMenuItem';

export const SubMenu: React.FC<SubMenuProps> = ({
  items,
  position,
  onMouseEnter,
  onMouseLeave,
  onMenuClose,
}): React.ReactElement => {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="fixed bg-surface-elevated rounded-lg shadow-xl z-[60] border border-border py-2 overflow-visible"
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
        minWidth: '250px',
      }}
    >
      {items.map((item) => (
        <SubMenuItem key={item.id} item={item} onMenuClose={onMenuClose} />
      ))}
    </div>
  );
};
