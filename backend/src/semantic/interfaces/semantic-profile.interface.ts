import { SemanticRole } from '../../common/interfaces/semantic-role.interface';
import { ColumnQuality } from '../interfaces/quality.interface';

// Profile of a single column
export interface ColumnProfile {
  name: string;
  type: 'string' | 'number' | 'date' | 'mixed';
  semanticRole: SemanticRole;
  quality: ColumnQuality;
}

// Profile of a single sheet
export interface SheetProfile {
  name: string;
  rowCount: number;
  colCount: number;
  columns: ColumnProfile[];
  duplicateRowCount: number;
  qualityScore: number;
  qualityIssues: string[];
}

// Profile of the entire workbook — final result of semantic analysis
export interface SemanticProfile {
  sheets: SheetProfile[];
  hasFactAndPlan: boolean;
  hasTimeSeries: boolean;
  sharedColumnPairs: Array<{
    sheetA: string;
    sheetB: string;
    sharedColumns: string[];
  }>;
}

// Input format — what the frontend sends to the backend
export interface SheetInput {
  name: string;
  values: unknown[][]; // first row is headers, rest is data
}
