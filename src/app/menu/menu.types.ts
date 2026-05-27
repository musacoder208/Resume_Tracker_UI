import type { ComponentType } from 'react';

export interface MenuItem {
  id: string;
  labelKey?: string;   // i18n key — for static menu items
  label?: string;      // direct string — for API-sourced menu items
  icon?: ComponentType<{ className?: string }>;
  path?: string;
  children?: MenuItem[];
}

export interface MenuGroup {
  labelKey: string;
  items: MenuItem[];
}
