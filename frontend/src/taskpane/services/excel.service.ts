import { SelectedRangeData, SheetData, CellValue } from '../types/excel.types';

export async function getSelectedRangeData(): Promise<SelectedRangeData> {
  return Excel.run(async (context) => {
    const range = context.workbook.getSelectedRange();
    const worksheet = context.workbook.worksheets.getActiveWorksheet();

    range.load(['address', 'values']);
    worksheet.load('name');

    await context.sync();

    return {
      worksheetName: worksheet.name,
      address: range.address,
      values: range.values as CellValue[][],
    };
  });
}

export async function getAllSheetsData(): Promise<SheetData[]> {
  return Excel.run(async (context) => {
    const sheets = context.workbook.worksheets;
    sheets.load('items/name');
    await context.sync();

    const result: SheetData[] = [];

    for (const sheet of sheets.items) {
      const range = sheet.getUsedRange();
      range.load('values');
      await context.sync();

      console.log('[Excel] Sheet loaded:', sheet.name);

      result.push({
        name: sheet.name,
        values: range.values as CellValue[][],
      });
    }

    return result;
  });
}