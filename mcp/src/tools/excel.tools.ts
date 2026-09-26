import { z } from 'zod';

export const applyFormulaSchema = {
  cell: z.string().describe('Target cell address, e.g. "E1" or "F10"'),
  formula: z
    .string()
    .describe('Excel formula, e.g. "=SUM(B2:B10)" or "=AVERAGE(C2:C20)"')
};

export const writeCellsSchema = {
  startCell: z
    .string()
    .describe('Top-left cell of the range to write, e.g. "A1"'),
  values: z
    .array(z.array(z.union([z.string(), z.number(), z.boolean(), z.null()])))
    .describe('2D array of values, e.g. [["Name","Score"],["Alice",100]]')
}

export const deleteRangeSchema = {
  range: z.string().describe('Range to clear, e.g. "A1:D10" or "B2:B20"'),
};

export const createTableSchema = {
  startCell: z
    .string()
    .describe('Top-left cell where table starts, e.g. "A1"'),
  headers: z
    .array(z.string())
    .describe('Column headers, e.g. ["Name", "Age", "Score"]'),
  rows: z
    .array(z.array(z.union([z.string(), z.number(), z.boolean(), z.null()])))
    .optional()
    .describe('Optional data rows, e.g. [["Alice", 25, 90]]'),
};

export const readRangeSchema = {
  range: z
    .string()
    .describe('Range to read, e.g. "A1:D10". Single cell is also valid, e.g. "B2"'),
};