import type { SizeVariant } from '../types/DateTimePicker.types';

/**
 * Tailwind class presets for size variants.
 */
export const sizeConfig: Record<SizeVariant, { input: string; icon: string; button: string }> = {
  small: {
    input: 'px-2 py-1 text-sm',
    icon: 'w-4 h-4',
    button: 'px-2 py-1 text-xs',
  },
  medium: {
    input: 'px-3 py-2 text-base',
    icon: 'w-5 h-5',
    button: 'px-3 py-2 text-sm',
  },
  large: {
    input: 'px-4 py-3 text-lg',
    icon: 'w-6 h-6',
    button: 'px-4 py-3 text-base',
  },
};
