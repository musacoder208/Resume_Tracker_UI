import type { InputHTMLAttributes, JSX } from 'react';
import clsx from 'clsx';

type Props = {
  label: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function Radio({
  label,
  id,
  className,
  ...rest
}: Props): JSX.Element {
  const radioId = id ?? rest.value?.toString();

  return (
    <label
      htmlFor={radioId}
      className="flex items-center gap-2 text-sm text-text cursor-pointer"
    >
      <input
        id={radioId}
        type="radio"
        className={clsx(
          'appearance-none rounded-full border border-border bg-surface',
          'checked:border-primary checked:bg-primary',
          'focus-visible:outline-2 focus-visible:outline-primary',
          'size-4',
          className
        )}
        {...rest}
      />
      {label}
    </label>
  );
}
