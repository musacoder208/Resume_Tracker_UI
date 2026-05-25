	//Returns toast trigger functions (showSuccess, showError).

import { useContext } from 'react';
import { ToastContext } from '@/components/ui/toast/ToastProvider';
import type { ToastContextType } from '@/components/ui/toast/toast.types';

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return ctx;
}
