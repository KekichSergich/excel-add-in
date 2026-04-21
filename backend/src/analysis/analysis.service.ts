import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalysisService {
  analyzeSelection(data: {
    selection: {
      worksheetName: string;
      address: string;
      values: unknown[][];
    };
  }) {
    const numbers = data.selection.values
      .flat()
      .filter((cell): cell is number => typeof cell === 'number');

    const count = numbers.length;
    const sum = count > 0 ? numbers.reduce((a, b) => a + b, 0) : null;
    const average = sum !== null ? sum / count : null;
    const min = count > 0 ? Math.min(...numbers) : null;
    const max = count > 0 ? Math.max(...numbers) : null;

    return {
      success: true,
      summary: `Диапазон ${data.selection.address}: найдено ${count} чисел`,
      metrics: { count, sum, average, min, max },
    };
  }
}
