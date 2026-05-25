import type { MenuItem as BackendMenuItem } from '@/app/menu/menu.types';
import type { MenuItem as LayoutMenuItem } from './menu.types';

const normalizePath = (path: string): string => path.trim().replace(/\/+$/, '').toLowerCase();

export function collectAllowedPaths(menu: BackendMenuItem[]): Set<string> {
  const allowed = new Set<string>();

  const walk = (items: BackendMenuItem[]): void => {
    items.forEach((item) => {
      if (item.route) {
        allowed.add(normalizePath(item.route));
      }
      if (item.children && item.children.length > 0) {
        walk(item.children);
      }
    });
  };

  walk(menu);
  return allowed;
}

function filterItem(item: LayoutMenuItem, allowedPaths: Set<string>): LayoutMenuItem | undefined {
  const filteredChildren = item.items
    ?.map((child) => filterItem(child, allowedPaths))
    .filter((child): child is LayoutMenuItem => Boolean(child));

  const matchesRoute = item.path ? allowedPaths.has(normalizePath(item.path)) : false;
  const hasVisibleChildren = Boolean(filteredChildren?.length);

  if (!matchesRoute && !hasVisibleChildren) {
    return undefined;
  }

  return {
    ...item,
    items: filteredChildren,
  };
}

export function filterMenuByAllowedPaths(
  layoutMenu: LayoutMenuItem[],
  allowedPaths: Set<string>
): Array<LayoutMenuItem | undefined> {
  return layoutMenu.map((item) => filterItem(item, allowedPaths));
}
