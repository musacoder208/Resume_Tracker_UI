import type { ToastContextType } from './toast.types';

let toastRef: ToastContextType | null = null;

export function registerToast(ref: ToastContextType): void {
  toastRef = ref;
}

export const toastService = {
  success: (title: string, desc?: string, options?: { duration?: number }): void => {
    toastRef?.showToast('success', title, desc, options);
  },

  error: (title: string, desc?: string, options?: { duration?: number }): void => {
    toastRef?.showToast('error', title, desc, options);
  },

  warning: (title: string, desc?: string, options?: { duration?: number }): void => {
    toastRef?.showToast('warning', title, desc, options);
  },

  info: (title: string, desc?: string, options?: { duration?: number }): void => {
    toastRef?.showToast('info', title, desc, options);
  },
};
