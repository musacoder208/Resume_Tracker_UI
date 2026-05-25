import type { DataGridLayout } from '../types/grid.types'

export const getGridLayoutClasses = (
  layout?: DataGridLayout,
): {
  widthClass: string
  heightClass: string
  overflowClass: string
} => {
  // Width
  let widthClass = 'max-w-full'
  if (layout?.maxWidth === 'screen') {
    widthClass = 'max-w-screen'
  } else if (typeof layout?.maxWidth === 'number') {
    widthClass = `max-w-[${layout.maxWidth}px]`
  }

  // Height
  let heightClass = ''
  let overflowClass = ''

  if (layout?.height === 'screen') {
    heightClass = 'h-[calc(100vh-12rem)]'
    overflowClass = 'overflow-auto'
  } else if (typeof layout?.height === 'number') {
    heightClass = `h-[${layout.height}px]`
    overflowClass = 'overflow-auto'
  }

  return {
    widthClass,
    heightClass,
    overflowClass,
  }
}
