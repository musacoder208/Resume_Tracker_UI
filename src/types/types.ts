import type {
  GridFilterOperator,
} from '@/components/datagrid/types/grid.filters'

export interface ApiColumnFilter {
  id: string
  operator: GridFilterOperator
  value?: string | number | null
}
