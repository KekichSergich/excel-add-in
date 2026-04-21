import { useState } from "react";
import { getSelectedRangeData } from "../services/excel.service";
import { AnalyzeSelectionResponse } from "../types/api.types";
import { analyzeSelection } from "../services/api.client";

type AnalysisStatus = "idle" | "loading" | "success" | "error";

interface AnalysisState {
  status: AnalysisStatus;
  result: AnalyzeSelectionResponse | null;
  error: string | null;
}

export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>({
    status: "idle",
    result: null,
    error: null
  });

  const runAnalysis = async () => {
    try {
      setState({ status: "loading", result: null, error: null });

      const selection = await getSelectedRangeData();

      const result = await analyzeSelection({
        selection,
        options: { includeMetrics: true, includeSummary: true },
      });

      setState({ status: "success", result, error: null });
    } catch (error) {
      setState({
        status: "error",
        result: null,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return {
    ...state,
    runAnalysis
  };
}