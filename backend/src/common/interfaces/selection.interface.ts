export interface SelectionContext {
  worksheetName: string;
  address: string;
  values: unknown[][];
  headers: unknown[]; // ← массив, не строка
  dataRows: unknown[][];
  rowCount: number;
  colCount: number;
  dataTypes: string[]; // ← одномерный массив
}
