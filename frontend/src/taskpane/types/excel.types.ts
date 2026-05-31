export type CellValue = string | number | boolean | null;

export type SheetValues = CellValue[][];

export interface SheetData {
  name: string;
  values: SheetValues;
}

export interface SelectedRangeData {
  worksheetName: string;
  address: string;
  values: SheetValues;
}