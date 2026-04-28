import { applyFormulaTool } from './definitions/apply-formula.tool';
import { writeCellsTool } from './definitions/write-cells.tool';
import { deleteRangeTool } from './definitions/delete-range.tool';
import { createTableTool } from './definitions/create-table.tool';

// массив всех инструментов — передаётся в LLM при каждом запросе
export const toolsRegistry = [
  applyFormulaTool,
  writeCellsTool,
  deleteRangeTool,
  createTableTool,
];
