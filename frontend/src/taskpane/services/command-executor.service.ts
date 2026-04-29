
export async function executeAction(
  tool: string,
  params: Record<string, unknown>
): Promise<void> {
  switch (tool) {
    case "apply_formula":
      await applyFormula(params);
      break;
    case "create_table":
      await createTable(params);
      break;
    case "write_cells":
      await writeCells(params);
      break;
    case "delete_range":
      await deleteRange(params);
      break;
    default:
      console.warn(`Unknow tool: ${tool}`);
  }
}

async function applyFormula(params: Record<string, unknown>): Promise<void>{
  const cell = params.cell as string;
  const formula = params.formula as string;

  await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    const range = sheet.getRange(cell);
    range.formulas = [[formula]]; 
    await context.sync();
  })
}

async function writeCells(params: Record<string, unknown>): Promise<void> {
  const startCell = params.startCell as string;
  const values = params.values as unknown[][];

  if (!values || values.length === 0) {
    console.warn("writeCells: empty values array");
    return;
  }

  const rowCount = values.length;
  const colCount = values[0].length;

  await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    const range = sheet.getRange(startCell).getResizedRange(rowCount - 1, colCount - 1);
    range.values = values;
    await context.sync();
  });
}

async function deleteRange(params: Record<string, unknown>): Promise<void> {
  const paramRange = params.range as string;

  await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    const range = sheet.getRange(paramRange);
    range.clear();
    await context.sync();
  });
}

async function createTable(params: Record<string, unknown>): Promise<void> {
  const startCell = params.startCell as string;
  const headers = params.headers as string[];
  const rows = (params.rows as unknown[][]) ?? [];
  const allData = [headers, ...rows];

  const rowCount = allData.length;
  const colCount = allData[0].length;

  await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    const range = sheet.getRange(startCell).getResizedRange(rowCount - 1, colCount - 1);
    range.values = allData;
    range.getRow(0).format.font.bold = true;
    await context.sync();
  });
}