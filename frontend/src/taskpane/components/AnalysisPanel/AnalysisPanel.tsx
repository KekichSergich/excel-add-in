import React, { useState } from "react";
import { useAiChat } from "../../hooks/useAiChat";
import './AnalysisPanel.css';

export default function AnalysisPanel() {
  const { status, response, error, sendMessage } = useAiChat();
  const [inputValue, setInputValue] = useState("");

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    await sendMessage(inputValue);
  };

  return (
    <div className="chatArea">
      <textarea
        title="chat"
        id="chat"
        value={inputValue}
        rows={1}
        placeholder="Ask AI to analyze or modify your data..."
        disabled={status === "loading"}
        onChange={(e) => {
          setInputValue(e.target.value);
          e.target.style.height = 'auto';
          e.target.style.height = e.target.scrollHeight + 'px';
        }}
      />
      <button onClick={handleSend} disabled={status === "loading"}>
        {status === "loading" ? "Processing..." : "Send"}
      </button>

      {error && <p>Error: {error}</p>}

      {response && (
        <div>
          <p>{response.message}</p>
        </div>
      )}
    </div>
  );
}