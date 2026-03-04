import { ElementReportingNameRow } from './types';
import { METADATA_HEADER } from './constants';
import { LANGUAGE_MAP } from '@/lib/hdl-common/constants';

function resolveLanguageCode(language: string): string {
  return LANGUAGE_MAP[language] || language;
}

export function generateHdlLine(
  row: ElementReportingNameRow,
  action: 'MERGE' | 'DELETE'
): string {
  return [
    action,
    'PayrollElementDefinitionTranslation',
    row.legislativeDataGroupName,
    resolveLanguageCode(row.language),
    row.elementCode,
    row.elementName,
    row.reportingName,
    row.description,
  ].join('|');
}

export function generateDatContent(
  rows: ElementReportingNameRow[],
  action: 'MERGE' | 'DELETE'
): string {
  const lines = [
    METADATA_HEADER,
    ...rows.map((row) => generateHdlLine(row, action)),
  ];
  return lines.join('\n');
}
