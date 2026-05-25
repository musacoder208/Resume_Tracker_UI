import type { ReactNode } from 'react';

export type CascadeSelectVariant = 'default' | 'danger';

export type CascadeSelectItem = {
  /** Unique key for this item */
  id: string;
  /** Display label */
  label: string;
  /** Leading icon element */
  icon?: ReactNode;
  /** Leading colored dot — pass a hex/CSS color string (e.g. theme primary colors) */
  dot?: string;
  /** Shows a CheckIcon at the end — use for active selection state */
  active?: boolean;
  /** Child items — if provided the row drills into a new panel instead of firing onClick */
  children?: CascadeSelectItem[];
  /** Called when a leaf item (no children) is clicked */
  onClick?: () => void;
  /** 'danger' renders the row in text-error color */
  variant?: CascadeSelectVariant;
};
