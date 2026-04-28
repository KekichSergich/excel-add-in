export const createTableTool = {
  name: 'create_table',
  description: `Create a new table with headers and optional data rows.
    Use this when user wants to generate a new table from scratch.`,
  parameters: {
    type: 'object',
    properties: {
      startCell: {
        type: 'string',
        description: 'Top-left cell where table starts, e.g. "A1"',
      },
      headers: {
        type: 'array',
        description: 'Column headers, e.g. ["Name", "Age", "Score"]',
        items: { type: 'string' },
      },
      rows: {
        type: 'array',
        description: 'Optional data rows, e.g. [["Alice", 25, 90]]',
        items: { type: 'array', items: {} },
      },
    },
    required: ['startCell', 'headers'],
  },
};
