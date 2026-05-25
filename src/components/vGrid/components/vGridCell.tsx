import type { JSX, ReactNode } from 'react';
import { vGridTheme } from '../theme/vGridTheme';
import clsx from 'clsx';

interface Props {
  field: string;
  isFrozen: boolean;
  isLastFrozen: boolean;
  isSelected: boolean;
  bordered: boolean;
  offset?: number;
  align?: 'left' | 'center' | 'right';
  width?: number;
  style?: React.CSSProperties;
  children: ReactNode;
}

export function VGridCell({
  field,
  isFrozen,
  isLastFrozen,
  isSelected,
  bordered,
  offset,
  align,
  width,
  style,
  children,
}: Props): JSX.Element {
  return (
    <td
      data-field={field}
      style={{
        ...(width != null ? { width } : {}),
        ...(isFrozen && offset != null ? { insetInlineStart: offset } : {}),
        ...style,
      }}
      className={clsx(
        vGridTheme.td,
        bordered && vGridTheme.tdBorder,
        align === 'right' && 'text-end tabular-nums',
        align === 'center' && 'text-center',
        isFrozen && (isSelected ? vGridTheme.tdFrozenSelected : vGridTheme.tdFrozen),
        !isFrozen && isSelected && vGridTheme.tdSelected,
        isLastFrozen && vGridTheme.lastFrozenBorder,
      )}
    >
      {children}
    </td>
  );
}
