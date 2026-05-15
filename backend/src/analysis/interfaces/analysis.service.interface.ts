import type { SelectionContext } from '../../common/interfaces/selection.interface';

export interface IAnalysisService {
  prepareContext(data: {
    selection: {
      worksheetName: string;
      address: string;
      values: unknown[][];
    };
  }): SelectionContext;
}

export const ANALYSIS_SERVICE = 'ANALYSIS_SERVICE';
