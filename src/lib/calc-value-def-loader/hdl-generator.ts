import { CalcValueDefRow } from './types';
import {
  METADATA_VALUE_DEFINITION,
  METADATA_RANGE_ITEM,
} from './constants';

export function generateValueDefinitionLine(
  row: CalcValueDefRow,
  action: 'MERGE' | 'DELETE'
): string {
  return [
    action,
    'ValueDefinition',
    row.legislativeDataGroupName,
    row.effectiveStartDate,
    row.valueDefinitionName,
  ].join('|');
}

export function generateRangeItemLine(
  row: CalcValueDefRow,
  action: 'MERGE' | 'DELETE'
): string {
  return [
    action,
    'RangeItem',
    row.legislativeDataGroupName,
    row.effectiveStartDate,
    row.valueDefinitionName,
    row.lowValue || '0',
    row.highValue || '999999999',
    row.value1,
  ].join('|');
}

export function generateDatContent(
  rows: CalcValueDefRow[],
  action: 'MERGE' | 'DELETE'
): string {
  const lines = [
    METADATA_VALUE_DEFINITION,
    METADATA_RANGE_ITEM,
    ...rows.map((row) => generateValueDefinitionLine(row, action)),
    ...rows.map((row) => generateRangeItemLine(row, action)),
  ];
  return lines.join('\n');
}
