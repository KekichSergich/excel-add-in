export interface SheetData {
  name: string;
  values: unknown[][];
}

export interface AIRequest {
  userMessage: string;
  mode: 'selection' | 'all-sheets';
  selection?: {
    worksheetName: string;
    address: string;
    values: unknown[][];
  };
  sheets?: SheetData[];
}

export interface AIAction {
  tool: string;
  params: Record<string, unknown>;
}

export interface AIResponse {
  type: 'action' | 'analysis';
  // single action — backwards compatibility with old format
  tool?: string;
  params?: Record<string, unknown>;
  // multiple actions — new format
  actions?: AIAction[];
  message: string;
}
