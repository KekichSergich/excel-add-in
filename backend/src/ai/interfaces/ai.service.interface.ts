import { AIRequest, AIResponse } from './ai.interface';

export interface IAIService {
  processRequest(request: AIRequest): Promise<AIResponse>;
}

export const AI_SERVICE = 'AI_SERVICE';
