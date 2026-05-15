import { SelectedRangeData } from "./excel.types";

export interface AnalyzeSelectionRequest {
  prompt?: string;
  selection: SelectedRangeData;
  options?: {
    includeMetrics?: boolean;
    includeSummary?: boolean;
  };
}

export interface AnalysisMetrics {
  count: number;
  sum: number | null;
  average: number | null;
  min: number | null;
  max: number | null;
}

export interface AnalyzeSelectionResponse {
  success: boolean;
  metrics?: AnalysisMetrics;
  summary?: string;
  error?: string;
}


// ========== NEW (ai chat) ==========
export interface AiChatRequest {
  userMessage: string;
  mode: 'selection' | 'all-sheets';  
  selection?: SelectedRangeData;      // only if mode = 'selection'
  sheets?: Array<{                    // only if mode = 'all-sheets'
    name: string;
    values: unknown[][];
  }>;
}

export interface AiAction {
  tool: string;
  params: Record<string, unknown>;
}

export interface AiChatResponse {
  actions?: AiAction[];
  type: 'action' | 'analysis';
  tool?: string;
  params?: Record<string, unknown>;
  message: string;
}