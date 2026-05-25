import clsx from 'clsx'
import type { ChangeEvent, JSX } from 'react'
import { gridTheme } from '../theme/gridTheme'

interface GridCheckboxProps {
  checked: boolean
  indeterminate?: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
  className?: string
}

export const GridCheckbox = ({
  checked,
  indeterminate = false,
  disabled = false,
  onChange,
  className,
}: GridCheckboxProps): JSX.Element => {
  return (
    <input
      type="checkbox"
      className={clsx(gridTheme.checkbox, className)}
      checked={checked}
      disabled={disabled}
      ref={(el) => {
        if (el != null) {
          el.indeterminate = indeterminate
        }
      }}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.checked)
      }}
    />
  )
}
