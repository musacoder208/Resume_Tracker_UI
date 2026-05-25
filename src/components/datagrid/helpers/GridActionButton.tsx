import type { ButtonHTMLAttributes, JSX, ReactNode } from 'react'
import clsx from 'clsx'

interface GridActionButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export const GridActionButton = ({
  children,
  className,
  ...rest
}: GridActionButtonProps): JSX.Element => {
  return (
    <button
      type="button"
      className={clsx(
        'inline-flex items-center gap-1 text-sm text-primary hover:underline',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
