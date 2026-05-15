export interface SheetRelationship {
  sharedColumns: string[]; // column names that appear in both sheets
  isSameStructure: boolean; // true if sheets have identical column sets
  isFactAndPlan: boolean; // true if one sheet looks like plan/budget for another
  isTimeSeries: boolean; // true if sheet names suggest time periods
}

export interface WorkbookRelationships {
  pairs: Array<{
    sheetA: string;
    sheetB: string;
    relationship: SheetRelationship;
  }>;
  hasFactAndPlan: boolean; // true if any pair is fact+plan
  hasTimeSeries: boolean; // true if sheets look like time periods
}
