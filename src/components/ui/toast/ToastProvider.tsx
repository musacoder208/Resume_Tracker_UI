import { createContext, useCallback, useEffect, useRef, useState, type JSX } from 'react';
import type { ToastContextType, ToastItem, ToastVariant } from './toast.types';
import { Toast } from './Toast';
import { DEFAULT_DURATIONS, TOAST_STACK_LIMIT } from './toast.config';
import { registerToast } from './toastService';
import { useDirection } from '@/hooks/useDirection';

// eslint-disable-next-line react-refresh/only-export-components
export const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const dir = useDirection();

  const [visible, setVisible] = useState<ToastItem[]>([]);
  const queueRef = useRef<ToastItem[]>([]);

  const showNextFromQueue = useCallback(() => {
    if (queueRef.current.length === 0) return;

    setVisible((current) => {
      if (current.length >= TOAST_STACK_LIMIT) return current;

      const next = queueRef.current.shift();
      return next ? [...current, next] : current;
    });
  }, []);

  const closeToast = useCallback(
    (id: string) => {
      setVisible((current) => current.filter((t) => t.id !== id));
      showNextFromQueue();
    },
    [showNextFromQueue]
  );

  const showToast = useCallback(
    (
      variant: ToastVariant,
      title: string,
      description?: string,
      options?: { duration?: number }
    ) => {
      const id =
        typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const toast: ToastItem = {
        id,
        variant,
        title,
        description,
        duration: options?.duration ?? DEFAULT_DURATIONS[variant] ?? 4000,
      };

      setVisible((current) => {
        if (current.length < TOAST_STACK_LIMIT) {
          return [...current, toast];
        }

        queueRef.current.push(toast);
        return current;
      });
    },
    []
  );

  useEffect(() => {
    registerToast({ showToast, closeToast });
  }, [showToast, closeToast]);

  return (
    <ToastContext.Provider value={{ showToast, closeToast }}>
      {children}

      <div
        aria-live="assertive"
        className={`pointer-events-none fixed inset-0 z-50 flex px-4 py-6 sm:p-6 ${
          dir === 'rtl' ? 'items-start justify-start' : 'items-start justify-end'
        }`}
      >
        <div className="flex w-full max-w-sm flex-col space-y-4">
          {visible.map((toast) => (
            <Toast key={toast.id} toast={toast} onClose={() => closeToast(toast.id)} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
