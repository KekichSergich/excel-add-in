import { AnalyzeSelectionRequest, AnalyzeSelectionResponse } from "../types/api.types";
import { API_BASE_URL } from "../config/env";

export async function analyzeSelection(
  request: AnalyzeSelectionRequest
): Promise<AnalyzeSelectionResponse> {
  const response = await fetch(`${API_BASE_URL}/analysis/selection`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  return response.json() as Promise<AnalyzeSelectionResponse>;
}