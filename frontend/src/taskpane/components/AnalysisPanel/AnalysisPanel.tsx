import React from "react";
import { useAnalysis } from "../../hooks/useAnalysis";
import './AnalysisPanel.css';

export default function AnalysisPanel() {
  const { status, result, error, runAnalysis } = useAnalysis();

  return (
    
    <div className="chatArea">
      <label htmlFor="chat"></label>
      <input title="chat" type="text" id="chat"/>
      <button onClick={runAnalysis} disabled={status === "loading"}>
        {status === "loading" ? "Analyzing..." : "Analyze selected range"}
      </button>

      {error && <p>Error: {error}</p>}

      {result && (
        <div>
          <p>{result.summary}</p>
          
          {result.metrics && (
            <pre>{JSON.stringify(result.metrics, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  );
} 