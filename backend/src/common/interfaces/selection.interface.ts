export interface SelectionContext {
  worksheetName: string;
  adress: string;
  values: unknown[][];
  header: string;
  dataRows: unknown[][];
  rowCount: number;
  colCount: number;
  dataTypes: string[][];
}
