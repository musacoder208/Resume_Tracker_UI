//Wrapper around react-hook-form with Zod schema validation pre-wired.

import { useForm } from 'react-hook-form';
import type { UseFormProps, UseFormReturn, FieldValues } from 'react-hook-form';

export function useAppForm<T extends FieldValues>(props?: UseFormProps<T>): UseFormReturn<T> {
  return useForm<T>({
    ...props,
    mode: props?.mode ?? 'onTouched',
  });
}
