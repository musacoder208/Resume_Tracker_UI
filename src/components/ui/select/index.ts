import { type ReactNode } from 'react';

export { FormSelect } from './FormSelect';
export { Select } from './Select';
export { SelectNative } from './SelectNative';

export function renderOptions<T>(
  items: readonly T[],
  getKey: (item: T) => string | number,
  getValue: (item: T) => string | number,
  getLabel: (item: T) => ReactNode,
): Array<{ key: string | number; value: string | number; label: ReactNode }> {
  return items.map((item) => ({
    key: getKey(item),
    value: getValue(item),
    label: getLabel(item),
  }));
}