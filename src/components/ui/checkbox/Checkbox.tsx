import { useEffect, useId, useRef } from 'react';
import type { InputHTMLAttributes, JSX } from 'react';
import clsx from 'clsx';

type Props = {
  label?: string;
  description?: string;
  error?: string;
  /** Partly-checked state (e.g. "select all" when only some rows are selected) */
  indeterminate?: boolean;
} & InputHTMLAttributes<HTMLInputElement>;

export function Checkbox({
  label,
  description,
  error,
  indeterminate = false,
  id,
  className,
  ...rest
}: Props): JSX.Element {
  const autoId = useId();
  const checkboxId = id ?? rest.name ?? autoId;
  const inputRef = useRef<HTMLInputElement>(null);

  // `indeterminate` is a DOM property only — it has no HTML attribute.
  useEffect(() => {
    if (inputRef.current != null) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <div>
      <div className="grid grid-cols-[auto_1fr] gap-x-2">
        <input
          ref={inputRef}
          id={checkboxId}
          type="checkbox"
          className={clsx(
            'col-start-1 row-start-1 h-4 w-4 appearance-none rounded-sm border border-border bg-surface',
            'checked:border-primary checked:bg-primary checked:bg-[url("data:image/svg+xml,%3Csvg%20viewBox%3D%270%200%2010%208%27%20fill%3D%27none%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cpath%20d%3D%27M1%204L3.5%206.5L9%201%27%20stroke%3D%27white%27%20stroke-width%3D%271.6%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%2F%3E%3C%2Fsvg%3E")] checked:bg-center checked:bg-no-repeat',
            'indeterminate:border-primary indeterminate:bg-primary indeterminate:bg-[url("data:image/svg+xml,%3Csvg%20viewBox%3D%270%200%2010%2010%27%20fill%3D%27none%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cpath%20d%3D%27M2%205H8%27%20stroke%3D%27white%27%20stroke-width%3D%271.6%27%20stroke-linecap%3D%27round%27%2F%3E%3C%2Fsvg%3E")] indeterminate:bg-center indeterminate:bg-no-repeat',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            'disabled:bg-surface-disabled disabled:checked:bg-surface-disabled disabled:cursor-not-allowed',
            'forced-colors:appearance-auto',
            Boolean(error) && 'border-error',
            className
          )}
          {...rest}
        />

        {Boolean(label) && (
          <label
            htmlFor={checkboxId}
            className="col-start-2 row-start-1 text-xs font-medium text-label"
          >
            {label}
          </label>
        )}

        {Boolean(description) && (
          <p className="col-start-2 row-start-2 text-xs text-text-muted">
            {description}
          </p>
        )}
      </div>

      {Boolean(error) && (
        <p className="mt-1 text-xs text-error">{error}</p>
      )}
    </div>
  );
}
