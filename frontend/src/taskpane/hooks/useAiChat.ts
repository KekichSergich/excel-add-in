import { useState } from "react";
import { getSelectedRangeData } from "../services/excel.service";
import { AiChatRequest, AiChatResponse } from "../types/api.types";
import { sendAiChat } from "../services/api.client";
import { executeAction } from "../services/command-executor.service";
import { ChatState } from "../types/chat-state.interface";

type ChatStatus = "idle" | "loading" | "success" | "error";

export function useAiChat() {
  const [state, setState] = useState<ChatState>({
    status: "idle",
    response: null,
    error: null,
  });

  const sendMessage = async (userMessage: string) => {
    try {
      setState({ status: "loading", response: null, error: null });
      const selection = await getSelectedRangeData();
      const request: AiChatRequest = { userMessage, selection };
      const response = await sendAiChat(request);

      if (response.type === "action" && response.tool && response.params) {
        await executeAction(response.tool, response.params);
      }

      setState({ status: "success", response, error: null });

    } catch (e) {
      setState({ status: "error", response: null, error: e instanceof Error ? e.message : "Unknown error" });
    }
  };

  return {
    ...state,
    sendMessage,
  };
}