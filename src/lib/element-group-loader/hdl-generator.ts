import { ElementGroupRow } from './types';
import { METADATA_HEADER, OBJECT_GROUP_LEVEL_NAME } from './constants';

export function generateHdlLine(
  row: ElementGroupRow,
  action: 'MERGE' | 'DELETE'
): string {
  return [
    action,
    'ObjectGroupAmend',
    row.legislativeDataGroupName,
    row.elementGroupName,
    OBJECT_GROUP_LEVEL_NAME,
    row.elementName,
    row.includeOrExclude,
  ].join('|');
}

export function generateDatContent(
  rows: ElementGroupRow[],
  action: 'MERGE' | 'DELETE'
): string {
  const lines = [
    METADATA_HEADER,
    ...rows.map((row) => generateHdlLine(row, action)),
  ];
  return lines.join('\n');
}
