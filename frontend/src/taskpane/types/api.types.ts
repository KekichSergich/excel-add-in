import { SelectedRangeData } from "./excel.types";

// ========== OLD (analysis) ==========
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
  selection: SelectedRangeData;
}

export interface AiChatResponse {
  type: 'action' | 'analysis';
  tool?: string;
  params?: Record<string, unknown>;
  message: string;
}