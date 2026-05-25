import type { ReactNode } from "react";

export type ErrorModalVariant = 'error' | 'warning' | 'info';

export type ErrorModalProps = {
  open: boolean;
  title: string;
  message?: string;
  code?: string;
  details?: unknown;
  variant?: ErrorModalVariant;
  onClose: () => void;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
};


export type BaseModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;

  /** Body content */
  children: ReactNode;

  /** Optional footer (buttons etc.) */
  footer?: ReactNode;

  /** Modal width control */
  size?: 'sm' | 'md' | 'lg' | 'xl';

  /** Disable backdrop close */
  disableBackdropClose?: boolean;
};
