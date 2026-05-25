import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

type Namespace = string | readonly string[];

type UseTReturn = {
  t: TFunction;
  i18n: ReturnType<typeof useTranslation>['i18n'];
};

export function useT(ns: Namespace = 'common'): UseTReturn {
  const { t, i18n } = useTranslation(ns);

  return {
    t,
    i18n,
  };
}
