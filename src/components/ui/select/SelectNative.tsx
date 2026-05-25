import { forwardRef } from 'react';
import type { JSX, SelectHTMLAttributes } from 'react';
import clsx from 'clsx';

import { selectBase, selectDefault, selectError, selectDisabled } from './selectStyles';

export interface UISelectNativeProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export const SelectNative = forwardRef<HTMLSelectElement, UISelectNativeProps>(
  function UISelectNative({ hasError = false, className, children, ...props }, ref): JSX.Element {
    return (
      <div className="relative grid grid-cols-1">
        <select
          ref={ref}
          className={clsx(
            selectBase,
            hasError ? selectError : selectDefault,
            props.disabled && selectDisabled,
            className
          )}
          {...props}
        >
          {children}
        </select>
      </div>
    );
  }
);
