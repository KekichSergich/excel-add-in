export const applyFormulaTool = {
  name: 'apply_formula',
  description: `Insert an Excel formula into a specific cell. 
    Use this when user wants to calculate something: 
    sum, average, min, max, count, conditional calculations, etc.`,
  parameters: {
    type: 'object',
    properties: {
      cell: {
        type: 'string',
        description: 'Target cell address, e.g. "E1" or "F10"',
      },
      formula: {
        type: 'string',
        description:
          'Excel formula, e.g. "=SUM(B2:B10)" or "=SUMIF(A2:A10, \\"Alice\\", B2:B10)"',
      },
    },
    required: ['cell', 'formula'],
  },
};
