import type { JSX } from 'react';
import { useT } from '@/i18n/useT';
import { gridTheme } from '../theme/gridTheme';

export const GridEmptyState = (): JSX.Element => {
  const { t } = useT('common');

  return (
    <tr>
      <td colSpan={100} className={gridTheme.emptyCell}>
        {t('grid.noRecords')}
      </td>
    </tr>
  );
};
