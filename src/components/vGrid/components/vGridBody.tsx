import React, { type JSX } from 'react';
import { vGridTheme } from '../theme/vGridTheme';
import { VGridCell } from './vGridCell';
import type { VGridColumn, VGridSelectionMode } from '../types/vGrid.types';
import clsx from 'clsx';

interface Props<TData> {
  columns: VGridColumn<TData>[];
  windowRows: TData[];
  allData: TData[];
  rowKey: keyof TData & string;
  rowHeightPx: number;
  padTop: number;
  padBottom: number;
  virtualizationEnabled: boolean;
  pinnedOffsets: Record<string, number>;
  lastFrozenField: string | null;
  bordered: boolean;

  // Selection
  selectionMode?: VGridSelectionMode;
  isRowSelected: (row: TData) => boolean;
  toggleRow: (row: TData) => void;

  // Expansion
  hasExpansion: boolean;
  expandedRows: Set<string>;
  toggleExpand: (key: string) => void;
  renderExpandedRow?: (row: TData) => React.ReactNode;
}

export function VGridBody<TData>({
  columns,
  windowRows,
  allData,
  rowKey,
  rowHeightPx,
  padTop,
  padBottom,
  virtualizationEnabled,
  pinnedOffsets,
  lastFrozenField,
  bordered,
  selectionMode,
  isRowSelected,
  toggleRow,
  hasExpansion,
  expandedRows,
  toggleExpand,
  renderExpandedRow,
}: Props<TData>): JSX.Element {
  const hasSelection = selectionMode != null;
  const colCount = columns.length + (hasSelection ? 1 : 0) + (hasExpansion ? 1 : 0);

  return (
    <tbody className={vGridTheme.tbody}>
      {/* Top spacer */}
      {virtualizationEnabled && padTop > 0 && (
        <tr>
          <td colSpan={colCount} style={{ height: padTop, padding: 0, border: 'none' }} />
        </tr>
      )}

      {windowRows.map((row) => {
        const key = String((row as Record<string, unknown>)[rowKey]);
        const selected = isRowSelected(row);
        const expanded = expandedRows.has(key);

        return (
          <React.Fragment key={key}>
            <tr
              style={{ height: rowHeightPx }}
              className={clsx(vGridTheme.tr, selected && vGridTheme.trSelected)}
            >
              {/* Expand column — position 0 */}
              {hasExpansion && (
                <td
                  className={clsx(
                    vGridTheme.td,
                    bordered && vGridTheme.tdBorder,
                    selected ? vGridTheme.tdFrozenSelected : vGridTheme.tdFrozen,
                  )}
                  style={{ width: 36, minWidth: 36, insetInlineStart: 0 }}
                >
                  <div className="flex h-full items-center justify-center">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleExpand(key); }}
                      className={expanded ? vGridTheme.expandBtnOpen : vGridTheme.expandBtn}
                    >
                      {expanded ? '−' : '+'}
                    </button>
                  </div>
                </td>
              )}

              {/* Selection column — position 1 */}
              {hasSelection && (
                <td
                  className={clsx(
                    vGridTheme.td,
                    bordered && vGridTheme.tdBorder,
                    selected ? vGridTheme.tdFrozenSelected : vGridTheme.tdFrozen,
                  )}
                  style={{ width: 36, minWidth: 36, insetInlineStart: hasExpansion ? 36 : 0 }}
                >
                  <div className="flex h-full items-center justify-center">
                    {selectionMode === 'multiple' ? (
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleRow(row)}
                        className={vGridTheme.checkbox}
                      />
                    ) : (
                      <input
                        type="radio"
                        name="vgrid-radio"
                        checked={selected}
                        onChange={() => toggleRow(row)}
                        className="h-3 w-3 cursor-pointer accent-primary"
                      />
                    )}
                  </div>
                </td>
              )}

              {/* Data cells */}
              {columns.map((col) => {
                const isFrozen = col.frozen === true;
                const isLastFrozen = col.field === lastFrozenField;
                const cellValue = (row as Record<string, unknown>)[col.field];

                const cellProps = {
                  rowData: row,
                  value: cellValue,
                  field: col.field,
                  tableData: allData,
                  expandRow: hasExpansion ? () => toggleExpand(key) : undefined,
                };

                return (
                  <VGridCell
                    key={col.field}
                    field={col.field}
                    isFrozen={isFrozen}
                    isLastFrozen={isLastFrozen}
                    isSelected={selected}
                    bordered={bordered}
                    offset={pinnedOffsets[col.field]}
                    align={col.align}
                    width={col.width}
                    style={col.style}
                  >
                    {col.body != null ? col.body(cellProps) : String(cellValue ?? '')}
                  </VGridCell>
                );
              })}
            </tr>

            {/* Expanded row */}
            {expanded && renderExpandedRow != null && (
              <tr className={vGridTheme.expandRow}>
                <td colSpan={colCount} className={vGridTheme.expandCell}>
                  {renderExpandedRow(row)}
                </td>
              </tr>
            )}
          </React.Fragment>
        );
      })}

      {/* Bottom spacer */}
      {virtualizationEnabled && padBottom > 0 && (
        <tr>
          <td colSpan={colCount} style={{ height: padBottom, padding: 0, border: 'none' }} />
        </tr>
      )}
    </tbody>
  );
}
