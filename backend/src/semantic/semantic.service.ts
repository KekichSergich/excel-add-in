import { Injectable } from '@nestjs/common';
import { detectSemanticRole } from './helpers/role-detector';
import { analyzeSheetQuality } from './helpers/quality-analyzer';
import { analyzeWorkbookRelationships } from './helpers/sheet-relationship';
import {
  ColumnProfile,
  SemanticProfile,
  SheetInput,
  SheetProfile,
} from './interfaces/semantic-profile.interface';

@Injectable()
export class SemanticService {
  // Main method — receives all sheets, returns full semantic profile
  buildProfile(sheets: SheetInput[]): SemanticProfile {
    const sheetProfiles: SheetProfile[] = [];

    // Analyze each sheet separately
    for (const sheet of sheets) {
      const sheetProfile = this.analyzeSheet(sheet);
      sheetProfiles.push(sheetProfile);
    }

    // Analyze relationships between sheets
    const sheetsForRelationship = sheetProfiles.map(function (sheet) {
      return {
        name: sheet.name,
        headers: sheet.columns.map(function (col) {
          return col.name;
        }),
      };
    });

    const relationships = analyzeWorkbookRelationships(sheetsForRelationship);

    // Collect shared column pairs for the profile
    const sharedColumnPairs = relationships.pairs
      .filter(function (pair) {
        return pair.relationship.sharedColumns.length > 0;
      })
      .map(function (pair) {
        return {
          sheetA: pair.sheetA,
          sheetB: pair.sheetB,
          sharedColumns: pair.relationship.sharedColumns,
        };
      });

    return {
      sheets: sheetProfiles,
      hasFactAndPlan: relationships.hasFactAndPlan,
      hasTimeSeries: relationships.hasTimeSeries,
      sharedColumnPairs: sharedColumnPairs,
    };
  }

  // Remove empty columns and rows before analysis
  // Empty column = header is empty or all values in the column are empty
  private cleanSheet(sheet: SheetInput): SheetInput {
    if (sheet.values.length === 0) {
      return sheet;
    }

    const headers = sheet.values[0];
    const dataRows = sheet.values.slice(1);

    // Step 1: find indexes of non-empty columns
    // A column is non-empty if it has a non-empty header OR at least one non-empty value
    const nonEmptyColIndexes: number[] = [];

    for (let colIndex = 0; colIndex < headers.length; colIndex++) {
      const header = headers[colIndex];
      const hasHeader =
        header !== null && header !== undefined && header !== '';

      const hasValues = dataRows.some(function (row) {
        const value = row[colIndex];
        return value !== null && value !== undefined && value !== '';
      });

      if (hasHeader || hasValues) {
        nonEmptyColIndexes.push(colIndex);
      }
    }

    // Step 2: filter headers to keep only non-empty columns
    const cleanedHeaders = nonEmptyColIndexes.map(function (colIndex) {
      return headers[colIndex];
    });

    // Step 3: filter rows to keep only non-empty columns
    // Also skip completely empty rows
    const cleanedRows = dataRows
      .filter(function (row) {
        // A row is non-empty if at least one of its non-empty columns has a value
        return nonEmptyColIndexes.some(function (colIndex) {
          const value = row[colIndex];
          return value !== null && value !== undefined && value !== '';
        });
      })
      .map(function (row) {
        return nonEmptyColIndexes.map(function (colIndex) {
          return row[colIndex];
        });
      });

    return {
      name: sheet.name,
      values: [cleanedHeaders, ...cleanedRows],
    };
  }

  // Analyze a single sheet — returns its full profile
  private analyzeSheet(sheet: SheetInput): SheetProfile {
    const cleanedSheet = this.cleanSheet(sheet);

    const headers =
      cleanedSheet.values.length > 0 ? cleanedSheet.values[0] : [];
    const dataRows = cleanedSheet.values.slice(1);

    // Analyze quality for the whole sheet
    const quality = analyzeSheetQuality(headers, dataRows);

    // Build profile for each column
    const columnProfiles: ColumnProfile[] = [];

    for (let colIndex = 0; colIndex < headers.length; colIndex++) {
      const colName = String(headers[colIndex]);

      // Collect all values in this column
      const colValues = dataRows.map(function (row) {
        return row[colIndex];
      });

      // Detect basic type
      const colType = this.detectColumnType(colValues);

      // Detect semantic role
      const semanticRole = detectSemanticRole(colName, colValues);

      columnProfiles.push({
        name: colName,
        type: colType,
        semanticRole: semanticRole,
        quality: quality.columns[colName],
      });
    }

    return {
      name: sheet.name,
      rowCount: dataRows.length,
      colCount: headers.length,
      columns: columnProfiles,
      duplicateRowCount: quality.duplicateRowCount,
      qualityScore: quality.qualityScore,
      qualityIssues: quality.qualityIssues,
    };
  }

  // Detect basic data type of a column based on its values
  private detectColumnType(
    values: unknown[],
  ): 'string' | 'number' | 'date' | 'mixed' {
    const nonEmpty = values.filter(function (v) {
      return v !== null && v !== undefined && v !== '';
    });

    if (nonEmpty.length === 0) {
      return 'string';
    }

    const allNumbers = nonEmpty.every(function (v) {
      return typeof v === 'number';
    });

    if (allNumbers) {
      return 'number';
    }

    const allStrings = nonEmpty.every(function (v) {
      return typeof v === 'string';
    });

    if (allStrings) {
      return 'string';
    }

    return 'mixed';
  }
}
