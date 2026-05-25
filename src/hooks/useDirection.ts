import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useDirection(): 'ltr' | 'rtl' {
  const { i18n } = useTranslation();

  return useMemo(
    () => (['ar', 'he', 'fa'].includes(i18n.language) ? 'rtl' : 'ltr'),
    [i18n.language]
  );
}
