import type { JSX, ReactNode } from 'react';
// import clsx from 'clsx';

type Props = {
  label?: ReactNode;
  error?: string;
  required?: boolean;
  description?: string;
  descriptionClassName?: string;
  children: ReactNode;
};

export function FormField({ label, error, required, description, descriptionClassName, children }: Props): JSX.Element {
  return (
    <div className="space-y-1">
      {Boolean(label) && (
        <label className="text-xs font-medium text-label">
          {label}
          {required && <span className="ms-1 text-error">*</span>}
        </label>
      )}

      {children}

      {Boolean(description) && <p className={descriptionClassName ?? 'text-xs text-text-muted'}>{description}</p>}

      {Boolean(error) && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
