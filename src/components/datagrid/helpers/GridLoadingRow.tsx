import type { JSX } from 'react';
import { useDataGridContext } from '../DataGrid';
import { gridTheme } from '../theme/gridTheme';

const SKELETON_ROW_COUNT = 6;

export const GridLoadingRow = (): JSX.Element => {
  const { table } = useDataGridContext<unknown>();
  const columns = table.getAllLeafColumns();

  return (
    <>
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, rowIdx) => (
        <tr key={rowIdx} className={gridTheme.tr}>
          {columns.map((col) => (
            <td
              key={col.id}
              className={gridTheme.tdBase}
              style={{ width: col.getSize() }}
            >
              <div
                className="h-4 animate-pulse rounded bg-border-muted"
                style={{ width: `${60 + Math.random() * 30}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};
