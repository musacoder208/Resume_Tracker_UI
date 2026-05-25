import { HomeIcon, DocumentTextIcon, ChartBarIcon } from '@/icons';
import type { MenuItem, MenuGroup } from './menu.types';

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    labelKey: 'nav.tabs.dashboard',
    icon: HomeIcon,
    path: '/',
  },
  {
    id: 'resumes',
    labelKey: 'nav.tabs.resumes',
    icon: DocumentTextIcon,
    path: '/resumes',
  },
  {
    id: 'demo',
    labelKey: 'nav.tabs.demo',
    icon: ChartBarIcon,
    path: '/demo',
  },
];

export const APP_MENU_GROUPS: MenuGroup[] = [{ labelKey: 'nav.sections.main', items: MENU_ITEMS }];

export const APP_MENU: MenuItem[] = MENU_ITEMS;
