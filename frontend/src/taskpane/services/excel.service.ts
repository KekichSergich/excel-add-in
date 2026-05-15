import { SelectedRangeData } from "../types/excel.types";

export async function getSelectedRangeData(): Promise<SelectedRangeData> {
  return Excel.run(async (context) => {
    const range = context.workbook.getSelectedRange();
    const worksheet = context.workbook.worksheets.getActiveWorksheet();

    range.load(["address", "values"]);
    worksheet.load("name");

    await context.sync();
    console.log("[Excel] About to read selected range");
    console.log("[Excel] Selected range loaded", {
      address: range.address,
      worksheetName: worksheet.name,
      values: range.values,
    });

    return {
      worksheetName: worksheet.name,
      address: range.address,
      values: range.values as (string | number | boolean | null)[][],
    };
  });
}

// Reads all sheets from the workbook for semantic profiling
export async function getAllSheetsData(): Promise<Array<{ name: string; values: unknown[][] }>> {
  return Excel.run(async function (context) {
    const sheets = context.workbook.worksheets;
    sheets.load('items/name');
    await context.sync();

    const result = [];

    for (const sheet of sheets.items) {
      const range = sheet.getUsedRange();
      range.load('values');
      await context.sync();

      console.log("[Excel] Sheet loaded:", sheet.name);

      result.push({
        name: sheet.name,
        values: range.values,
      });
    }

    return result;
  });
}