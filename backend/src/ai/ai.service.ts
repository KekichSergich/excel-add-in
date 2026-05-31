import { Inject, Injectable, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import {
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from '@langchain/core/messages';
import { createReactAgent } from '@langchain/langgraph/prebuilt';

import type { SemanticProfile } from '../semantic/interfaces/semantic-profile.interface';
import type { SelectionContext } from '../common/interfaces/selection.interface';
import type {
  AIResponse,
  AIAction,
  AIRequest,
} from './interfaces/ai.interface';
import type { IAIService } from './interfaces/ai.service.interface';
import type { IAnalysisService } from '../analysis/interfaces/analysis.service.interface';
import type { ISemanticService } from '../semantic/interfaces/semantic.service.interface';

import { SYSTEM_PROMPT } from './prompts/system.prompt';
import { buildUserPrompt } from './prompts/user-prompt.builder';
import { toolsRegistry } from '../tools/tools.registry';
import { ANALYSIS_SERVICE } from '../analysis/interfaces/analysis.service.interface';
import { SEMANTIC_SERVICE } from '../semantic/interfaces/semantic.service.interface';

@Injectable()
export class AIService implements IAIService {
  private readonly logger = new Logger(AIService.name);
  private agent: ReturnType<typeof createReactAgent>;

  constructor(
    @Inject(ANALYSIS_SERVICE)
    private readonly analysisService: IAnalysisService,
    @Inject(SEMANTIC_SERVICE)
    private readonly semanticService: ISemanticService,
  ) {
    const llm = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0,
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.agent = createReactAgent({
      llm,
      tools: toolsRegistry,
    });
  }

  async processRequest(request: AIRequest): Promise<AIResponse> {
    let context: SelectionContext | null = null;
    let profile: SemanticProfile;

    if (request.mode === 'selection') {
      if (!request.selection) {
        throw new Error('Selection is required in selection mode');
      }

      context = this.analysisService.prepareContext({
        selection: request.selection,
      });

      profile = this.semanticService.buildProfile([
        {
          name: context.worksheetName,
          values: context.values,
        },
      ]);
    } else {
      if (!request.sheets || request.sheets.length === 0) {
        throw new Error('Sheets are required in all-sheets mode');
      }

      profile = this.semanticService.buildProfile(request.sheets);
      context = null;
    }

    const userPrompt = buildUserPrompt(request.userMessage, context, profile);

    const result = await this.agent.invoke({
      messages: [
        new SystemMessage(SYSTEM_PROMPT),
        new HumanMessage(userPrompt),
      ],
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const actions = this.extractActions(result.messages);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const finalMessage = this.extractFinalMessage(result.messages);

    if (actions.length === 0) {
      return { type: 'analysis', message: finalMessage };
    }

    if (actions.length === 1) {
      return {
        type: 'action',
        tool: actions[0].tool,
        params: actions[0].params,
        message: finalMessage,
      };
    }

    return { type: 'action', actions, message: finalMessage };
  }

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

  private extractFinalMessage(messages: unknown[]): string {
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i] as { getType?: () => string; content?: unknown };

      if (msg?.getType?.() === 'ai') {
        const content = msg.content;

        if (typeof content === 'string' && content.trim()) {
          return content;
        }

        if (Array.isArray(content)) {
          const text = content
            .filter((b: { type?: string }) => b.type === 'text')
            .map((b: { text?: string }) => b.text ?? '')
            .join('');

          if (text.trim()) {
            return text;
          }
        }
      }
    }

    return 'Done.';
  }
}
