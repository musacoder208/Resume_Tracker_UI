import type { ComponentType } from 'react';
import type { MenuItem, MenuGroup } from './menu.types';
import type { PageAccess } from '@/features/auth/types/auth.types';
import {
  HomeIcon,
  BuildingOffice2Icon,
  DocumentTextIcon,
  UsersIcon,
  ClockIcon,
} from '@/icons';

const routeIconMap: Record<string, ComponentType<{ className?: string }>> = {
  '/dashboard':       HomeIcon,
  '/company-profile': BuildingOffice2Icon,
  '/jd':              DocumentTextIcon,
  '/candidate':       UsersIcon,
};

// Temporary test-only entry for the candidate activity tracking page
// (src/features/candidateActivity) — not backed by page_access.
const TEST_MENU_ITEMS: MenuItem[] = [
  {
    id: '/candidate-activity-test',
    label: 'Candidate Activity (Test)',
    path: '/candidate-activity-test',
    icon: ClockIcon,
  },
];

export function buildMenuFromPageAccess(pageAccess: PageAccess[]): MenuItem[] {
  const items = [...pageAccess]
    .sort((a, b) => a.display_order - b.display_order)
    .map((page) => ({
      id: page.route,
      label: page.page_name,
      path: page.route,
      icon: routeIconMap[page.route],
    }));

  return [...items, ...TEST_MENU_ITEMS];
}

// Static fallback — used when page_access is empty (e.g. before login resolves)
export const APP_MENU_GROUPS: MenuGroup[] = [];
export const APP_MENU: MenuItem[] = [];
