export const deleteRangeTool = {
  name: 'delete_range',
  description: `Clear the content of a cell range.
    Use this when user wants to delete, remove or clear data from cells.`,
  parameters: {
    type: 'object',
    properties: {
      range: {
        type: 'string',
        description: 'Range to clear, e.g. "A1:D10" or "B2:B20"',
      },
    },
    required: ['range'],
  },
};
