import { InputValueRow } from './types';
import { METADATA_LINE } from './constants';
import { YES_NO_MAP } from '@/lib/hdl-common/constants';

function normalizeYesNo(value: string): string {
  const trimmed = value.trim();
  if (trimmed in YES_NO_MAP) {
    return YES_NO_MAP[trimmed];
  }
  return trimmed;
}

export function generateInputValueLine(
  row: InputValueRow,
  action: 'MERGE' | 'DELETE'
): string {
  // Build row with Y/N normalization on boolean fields only (NOT defaultValue)
  const fields = [
    action,
    'InputValue',
    row.legislativeDataGroupName,
    row.elementCode,
    row.inputValueCode,
    row.name,
    row.displaySequence,
    row.specialPurpose,
    row.uom,
    row.effectiveStartDate,
    normalizeYesNo(row.displayFlag),
    normalizeYesNo(row.allowUserEntryFlag),
    normalizeYesNo(row.valueRequiredFlag),
    normalizeYesNo(row.createDatabaseItemFlag),
    row.defaultValue, // CRITICAL: no Y/N normalization — free-text field
    normalizeYesNo(row.applyDefaultAtRuntimeFlag),
    row.lookupType,
    row.referenceCode,
    row.minimumValue,
    row.maximumValue,
    row.valueSet,
    row.validationFormulaCode,
    row.validationSource,
    row.warningOrError,
    row.rateFormulaCode,
  ];

  return fields.join('|');
}

export function generateDatContent(
  rows: InputValueRow[],
  action: 'MERGE' | 'DELETE'
): string {
  const lines = [
    METADATA_LINE,
    ...rows.map((row) => generateInputValueLine(row, action)),
  ];
  return lines.join('\n');
}
