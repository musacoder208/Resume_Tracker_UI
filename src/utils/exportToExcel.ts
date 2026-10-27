export type ExcelCellValue = string | number | null | undefined;

export interface ExcelColumn<TRow> {
  header: string;
  value: (row: TRow) => ExcelCellValue;
  /** Column width in characters — defaults to fit the header */
  width?: number;
  /**
   * Excel number format for numeric cells, e.g. '#,##0' or '0.0000'. The cell
   * stays a number (SUM / filters still work) but displays rounded.
   */
  format?: string | ((row: TRow) => string);
}

export interface ExportToExcelOptions<TRow> {
  /** Without extension — ".xlsx" is added */
  fileName: string;
  sheetName?: string;
  columns: ExcelColumn<TRow>[];
  rows: readonly TRow[];
}

// Excel limits: sheet names max 31 chars and no : \ / ? * [ ]
const MAX_SHEET_NAME_LENGTH = 31;
const INVALID_SHEET_CHARS = /[:\\/?*[\]]/g;
const INVALID_FILE_CHARS = /[\\/:*?"<>|]/g;
const MIN_COLUMN_WIDTH = 12;

/**
 * Builds an .xlsx file in the browser from grid rows and downloads it.
 * `xlsx` is loaded on demand so it stays out of the main bundle.
 */
export async function exportToExcel<TRow>({
  fileName,
  sheetName = 'Sheet1',
  columns,
  rows,
}: ExportToExcelOptions<TRow>): Promise<void> {
  const { utils, writeFile } = await import('xlsx');

  const sheetRows = [
    columns.map((c) => c.header),
    ...rows.map((row) => columns.map((c) => c.value(row) ?? '')),
  ];
  const sheet = utils.aoa_to_sheet(sheetRows);

  // Number formats — row 0 is the header, so data row i sits at sheet row i + 1
  rows.forEach((row, i) => {
    columns.forEach((col, c) => {
      if (col.format == null) return;
      const cell = sheet[utils.encode_cell({ r: i + 1, c })] as { t?: string; z?: string } | undefined;
      if (cell?.t === 'n') cell.z = typeof col.format === 'function' ? col.format(row) : col.format;
    });
  });
  sheet['!cols'] = columns.map((c) => ({ wch: c.width ?? Math.max(c.header.length + 2, MIN_COLUMN_WIDTH) }));

  const book = utils.book_new();
  const safeSheetName = sheetName.replace(INVALID_SHEET_CHARS, ' ').trim().slice(0, MAX_SHEET_NAME_LENGTH);
  utils.book_append_sheet(book, sheet, safeSheetName !== '' ? safeSheetName : 'Sheet1');

  const safeFileName = fileName.replace(INVALID_FILE_CHARS, ' ').trim();
  writeFile(book, `${safeFileName !== '' ? safeFileName : 'Export'}.xlsx`);
}
