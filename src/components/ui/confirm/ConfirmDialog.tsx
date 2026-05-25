import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import React, { useEffect, useMemo, useRef } from 'react';
import type { ConfirmOptions, ConfirmVariant } from './confirm.types';
import { ExclamationTriangleIcon, XMarkIcon } from '@/icons';

export interface ConfirmDialogProps {
  open: boolean;
  options: ConfirmOptions | null;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onAfterClose: () => void;
}

/* ---------------- variant helpers (UNCHANGED) ---------------- */

function getVariantHeaderClass(variant: ConfirmVariant): string {
  switch (variant) {
    case 'danger':
      return 'text-error';
    case 'warning':
      return 'text-warning';
    case 'info':
    default:
      return 'text-primary';
  }
}

function getConfirmButtonClass(variant: ConfirmVariant): string {
  switch (variant) {
    case 'danger':
      return 'bg-error hover:bg-error/90';
    case 'warning':
      return 'bg-primary hover:bg-primary-hover';
    case 'info':
    default:
      return 'bg-primary hover:bg-primary-hover';
  }
}

/* ---------------- constants ---------------- */

const EMPTY_OPTIONS: ConfirmOptions = {
  title: '',
  variant: 'info',
};

/* ---------------- component ---------------- */

export function ConfirmDialog({
  open,
  options,
  loading,
  onCancel,
  onConfirm,
  onAfterClose,
}: ConfirmDialogProps): React.ReactElement | null {
  // ✅ hooks MUST run unconditionally
  const safeOptions = options ?? EMPTY_OPTIONS;

  // if (!options) return null;

  const {
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'info',
    allowEnterConfirm = true,
    allowEscCancel = true,
  } = safeOptions;

  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);

  const headerClass = useMemo(() => getVariantHeaderClass(variant), [variant]);

  const confirmButtonClass = useMemo(() => getConfirmButtonClass(variant), [variant]);

  /* ---------- keyboard support (UNCHANGED) ---------- */

  useEffect(() => {
    if (!open) return;

    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Enter' && allowEnterConfirm && !loading) {
        e.preventDefault();
        onConfirm();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, allowEnterConfirm, loading, onConfirm]);

  const handleClose = (): void => {
    if (!allowEscCancel || loading) return;
    onCancel();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      className="relative z-20"
      initialFocus={cancelButtonRef}
      onTransitionEnd={() => {
        if (!open) onAfterClose(); // ✅ safe cleanup after animation
      }}
    >
      {/* Backdrop */}
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/40 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-surface px-4 pt-5 pb-4 text-start shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-md sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="absolute top-0 end-0 hidden pt-4 pe-4 sm:block">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-md bg-surface text-text-muted hover:text-primary-hover focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <span className="sr-only">Close</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>

            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-muted sm:mx-0 sm:size-10">
                <ExclamationTriangleIcon aria-hidden="true" className={`size-6 ${headerClass}`} />
                {/* <InformationCircleIcon
 aria-hidden="true"
 className="size-6 text-primary"
 /> */}
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ms-4 sm:text-start">
                {/* <DialogTitle as="h3" className="text-base font-semibold text-text">
 Deactivate account
 </DialogTitle> */}
                {/* Header */}
                <DialogTitle as="h3" className={`text-base font-semibold text-text ${headerClass}`}>
                  {title}
                </DialogTitle>
                <div className="mt-2">
                  <p className="text-sm text-text-muted">{description}</p>
                </div>
              </div>
            </div>

            {/* {description && (
 <p className="mt-2 text-sm text-text-muted">{description}</p>
 )} */}

            {/* Actions */}
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-xs sm:ms-3 sm:w-auto ${confirmButtonClass}`}
              >
                {loading ? 'Working...' : confirmText}
              </button>
              <button
                ref={cancelButtonRef}
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-surface px-3 py-2 text-sm font-semibold text-text shadow-xs border border-border hover:bg-surface-muted sm:mt-0 sm:w-auto"
              >
                {cancelText}
              </button>
            </div>

            <p className="mt-3 text-xs text-text-muted">
              {allowEnterConfirm ? 'Enter to confirm' : ''}
              {allowEnterConfirm && allowEscCancel ? ' • ' : ''}
              {allowEscCancel ? 'Esc to cancel' : ''}
            </p>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
/* ---------------- usage example (UNCHANGED) ---------------- */

// import { useConfirm } from './useConfirm';
//
// function SomeComponent() {
//   const confirm = useConfirm();
//
//   const handleDelete = async () => {
//     const confirmed = await confirm({
//       title: 'Delete Item',
//       description: 'Are you sure you want to delete this item? This action cannot be undone.',
//       variant: 'danger',
//       confirmText: 'Delete',
//       cancelText: 'Cancel',
//     });
//
//     if (confirmed) {
//       // Proceed with deletion
//     } else {
//       // Deletion cancelled
//     }
//   };
//
//   return <button onClick={handleDelete}>Delete Item</button>;
// }
/* ---------------- end usage example ---------------- */
