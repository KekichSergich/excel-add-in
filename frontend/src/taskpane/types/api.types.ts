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