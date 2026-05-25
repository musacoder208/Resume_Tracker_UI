import type { JSX, TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';

type Props = {
  label?: string;
  error?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({
  label,
  error,
  id,
  className,
  rows = 3,
  ...rest
}: Props): JSX.Element {
  const textareaId = id ?? rest.name;

  return (
    <div className="w-full">
      {Boolean(label) && (
        <label
          htmlFor={textareaId}
          className="mb-1 block text-sm font-medium text-text"
        >
          {label}
        </label>
      )}

      <textarea
        id={textareaId}
        rows={rows}
        className={clsx(
          'block w-full rounded-md bg-surface px-3 py-2 text-sm text-text',
          'border border-border focus:outline-2 focus:outline-primary',
          Boolean(error) && 'border-error focus:outline-none',
          className
        )}
        {...rest}
      />

      {Boolean(error) && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}
    </div>
  );
}
