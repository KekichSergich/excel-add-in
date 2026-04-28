import { Injectable } from '@nestjs/common';

export interface SelectionContext {
  worksheetName: string;
  address: string;
  values: unknown[][];
  headers: unknown[];
  dataRows: unknown[][];
  rowCount: number;
  colCount: number;
  dataTypes: string[];
}

@Injectable()
export class AnalysisService {
  prepareContext(data: {
    selection: {
      worksheetName: string;
      address: string;
      values: unknown[][];
    };
  }): SelectionContext {
    const { worksheetName, address, values } = data.selection;

    // берём первую строку как заголовки
    // если таблица пустая — заголовков нет
    const headers = values.length > 0 ? values[0] : [];

    // всё кроме первой строки — это данные
    const dataRows = values.slice(1);

    const rowCount = dataRows.length;
    const colCount = headers.length;

    // для каждой колонки определяем тип данных
    // смотрим на все значения в колонке и делаем вывод
    const dataTypes = Array.from({ length: colCount }, (_, colIndex) => {
      // берём все непустые значения в этой колонке
      const colValues = dataRows
        .map((row) => row[colIndex])
        .filter((v) => v !== null && v !== '' && v !== undefined);

      // если все числа — number
      if (colValues.every((v) => typeof v === 'number')) return 'number';

      // если все строки — string
      if (colValues.every((v) => typeof v === 'string')) return 'string';

      // если вперемешку — mixed
      return 'mixed';
    });

    return {
      worksheetName,
      address,
      values,
      headers,
      dataRows,
      rowCount,
      colCount,
      dataTypes,
    };
  }
}
