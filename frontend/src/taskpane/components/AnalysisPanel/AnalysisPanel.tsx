import React, { useState } from "react";
import { useAiChat, ChatMode } from "../../hooks/useAiChat";
import './AnalysisPanel.css';

export default function AnalysisPanel() {
  const { status, response, error, sendMessage } = useAiChat();
  const [inputValue, setInputValue] = useState("");
  const [mode, setMode] = useState<ChatMode>("selection");

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    await sendMessage(inputValue, mode);
  };

  return (
    <div className="chatArea">

      {/* Mode switcher */}
      <div className="modeSwitcher">
        <button
          className={mode === "selection" ? "modeBtn active" : "modeBtn"}
          onClick={() => setMode("selection")}
        >
          Selection
        </button>
        <button
          className={mode === "all-sheets" ? "modeBtn active" : "modeBtn"}
          onClick={() => setMode("all-sheets")}
        >
          All Sheets
        </button>
      </div>

      <textarea
        title="chat"
        id="chat"
        value={inputValue}
        rows={1}
        placeholder={
          mode === "selection"
            ? "Select a range and ask a question..."
            : "Ask about the entire workbook..."
        }
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