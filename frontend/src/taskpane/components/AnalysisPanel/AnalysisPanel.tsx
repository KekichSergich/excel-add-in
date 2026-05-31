import React, { useState, useRef, useEffect } from "react";
import { useAiChat, ChatMode } from "../../hooks/useAiChat";
import './AnalysisPanel.css';

interface Message {
  id: number;
  role: 'user' | 'bot' | 'error';
  text: string;
}

export default function AnalysisPanel() {
  const { status, response, error, sendMessage } = useAiChat();
  const [inputValue, setInputValue] = useState("");
  const [mode, setMode] = useState<ChatMode>("selection");
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: 'bot', text: 'Hello! Select a range in Excel and ask me anything about your data.' }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const msgCounter = useRef(1);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  // When response arrives — add bot message
  useEffect(() => {
    if (status === 'success' && response) {
      setMessages(prev => [
        ...prev,
        { id: msgCounter.current++, role: 'bot', text: response.message }
      ]);
    }
  }, [status, response]);

  // When error arrives — add error message
  useEffect(() => {
    if (status === 'error' && error) {
      setMessages(prev => [
        ...prev,
        { id: msgCounter.current++, role: 'error', text: `Error: ${error}` }
      ]);
    }
  }, [status, error]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text) return;

    // Add user message immediately
    setMessages(prev => [
      ...prev,
      { id: msgCounter.current++, role: 'user', text }
    ]);
    setInputValue("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await sendMessage(text, mode);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chatArea">

      {/* Header */}
      <div className="chatHeader">
        <div className="chatHeaderAvatar">🤖</div>
        <div className="chatHeaderInfo">
          <div className="chatHeaderTitle">AI Excel Assistant</div>
          
        </div>
      </div>

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

      {/* Messages */}
      <div className="messagesArea">
        {messages.map(msg => (
          <div key={msg.id} className={`messageBubble ${msg.role}`}>
            {msg.text}
          </div>
        ))}

        {/* Typing indicator */}
        {status === 'loading' && (
          <div className="typingIndicator">
            <div className="typingDot" />
            <div className="typingDot" />
            <div className="typingDot" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="inputArea">
        <textarea
          ref={textareaRef}
          className="chatTextarea"
          value={inputValue}
          rows={1}
          placeholder={
            mode === "selection"
              ? "Select a range and ask..."
              : "Ask about the workbook..."
          }
          disabled={status === "loading"}
          onChange={(e) => {
            setInputValue(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
          onKeyDown={handleKeyDown}
        />
        <button className="sendBtn" onClick={handleSend} disabled={status === "loading"}>
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
          </svg>
        </button>
      </div>

    </div>
  );
}