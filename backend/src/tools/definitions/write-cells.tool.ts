export const writeCellsTool = {
  name: 'write_cells',
  description: `Write static values into cells.
    Use this when user wants to add, update or fill in data — 
    not formulas, but actual values like text, numbers, headers.`,
  parameters: {
    type: 'object',
    properties: {
      startCell: {
        type: 'string',
        description: 'Top-left cell of the range to write, e.g. "A1"',
      },
      values: {
        type: 'array',
        description:
          '2D array of values to write, e.g. [["Name","Score"],["Alice",100]]',
        items: { type: 'array', items: {} },
      },
    },
    required: ['startCell', 'values'],
  },
};
