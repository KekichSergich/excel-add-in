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
