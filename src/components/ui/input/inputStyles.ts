import clsx from 'clsx';

export type InputVariant = 'default' | 'error';
export type InputShape = 'default' | 'pill';

export const baseInput =
  'block h-[var(--layout-field-height)] bg-surface text-text text-xs placeholder:text-xs placeholder:text-text-muted border transition-colors focus:outline-none';

export const variantClasses: Record<InputVariant, string> = {
  default:
    'border-border focus:border-primary focus:ring-2 focus:ring-primary/10',
  error:
    'border-error text-error focus:border-error focus:ring-2 focus:ring-error/10',
};

export const shapeClasses: Record<InputShape, string> = {
  default: 'rounded px-[4px]',
  pill: 'rounded-full px-[4px]',
};

export function getInputClasses(
  variant: InputVariant,
  shape: InputShape,
  disabled: boolean,
): string {
  return clsx(
    baseInput,
    variantClasses[variant],
    shapeClasses[shape],
    disabled &&
      'cursor-not-allowed bg-surface-disabled !text-text-disabled border-border',
  );
}
