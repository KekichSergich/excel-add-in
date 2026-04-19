export type CellValue = string | number | boolean | null;
export type CellMatrix = CellValue[][];

export interface SelectedRangeData {
  worksheetName: string;
  address: string;
  values: CellMatrix;
}