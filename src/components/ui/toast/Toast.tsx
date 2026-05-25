import { useCallback, useEffect, useRef, useState, type JSX } from 'react';
import { Transition } from '@headlessui/react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@/icons';
import type { ToastItem } from './toast.types';

const ICONS = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
};

const COLORS = {
  success: 'text-success',
  error: 'text-error',
  warning: 'text-warning',
  info: 'text-primary',
};

const BAR_COLORS = {
  success: 'bg-success',
  error: 'bg-error',
  warning: 'bg-warning',
  info: 'bg-primary',
};

type Props = {
  toast: ToastItem;
  onClose: () => void;
};

export function Toast({ toast, onClose }: Props): JSX.Element {
  const Icon = ICONS[toast.variant];
  const timerRef = useRef<number | null>(null);
  const remainingRef = useRef(toast.duration);
  const startRef = useRef<number>(0);
  const [paused, setPaused] = useState(false);

  const startTimer = useCallback((): void => {
    if (toast.duration === 0) return;

    startRef.current = Date.now();
    timerRef.current = window.setTimeout(onClose, remainingRef.current);
  }, [toast.duration, onClose]);

  const pauseTimer = (): void => {
    if (timerRef.current == null) return;

    window.clearTimeout(timerRef.current);
    remainingRef.current -= Date.now() - startRef.current;
    setPaused(true);
  };

  const resumeTimer = (): void => {
    setPaused(false);
    startTimer();
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current != null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [startTimer]);

  return (
    <Transition
      appear
      show
      enter="transition ease-out duration-300"
      enterFrom="opacity-0 translate-y-2 sm:translate-x-2"
      enterTo="opacity-100 translate-y-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div
        onMouseEnter={pauseTimer}
        onMouseLeave={resumeTimer}
        className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-surface shadow-lg outline outline-1 outline-border"
      >
        <div className="p-4">
          <div className="flex items-start">
            <Icon className={`size-6 shrink-0 ${COLORS[toast.variant]}`} />
            <div className="ms-3 flex-1">
              <p className="text-sm font-medium text-text">{toast.title}</p>
              {toast.description != null && toast.description !== '' && (
                <p className="mt-1 text-sm text-text-muted">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onClose()}
              className="ms-4 inline-flex rounded-md text-text-muted hover:text-text-muted focus:outline-2 focus:outline-offset-2 focus:outline-none"
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="size-5" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {toast.duration > 0 && (
          <div className="h-[3px] w-full bg-border-muted">
            <div
              className={`h-full origin-[start] ${BAR_COLORS[toast.variant]}`}
              style={{
                animation: `toast-progress ${toast.duration}ms linear forwards`,
                animationPlayState: paused ? 'paused' : 'running',
              }}
            />
          </div>
        )}
      </div>
    </Transition>
  );
}
