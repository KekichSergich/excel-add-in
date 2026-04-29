import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { AnalysisService } from '../analysis/analysis.service';
import { SelectionContext } from '../common/interfaces/selection.interface';
import { SYSTEM_PROMPT } from './prompts/system.prompt';
import { AIRequest } from '../common/interfaces/ai-request.interface';
import { AIResponse } from '../common/interfaces/ai-response.interface';

@Injectable()
export class AIService {
  private llm: ChatOpenAI;

  constructor(private readonly analysisService: AnalysisService) {
    this.llm = new ChatOpenAI({
      model: 'gpt-4o',
      temperature: 0,
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async processRequest(request: AIRequest): Promise<AIResponse> {
    // 1. подготавливаем контекст таблицы
    const context = this.analysisService.prepareContext({
      selection: request.selection,
    });

    // 2. строим промпт
    const userPrompt = this.buildUserPrompt(request.userMessage, context);

    // 3. вызываем LLM
    const response = await this.llm.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      new HumanMessage(userPrompt),
    ]);

    // 4. парсим ответ
    return this.parseResponse(response.content as string);
  }

  // eslint-disable-next-line prettier/prettier
  private buildUserPrompt(userMessage: string, context: SelectionContext): string {
    return `
      User request: "${userMessage}"

      Spreadsheet context:
      - Worksheet: ${context.worksheetName}
      - Selected range: ${context.address}
      - Columns (${context.colCount}): ${JSON.stringify(context.headers)}
      - Column types: ${JSON.stringify(context.dataTypes)}
      - Row count: ${context.rowCount}
      - Data:
      ${JSON.stringify(context.dataRows, null, 2)}
          `;
  }

  private parseResponse(content: string): AIResponse {
    try {
      // убираем markdown обёртку если LLM вернул ```json ... ```
      const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      // валидируем что есть обязательные поля
      if (!parsed.type || !parsed.message) {
        throw new Error('Invalid response structure');
      }

      return parsed as AIResponse;
    } catch (error) {
      console.error('Failed to parse LLM response:', error);
      return {
        type: 'analysis',
        message: content,
      };
    }
  }
}
