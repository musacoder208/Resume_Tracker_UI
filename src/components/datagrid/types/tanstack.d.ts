// components/datagrid/types/tanstack.d.ts
import '@tanstack/react-table'
import type { GridColumnMeta } from './grid.types'

declare module '@tanstack/react-table' {
  type ColumnMeta<_TData, _TValue> = GridColumnMeta
}
