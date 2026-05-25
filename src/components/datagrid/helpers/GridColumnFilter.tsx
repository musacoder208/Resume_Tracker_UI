import { useEffect, useState, type ChangeEvent, type JSX } from 'react'
import type { Column } from '@tanstack/react-table'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useT } from '@/i18n/useT'
import { gridTheme } from '../theme/gridTheme'

interface GridColumnFilterProps<TData> {
  column: Column<TData, unknown>
  debounceMs?: number
}

export const GridColumnFilter = <TData,>({
  column,
  debounceMs = 400,
}: GridColumnFilterProps<TData>): JSX.Element => {
  const { t } = useT('common')
  const rawFilterValue = column.getFilterValue()

  const [localValue, setLocalValue] = useState<string>(() => {
    return typeof rawFilterValue === 'string' ? rawFilterValue : ''
  })

  const debouncedValue = useDebouncedValue<string>(localValue, debounceMs)

  useEffect((): void => {
    if (debouncedValue.length > 0) {
      column.setFilterValue(debouncedValue)
    } else {
      column.setFilterValue(undefined)
    }
  }, [debouncedValue, column])

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setLocalValue(e.target.value)
  }

  const meta = column.columnDef.meta

  const placeholder: string =
    meta &&
    typeof meta === 'object' &&
    'filterPlaceholder' in meta &&
    typeof meta.filterPlaceholder === 'string'
      ? meta.filterPlaceholder
      : t('grid.filter.placeholder')

  return (
    <input
      type="text"
      value={localValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={gridTheme.filterInput}
    />
  )
}
