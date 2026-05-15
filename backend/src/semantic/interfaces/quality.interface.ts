// Result of quality analysis for a single column
export interface ColumnQuality {
  nullCount: number;
  nullPercent: number;
  outlierCount: number;
  outliers: number[];
  hasMixedTypes: boolean;
}

// Result of quality analysis for an entire sheet
export interface SheetQuality {
  duplicateRowCount: number;
  qualityScore: number;
  qualityIssues: string[];
  columns: Record<string, ColumnQuality>;
}
