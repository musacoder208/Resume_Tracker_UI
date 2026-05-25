export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration: number; // always resolved
}

export interface ToastOptions {
  duration?: number;
}

export interface ToastContextType {
  showToast: (
    variant: ToastVariant,
    title: string,
    description?: string,
    options?: ToastOptions
  ) => void;

  closeToast: (id: string) => void;
}
