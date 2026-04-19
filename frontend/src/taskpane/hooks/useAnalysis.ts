import { useState } from "react";
import { getSelectedRangeData } from "../services/excel.service";
import { AnalyzeSelectionResponse } from "../types/api.types";

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
      setState({
        status: "loading",
        result: null,
        error: null
      });

      const selection = await getSelectedRangeData();

      console.log("Selected range:", selection);
      console.log("[Analysis] runAnalysis called");

      const mockResponse: AnalyzeSelectionResponse = {
        success: true,
        summary: `Диапазон ${selection.address} успешно прочитан`,
        metrics: {
          count: 0,
          sum: null,
          average: null,
          min: null,
          max: null
        }
      };

      setState({
        status: "success",
        result: mockResponse,
        error: null
      });
    } catch (error) {
      setState({
        status: "error",
        result: null,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };

  return {
    ...state,
    runAnalysis
  };
}