import type { ComponentType } from 'react';

export interface MenuItem {
  id: string;
  labelKey: string;
  icon?: ComponentType<{ className?: string }>;
  path?: string;
  children?: MenuItem[];
}

export interface MenuGroup {
  labelKey: string;
  items: MenuItem[];
}
