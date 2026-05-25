import type { ReactNode } from 'react';

export interface MenuItem {
  id: string;
  title: string;
  icon: ReactNode;
  color?: string;
  path?: string;
  items?: MenuItem[];
}

export type MenuPosition = Readonly<{
  left: number;
  top: number;
}>;

export interface MenuItemProps {
  menu: MenuItem;
  highlighted?: boolean;
  onMenuClose?: () => void;
}

export interface SubMenuProps {
  items: MenuItem[];
  position: MenuPosition;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onMenuClose?: () => void;
}

export interface SubMenuItemProps {
  item: MenuItem;
  onMenuClose?: () => void;
}
