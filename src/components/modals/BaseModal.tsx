import { type ReactNode, useEffect, useRef } from 'react';
import { XMarkIcon } from '@/icons';
import { getFocusableElements } from '@/utils/focusUtils';
import { isCallable } from '@/utils/utils';


type BaseModalProps = {
  open: boolean;
  title?: string;
  onClose?: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disableBackdropClose?: boolean;
  /** Hide the default header (title + close button). Useful for custom modal layouts. */
  hideHeader?: boolean;
  /** Additional classes on the panel element (e.g. custom width). */
  panelClassName?: string;
};

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export function BaseModal({
  open,
  title,
  onClose,
  children,
  footer,
  size = 'md',
  disableBackdropClose = false,
  hideHeader = false,
  panelClassName,
}: BaseModalProps): React.ReactElement | null {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  // Focus trap + ESC
  useEffect(() => {
    if (!open || !panelRef.current) return;

    lastFocusedRef.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    const focusables = getFocusableElements(panel);
    focusables[0]?.focus();

    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape' && isCallable(onClose)) {
        e.stopPropagation();
        onClose();
      }

      if (e.key !== 'Tab') return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (first == null || last == null) return;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      lastFocusedRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!disableBackdropClose && isCallable(onClose) ? onClose : undefined}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${sizeClasses[size]} rounded-xl bg-surface border border-border text-text shadow-xl ${panelClassName ?? ''}`}
      >
        {/* Header */}
        {!hideHeader && (title != null || isCallable(onClose)) && (
          <div className="flex items-start justify-between border-b border-border px-6 py-4">
            <h3 className="text-base font-semibold text-text">{title}</h3>

            {isCallable(onClose) && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1 text-text-muted hover:bg-surface-muted"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-4">{children}</div>

        {/* Footer */}
        {footer != null && (
          <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
