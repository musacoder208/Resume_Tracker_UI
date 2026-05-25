import type { JSX, ReactNode } from 'react';
import { BaseModal } from './BaseModal';
import { Button } from '@/components/ui/button';
import { XMarkIcon } from '@/icons';

type ConfirmVariant = 'primary' | 'danger';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  icon?: ReactNode;
  title: string;
  message: string;
  /** Optional bold line below message */
  question?: string;
  cancelLabel: string;
  confirmLabel: ReactNode;
  /** Button variant for confirm action. Default 'primary'. */
  confirmVariant?: ConfirmVariant;
  /** Additional className for the confirm button */
  confirmClassName?: string;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  icon,
  title,
  message,
  question,
  cancelLabel,
  confirmLabel,
  confirmVariant = 'primary',
  confirmClassName,
}: ConfirmModalProps): JSX.Element | null {
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      hideHeader
      panelClassName="w-[90%] sm:w-[527px] !max-w-none"
    >
      <div className="flex flex-col gap-5">
        {/* Header: icon + close */}
        <div className="flex items-start justify-between">
          {icon != null ? (
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border-[1.5px] border-primary bg-primary-subtle/10">
              {icon}
            </div>
          ) : (
            <div />
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface text-text-muted hover:bg-surface-muted"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Title — 20px, primary */}
        <h3 className="text-xl font-bold text-primary">{title}</h3>

        {/* Body — 14px */}
        <div>
          <p className="text-sm leading-relaxed text-text-muted">{message}</p>
          {question != null && question !== '' && (
            <p className="mt-4 text-[13px] font-semibold text-text">{question}</p>
          )}
        </div>

        {/* Actions — space-between */}
        <div className="flex justify-between gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} className={confirmClassName}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
