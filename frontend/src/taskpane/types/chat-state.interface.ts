import { AiChatResponse } from "./api.types";
type ChatStatus = "idle" | "loading" | "success" | "error";

export interface ChatState {
  status: ChatStatus;
  response: AiChatResponse | null;
  error: string | null;
}