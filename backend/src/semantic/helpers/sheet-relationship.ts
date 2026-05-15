import {
  SheetRelationship,
  WorkbookRelationships,
} from '../interfaces/sheet-relationship.interface';

// Words that suggest a sheet contains plan/budget data
const PLAN_WORDS = ['plan', 'budget', 'target', 'forecast', 'expected'];

// Words that suggest a sheet contains actual/fact data
const FACT_WORDS = ['actual', 'fact', 'real', 'result', 'actuals', 'sales'];

// Words that suggest a sheet represents a time period
const TIME_WORDS = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
  'q1',
  'q2',
  'q3',
  'q4',
  '2021',
  '2022',
  '2023',
  '2024',
  '2025',
];

// Check if a sheet name contains any word from a given list
function sheetNameContains(sheetName: string, words: string[]): boolean {
  const lowerName = sheetName.toLowerCase();

  for (const word of words) {
    if (lowerName.includes(word)) {
      return true;
    }
  }

  return false;
}

// Find column names that appear in both sheets
function findSharedColumns(headersA: string[], headersB: string[]): string[] {
  const sharedColumns: string[] = [];

  for (const colA of headersA) {
    const lowerColA = colA.toLowerCase().trim();

    for (const colB of headersB) {
      const lowerColB = colB.toLowerCase().trim();

      if (lowerColA === lowerColB) {
        sharedColumns.push(colA);
        break;
      }
    }
  }

  return sharedColumns;
}

// Check if two sheets have exactly the same set of columns
function checkSameStructure(headersA: string[], headersB: string[]): boolean {
  if (headersA.length !== headersB.length) {
    return false;
  }

  const sharedColumns = findSharedColumns(headersA, headersB);
  return sharedColumns.length === headersA.length;
}

// Check if one sheet is a plan/budget counterpart of another
// Example: sheet "Actual" and sheet "Budget" → isFactAndPlan: true
function checkFactAndPlan(sheetNameA: string, sheetNameB: string): boolean {
  const aIsFact = sheetNameContains(sheetNameA, FACT_WORDS);
  const aIsPlan = sheetNameContains(sheetNameA, PLAN_WORDS);
  const bIsFact = sheetNameContains(sheetNameB, FACT_WORDS);
  const bIsPlan = sheetNameContains(sheetNameB, PLAN_WORDS);

  // one sheet is fact AND the other is plan
  return (aIsFact && bIsPlan) || (aIsPlan && bIsFact);
}

// Check if sheet names suggest time periods
// Example: "Q1_2024", "Q2_2024", "Q3_2024" → isTimeSeries: true
function checkTimeSeries(sheetNameA: string, sheetNameB: string): boolean {
  const aIsTime = sheetNameContains(sheetNameA, TIME_WORDS);
  const bIsTime = sheetNameContains(sheetNameB, TIME_WORDS);
  return aIsTime && bIsTime;
}

// Analyze relationship between two specific sheets
function analyzeSheetPair(
  sheetNameA: string,
  headersA: string[],
  sheetNameB: string,
  headersB: string[],
): SheetRelationship {
  const sharedColumns = findSharedColumns(headersA, headersB);
  const isSameStructure = checkSameStructure(headersA, headersB);
  const isFactAndPlan = checkFactAndPlan(sheetNameA, sheetNameB);
  const isTimeSeries = checkTimeSeries(sheetNameA, sheetNameB);

  return {
    sharedColumns: sharedColumns,
    isSameStructure: isSameStructure,
    isFactAndPlan: isFactAndPlan,
    isTimeSeries: isTimeSeries,
  };
}

// --- MAIN EXPORT ---

// Analyzes relationships between all sheets in a workbook
// sheets: array of { name, headers } for each sheet
export function analyzeWorkbookRelationships(
  sheets: Array<{ name: string; headers: string[] }>,
): WorkbookRelationships {
  const pairs: WorkbookRelationships['pairs'] = [];
  let hasFactAndPlan = false;
  let hasTimeSeries = false;

  // Compare every pair of sheets
  for (let i = 0; i < sheets.length; i++) {
    for (let j = i + 1; j < sheets.length; j++) {
      const sheetA = sheets[i];
      const sheetB = sheets[j];

      const relationship = analyzeSheetPair(
        sheetA.name,
        sheetA.headers,
        sheetB.name,
        sheetB.headers,
      );

      pairs.push({
        sheetA: sheetA.name,
        sheetB: sheetB.name,
        relationship: relationship,
      });

      if (relationship.isFactAndPlan) {
        hasFactAndPlan = true;
      }

      if (relationship.isTimeSeries) {
        hasTimeSeries = true;
      }
    }
  }

  return {
    pairs: pairs,
    hasFactAndPlan: hasFactAndPlan,
    hasTimeSeries: hasTimeSeries,
  };
}
