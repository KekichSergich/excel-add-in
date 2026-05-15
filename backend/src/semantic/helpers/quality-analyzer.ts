import { ColumnQuality, SheetQuality } from '../interfaces/quality.interface';

// --- PART 1: Missing values ---
// Returns how many values in a column are empty
function countNulls(values: unknown[]): number {
  let count = 0;

  for (const value of values) {
    if (value === null || value === undefined || value === '') {
      count = count + 1;
    }
  }

  return count;
}

// --- PART 2: Outlier detection using IQR method ---

// IQR (Interquartile Range) method:
// 1. Sort all numbers
// 2. Find Q1 (25th percentile) and Q3 (75th percentile)
// 3. IQR = Q3 - Q1
// 4. Anything below Q1 - 1.5*IQR or above Q3 + 1.5*IQR is an outlier
function getPercentile(sortedNumbers: number[], percentile: number): number {
  // percentile is a value between 0 and 1, e.g. 0.25 for Q1
  const index = percentile * (sortedNumbers.length - 1);
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);

  // if index is a whole number — return exact value
  if (lowerIndex === upperIndex) {
    return sortedNumbers[lowerIndex];
  }

  // otherwise interpolate between two nearest values
  const lowerValue = sortedNumbers[lowerIndex];
  const upperValue = sortedNumbers[upperIndex];
  const fraction = index - lowerIndex;

  return lowerValue + fraction * (upperValue - lowerValue);
}

function detectOutliers(values: unknown[]): number[] {
  // keep only actual numbers
  const numbers: number[] = [];

  for (const value of values) {
    if (typeof value === 'number' && !isNaN(value)) {
      numbers.push(value);
    }
  }

  // need at least 4 values to make IQR meaningful
  if (numbers.length < 4) {
    return [];
  }

  const sorted = [...numbers].sort(function (a, b) {
    return a - b;
  });

  const q1 = getPercentile(sorted, 0.25);
  const q3 = getPercentile(sorted, 0.75);
  const iqr = q3 - q1;

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const outliers: number[] = [];

  for (const number of numbers) {
    if (number < lowerBound || number > upperBound) {
      outliers.push(number);
    }
  }

  return outliers;
}

// --- PART 3: Mixed types detection ---

// A column has mixed types if it contains both numbers and strings
// Example: [10, 20, "N/A", 15, "—"] → hasMixedTypes: true
function hasMixedTypes(values: unknown[]): boolean {
  const nonEmpty = values.filter(function (v) {
    return v !== null && v !== undefined && v !== '';
  });

  if (nonEmpty.length === 0) {
    return false;
  }

  let hasNumbers = false;
  let hasStrings = false;

  for (const value of nonEmpty) {
    if (typeof value === 'number') {
      hasNumbers = true;
    }
    if (typeof value === 'string') {
      hasStrings = true;
    }
    // if both found already — no need to continue
    if (hasNumbers && hasStrings) {
      return true;
    }
  }

  return false;
}

// --- PART 4: Duplicate row detection ---

// Two rows are duplicates if all their values are identical
// We convert each row to a string and compare
function countDuplicateRows(dataRows: unknown[][]): number {
  const seen = new Set<string>();
  let duplicateCount = 0;

  for (const row of dataRows) {
    // convert row to string so we can store it in a Set
    const rowKey = JSON.stringify(row);

    if (seen.has(rowKey)) {
      duplicateCount = duplicateCount + 1;
    } else {
      seen.add(rowKey);
    }
  }

  return duplicateCount;
}

// --- PART 5: Quality score calculation ---

// Score starts at 100 and gets reduced by each quality issue found
// Final score is clamped between 0 and 100
function calculateQualityScore(
  columns: Record<string, ColumnQuality>,
  totalRows: number,
  duplicateRowCount: number,
): number {
  let score = 100;

  // Penalty for missing values across all columns
  for (const colName in columns) {
    const col = columns[colName];
    score = score - col.nullPercent * 0.5;
  }

  // Penalty for outliers across all columns
  for (const colName in columns) {
    const col = columns[colName];
    if (col.outlierCount > 0 && totalRows > 0) {
      const outlierPercent = (col.outlierCount / totalRows) * 100;
      score = score - outlierPercent * 0.3;
    }
  }

  // Penalty for duplicate rows
  if (totalRows > 0) {
    const duplicatePercent = (duplicateRowCount / totalRows) * 100;
    score = score - duplicatePercent * 0.2;
  }

  // Clamp between 0 and 100
  if (score < 0) {
    score = 0;
  }
  if (score > 100) {
    score = 100;
  }

  return Math.round(score);
}

// --- PART 6: Quality issues as human-readable strings ---

// Collects all detected problems into a list of readable messages
// These are shown to the user and passed to LLM as context
function collectQualityIssues(
  columns: Record<string, ColumnQuality>,
  duplicateRowCount: number,
): string[] {
  const issues: string[] = [];

  for (const colName in columns) {
    const col = columns[colName];

    if (col.nullCount > 0) {
      issues.push(`${col.nullCount} missing values in column "${colName}"`);
    }

    if (col.outlierCount > 0) {
      issues.push(
        `${col.outlierCount} outliers detected in column "${colName}"`,
      );
    }

    if (col.hasMixedTypes) {
      issues.push(`Mixed types detected in column "${colName}"`);
    }
  }

  if (duplicateRowCount > 0) {
    issues.push(`${duplicateRowCount} duplicate rows detected`);
  }

  return issues;
}

// --- MAIN EXPORT ---

// Runs full quality analysis for one sheet
// headers: column names, dataRows: all rows except the header row
export function analyzeSheetQuality(
  headers: unknown[],
  dataRows: unknown[][],
): SheetQuality {
  const columns: Record<string, ColumnQuality> = {};

  // Analyze each column separately
  for (let colIndex = 0; colIndex < headers.length; colIndex++) {
    const colName = String(headers[colIndex]);

    // Collect all values in this column across all rows
    const colValues = dataRows.map(function (row) {
      return row[colIndex];
    });

    const nullCount = countNulls(colValues);
    const nullPercent =
      dataRows.length > 0 ? (nullCount / dataRows.length) * 100 : 0;

    const outliersFound = detectOutliers(colValues);
    const mixedTypes = hasMixedTypes(colValues);

    columns[colName] = {
      nullCount: nullCount,
      nullPercent: Math.round(nullPercent),
      outlierCount: outliersFound.length,
      outliers: outliersFound,
      hasMixedTypes: mixedTypes,
    };
  }

  const duplicateRowCount = countDuplicateRows(dataRows);
  const qualityScore = calculateQualityScore(
    columns,
    dataRows.length,
    duplicateRowCount,
  );
  const qualityIssues = collectQualityIssues(columns, duplicateRowCount);

  return {
    duplicateRowCount: duplicateRowCount,
    qualityScore: qualityScore,
    qualityIssues: qualityIssues,
    columns: columns,
  };
}
