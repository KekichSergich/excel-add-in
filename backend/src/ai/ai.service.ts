import { Injectable, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import {
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from '@langchain/core/messages';
import { createReactAgent } from '@langchain/langgraph/prebuilt';

import { AnalysisService } from '../analysis/analysis.service';
import { SelectionContext } from '../common/interfaces/selection.interface';
import { AIRequest } from '../common/interfaces/ai-request.interface';
import {
  AIResponse,
  AIAction,
} from '../common/interfaces/ai-response.interface';
import { SYSTEM_PROMPT } from './prompts/system.prompt';
import { toolsRegistry } from '../tools/tools.registry';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private agent: ReturnType<typeof createReactAgent>;

  constructor(private readonly analysisService: AnalysisService) {
    const llm = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0,
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Create LangGraph ReAct agent with the tools registry
    this.agent = createReactAgent({
      llm,
      tools: toolsRegistry,
    });
  }

  async processRequest(request: AIRequest): Promise<AIResponse> {
    // 1. Prepare spreadsheet context from selected range
    const context = this.analysisService.prepareContext({
      selection: request.selection,
    });

    // 2. Build user prompt with context injected
    const userPrompt = this.buildUserPrompt(request.userMessage, context);

    // 3. Run the agent — it decides how many steps are needed
    const result = await this.agent.invoke({
      messages: [
        new SystemMessage(SYSTEM_PROMPT),
        new HumanMessage(userPrompt),
      ],
    });

    // 4. Collect all tool calls from the agent message history
    const actions = this.extractActions(result.messages);

    // 5. Final text — last AI message in the history
    const finalMessage = this.extractFinalMessage(result.messages);

    // 6. Build AIResponse based on number of actions
    if (actions.length === 0) {
      // Pure analytical response — no spreadsheet modifications
      return { type: 'analysis', message: finalMessage };
    }

    if (actions.length === 1) {
      // Single action — backwards compatible format
      return {
        type: 'action',
        tool: actions[0].tool,
        params: actions[0].params,
        message: finalMessage,
      };
    }

    // Multiple actions — new format with actions array
    return { type: 'action', actions, message: finalMessage };
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
    `.trim();
  }

  // Walk through all agent messages and collect tool invocations.
  // ToolMessage content is a JSON string { tool, params } returned by func().
  private extractActions(messages: unknown[]): AIAction[] {
    const actions: AIAction[] = [];

    for (const msg of messages) {
      if (msg instanceof ToolMessage) {
        try {
          const parsed = JSON.parse(msg.content as string);
          if (parsed.tool && parsed.params) {
            actions.push({ tool: parsed.tool, params: parsed.params });
          }
        } catch {
          this.logger.warn('Could not parse tool message:', msg.content);
        }
      }
    }

    return actions;
  }

  // Return the last AI message text as the final user-facing response.
  private extractFinalMessage(messages: unknown[]): string {
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i] as { getType?: () => string; content?: unknown };
      if (msg?.getType?.() === 'ai') {
        const content = msg.content;
        if (typeof content === 'string' && content.trim()) return content;
        // content can be an array of blocks
        if (Array.isArray(content)) {
          const text = content
            .filter((b: { type?: string }) => b.type === 'text')
            .map((b: { text?: string }) => b.text ?? '')
            .join('');
          if (text.trim()) return text;
        }
      }
    }
    return 'Done.';
  }
}
