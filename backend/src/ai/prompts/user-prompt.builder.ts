import type { SelectionContext } from '../../common/interfaces/selection.interface';
import type { SemanticProfile } from '../../semantic/interfaces/semantic-profile.interface';

export function buildUserPrompt(
  userMessage: string,
  context: SelectionContext | null,
  profile: SemanticProfile,
): string {
  const columnSummary = profile.sheets.map((sheet) => {
    const cols = sheet.columns.map((col) => {
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

  const allIssues: string[] = [];
  for (const sheet of profile.sheets) {
    for (const issue of sheet.qualityIssues) {
      allIssues.push(`[${sheet.name}] ${issue}`);
    }
  }

  const qualitySection =
    allIssues.length > 0
      ? `Data quality issues:\n${allIssues.map((i) => `  - ${i}`).join('\n')}`
      : 'Data quality: no issues detected';

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
      ? `Workbook insights:\n${workbookInsights.map((i) => `  - ${i}`).join('\n')}`
      : '';

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
