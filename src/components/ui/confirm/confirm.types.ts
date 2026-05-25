export type ConfirmVariant = "info" | "warning" | "danger";

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;

  /**
   * If provided, it will run when user confirms.
   * Dialog will show loading state until it resolves.
   * If it throws/rejects, dialog stays open (so you can show toast).
   */
  onConfirm?: () => Promise<void> | void;

  /**
   * If true, Enter key triggers confirm (default true)
   */
  allowEnterConfirm?: boolean;

  /**
   * If true, Esc key cancels (default true)
   * (Headless UI already calls onClose on Esc)
   */
  allowEscCancel?: boolean;
}

export type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;
