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
      // Selection mode — use selected range for both context and profile
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
      // All-sheets mode — use all sheets for profile
      if (!request.sheets || request.sheets.length === 0) {
        throw new Error('Sheets are required in all-sheets mode');
      }

      profile = this.semanticService.buildProfile(request.sheets);

      // Context is null — no selected range in this mode
      context = null;
    }

    // Build user prompt
    const userPrompt = this.buildUserPrompt(
      request.userMessage,
      context,
      profile,
    );

    // Run the agent
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

  private buildUserPrompt(
    userMessage: string,
    context: SelectionContext | null,
    profile: SemanticProfile,
  ): string {
    // Build column semantic summary — one line per column
    const columnSummary = profile.sheets.map(function (sheet) {
      const cols = sheet.columns.map(function (col) {
        const parts: string[] = [];
        parts.push(`name: ${col.name}`);
        parts.push(`role: ${col.semanticRole}`);
        parts.push(`type: ${col.type}`);

        if (col.quality.nullPercent > 0) {
          parts.push(`missing: ${col.quality.nullPercent}%`);
        }

        if (col.quality.outlierCount > 0) {
          parts.push(`outliers: ${col.quality.outlierCount}`);
        }

        return `    - ${parts.join(', ')}`;
      });

      return `  Sheet "${sheet.name}" (${sheet.rowCount} rows, quality: ${sheet.qualityScore}/100):\n${cols.join('\n')}`;
    });

    // Build quality issues summary across all sheets
    const allIssues: string[] = [];
    for (const sheet of profile.sheets) {
      for (const issue of sheet.qualityIssues) {
        allIssues.push(`[${sheet.name}] ${issue}`);
      }
    }

    const qualitySection =
      allIssues.length > 0
        ? `Data quality issues:\n${allIssues
            .map(function (i) {
              return `  - ${i}`;
            })
            .join('\n')}`
        : 'Data quality: no issues detected';

    // Build workbook-level insights
    const workbookInsights: string[] = [];

    if (profile.hasFactAndPlan) {
      workbookInsights.push(
        'Workbook contains Fact vs Plan sheets — variance analysis is possible',
      );
    }

    if (profile.hasTimeSeries) {
      workbookInsights.push(
        'Workbook contains time-series sheets — trend analysis is possible',
      );
    }

    const workbookSection =
      workbookInsights.length > 0
        ? `Workbook insights:\n${workbookInsights
            .map(function (i) {
              return `  - ${i}`;
            })
            .join('\n')}`
        : '';

    // Build selection context section — only in selection mode
    const selectionSection =
      context !== null
        ? `Selected range context:
  - Worksheet: ${context.worksheetName}
  - Address: ${context.address}
  - Row count: ${context.rowCount}

  Raw data:
  ${JSON.stringify(context.dataRows, null, 2)}`
        : 'Mode: full workbook analysis — no specific range selected';

    return `
  User request: "${userMessage}"

  ${selectionSection}

  Semantic profile of the workbook:
  ${columnSummary.join('\n\n')}

  ${qualitySection}
  ${workbookSection}
    `.trim();
  }

  // Walk through all agent messages and collect tool invocations
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

  // Return the last AI message text as the final user-facing response
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
            .filter(function (b: { type?: string }) {
              return b.type === 'text';
            })
            .map(function (b: { text?: string }) {
              return b.text ?? '';
            })
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
