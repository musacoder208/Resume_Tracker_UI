import type { InputHTMLAttributes, JSX, ReactNode } from 'react';
import clsx from 'clsx';

type Props = {
  onIcon?: ReactNode;
  offIcon?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

export function Switch({
  onIcon,
  offIcon,
  className,
  ...rest
}: Props): JSX.Element {
  return (
    <label className="group relative inline-flex w-11 shrink-0 cursor-pointer rounded-full bg-background p-0.5 transition-colors has-checked:bg-primary">
      <span className="relative size-5 rounded-full bg-surface shadow border border-border transition-transform group-has-checked:translate-x-5">
        {Boolean(offIcon) && (
          <span className="absolute inset-0 flex items-center justify-center opacity-100 transition group-has-checked:opacity-0">
            {offIcon}
          </span>
        )}
        {Boolean(onIcon) && (
          <span className="absolute inset-0 flex items-center justify-center opacity-0 transition group-has-checked:opacity-100">
            {onIcon}
          </span>
        )}
      </span>

      <input
        type="checkbox"
        className={clsx(
          'absolute inset-0 size-full appearance-none focus:outline-none',
          className
        )}
        {...rest}
      />
    </label>
  );
}
