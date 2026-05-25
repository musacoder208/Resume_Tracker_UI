import type { MenuPosition } from './menu.types';
import { useState, useRef, useEffect, useCallback, type RefObject } from 'react';

export const usePopoverPosition = (
  isOpen: boolean,
  buttonRef: RefObject<HTMLButtonElement | null>
): MenuPosition => {
  const [position, setPosition] = useState<MenuPosition>(() => ({
    left: 0,
    top: 0,
  }));

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const popoverWidth = 1400;

      let left = buttonRect.left;

      // Adjust if popover would go outside viewport
      if (left + popoverWidth > viewportWidth) {
        left = Math.max(10, viewportWidth - popoverWidth - 10);
      }

      setPosition({
        left: left,
        top: buttonRect.bottom + 8,
      });
    }
  }, [isOpen, buttonRef]);

  return position;
};

export const useSubmenuPosition = (
  itemRef: RefObject<HTMLDivElement | null>
): { position: MenuPosition; calculatePosition: () => void } => {
  const [position, setPosition] = useState<MenuPosition>({ left: 0, top: 0 });

  const calculatePosition = useCallback((): void => {
    if (itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const submenuWidth = 250;

      let left = rect.right + 5;

      // If submenu would go outside viewport, position it on the left side
      if (left + submenuWidth > viewportWidth) {
        left = rect.left - submenuWidth - 5;
      }

      setPosition({
        left: left,
        top: rect.top,
      });
    }
  }, [itemRef]);

  return { position, calculatePosition };
};

export const useHoverMenu = (): {
  showSubmenu: boolean;
  handleMouseEnter: (callback?: () => void) => void;
  handleMouseLeave: () => void;
  clearHoverTimeout: () => void;
} => {
  const [showSubmenu, setShowSubmenu] = useState(false);
  // const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (callback?: () => void): void => {
    if (hoverTimeoutRef.current != null) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setShowSubmenu(true);
    callback?.();
  };

  const handleMouseLeave = (): void => {
    hoverTimeoutRef.current = setTimeout(() => {
      setShowSubmenu(false);
    }, 100);
  };

  const clearHoverTimeout = (): void => {
    if (hoverTimeoutRef.current != null) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  useEffect(() => {
    return (): void => {
      clearHoverTimeout();
    };
  }, []);

  return {
    showSubmenu,
    handleMouseEnter,
    handleMouseLeave,
    clearHoverTimeout,
  } as const;
};
