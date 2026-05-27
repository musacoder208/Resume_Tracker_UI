import type { MenuItem, MenuGroup } from './menu.types';
import type { PageAccess } from '@/features/auth/types/auth.types';

export function buildMenuFromPageAccess(pageAccess: PageAccess[]): MenuItem[] {
  return [...pageAccess]
    .sort((a, b) => a.display_order - b.display_order)
    .map((page) => ({
      id: page.route,
      label: page.page_name,
      path: page.route,
    }));
}

// Static fallback — used when page_access is empty (e.g. before login resolves)
export const APP_MENU_GROUPS: MenuGroup[] = [];
export const APP_MENU: MenuItem[] = [];
