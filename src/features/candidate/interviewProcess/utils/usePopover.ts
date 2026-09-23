import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

export interface PopoverPosition {
  top: number;
  left: number;
  width: number;
}

/**
 * Shared positioning + outside-click logic for portaled dropdown panels
 * (CalendarPicker, TimePicker, InterviewerPicker), modeled on the
 * `AutocompleteSelect` pattern: portal to body, `fixed` position computed
 * from the trigger's bounding rect, close via a document mousedown listener
 * (no backdrop element, so nothing can swallow clicks or need its own z-index).
 */
export function usePopover<TriggerEl extends HTMLElement = HTMLButtonElement>(
  open: boolean,
  onClose: () => void
): {
  pos: PopoverPosition;
  triggerRef: RefObject<TriggerEl | null>;
  panelRef: RefObject<HTMLDivElement | null>;
} {
  const [pos, setPos] = useState<PopoverPosition>({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<TriggerEl>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((): void => {
    if (triggerRef.current == null) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return (): void => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent): void => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) === true || panelRef.current?.contains(target) === true) {
        return;
      }
      onClose();
    };
    document.addEventListener('mousedown', handler);
    return (): void => { document.removeEventListener('mousedown', handler); };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onClose intentionally not tracked to avoid re-subscribing on every render
  }, [open]);

  return { pos, triggerRef, panelRef };
}
