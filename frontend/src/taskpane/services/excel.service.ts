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
        values: range.values
        });
    return {
      worksheetName: worksheet.name,
      address: range.address,
      values: range.values as (string | number | boolean | null)[][]
    };
    
  });
}