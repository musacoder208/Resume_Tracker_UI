import type { ComponentType } from 'react';
import type { MenuItem, MenuGroup } from './menu.types';
import type { PageAccess } from '@/features/auth/types/auth.types';
import {
  HomeIcon,
  BuildingOffice2Icon,
  DocumentTextIcon,
  UsersIcon,
} from '@/icons';

const routeIconMap: Record<string, ComponentType<{ className?: string }>> = {
  '/dashboard':       HomeIcon,
  '/company-profile': BuildingOffice2Icon,
  '/jd':              DocumentTextIcon,
  '/candidate':       UsersIcon,
};

export function buildMenuFromPageAccess(pageAccess: PageAccess[]): MenuItem[] {
  return [...pageAccess]
    .sort((a, b) => a.display_order - b.display_order)
    .map((page) => ({
      id: page.route,
      label: page.page_name,
      path: page.route,
      icon: routeIconMap[page.route],
    }));
}

// Static fallback — used when page_access is empty (e.g. before login resolves)
export const APP_MENU_GROUPS: MenuGroup[] = [];
export const APP_MENU: MenuItem[] = [];
