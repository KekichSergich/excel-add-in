export interface AIRequest {
  userMessage: string;
  selection: {
    worksheetName: string;
    address: string;
    values: unknown[][];
  };
}
