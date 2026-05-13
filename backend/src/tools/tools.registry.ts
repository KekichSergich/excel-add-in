import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

// Each tool is a DynamicStructuredTool.
// func() does not execute the action in Excel directly (impossible from backend).
// Instead it serializes the call into a JSON string which the agent
// returns as part of the message. The frontend parses actions[] and
// applies each one via Office.js API.

export const applyFormulaTool = new DynamicStructuredTool({
  name: 'apply_formula',
  description: `Insert an Excel formula into a specific cell.
    Use this when user wants to calculate something:
    sum, average, min, max, count, conditional calculations, etc.`,
  schema: z.object({
    cell: z.string().describe('Target cell address, e.g. "E1" or "F10"'),
    formula: z
      .string()
      .describe('Excel formula, e.g. "=SUM(B2:B10)" or "=AVERAGE(C2:C20)"'),
  }),
  // eslint-disable-next-line @typescript-eslint/require-await
  func: async (params) => {
    return JSON.stringify({ tool: 'apply_formula', params });
  },
});

export const writeCellsTool = new DynamicStructuredTool({
  name: 'write_cells',
  description: `Write static values into cells.
    Use this when user wants to add, update or fill in data —
    not formulas, but actual values like text, numbers, headers.`,
  schema: z.object({
    startCell: z
      .string()
      .describe('Top-left cell of the range to write, e.g. "A1"'),
    values: z
      .array(z.array(z.unknown()))
      .describe('2D array of values, e.g. [["Name","Score"],["Alice",100]]'),
  }),
  // eslint-disable-next-line @typescript-eslint/require-await
  func: async (params) => {
    return JSON.stringify({ tool: 'write_cells', params });
  },
});

export const deleteRangeTool = new DynamicStructuredTool({
  name: 'delete_range',
  description: `Clear the content of a cell range.
    Use this when user wants to delete, remove or clear data from cells.`,
  schema: z.object({
    range: z.string().describe('Range to clear, e.g. "A1:D10" or "B2:B20"'),
  }),
  // eslint-disable-next-line @typescript-eslint/require-await
  func: async (params) => {
    return JSON.stringify({ tool: 'delete_range', params });
  },
});

export const createTableTool = new DynamicStructuredTool({
  name: 'create_table',
  description: `Create a new table with headers and optional data rows.
    Use this when user wants to generate a new table from scratch.`,
  schema: z.object({
    startCell: z
      .string()
      .describe('Top-left cell where table starts, e.g. "A1"'),
    headers: z
      .array(z.string())
      .describe('Column headers, e.g. ["Name", "Age", "Score"]'),
    rows: z
      .array(z.array(z.unknown()))
      .optional()
      .describe('Optional data rows, e.g. [["Alice", 25, 90]]'),
  }),
  // eslint-disable-next-line @typescript-eslint/require-await
  func: async (params) => {
    return JSON.stringify({ tool: 'create_table', params });
  },
});

// All tools array — passed to the LangGraph agent
export const toolsRegistry = [
  applyFormulaTool,
  writeCellsTool,
  deleteRangeTool,
  createTableTool,
];
