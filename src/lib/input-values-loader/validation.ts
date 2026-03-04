import { InputValueRow, Warning } from './types';
import { YES_NO_MAP } from '@/lib/hdl-common/constants';
import { BOOLEAN_FIELDS } from './constants';

export function validateRows(
  rows: InputValueRow[],
  legislativeDataGroupName: string
): Warning[] {
  const warnings: Warning[] = [];

  if (!legislativeDataGroupName.trim()) {
    warnings.push({
      rowIndex: -1,
      id: 'MISSING_LDG',
      message: 'Legislative Data Group is required',
    });
  }

  rows.forEach((row, i) => {
    if (!row.elementCode.trim()) {
      warnings.push({
        rowIndex: i,
        id: 'MISSING_ELEMENT_CODE',
        message: `Row ${i + 1}: Element Code is required`,
      });
    }

    if (!row.inputValueCode.trim()) {
      warnings.push({
        rowIndex: i,
        id: 'MISSING_INPUT_VALUE_CODE',
        message: `Row ${i + 1}: Input Value Code is required`,
      });
    }

    if (!row.name.trim()) {
      warnings.push({
        rowIndex: i,
        id: 'MISSING_NAME',
        message: `Row ${i + 1}: Name is required`,
      });
    }

    if (!row.uom.trim()) {
      warnings.push({
        rowIndex: i,
        id: 'MISSING_UOM',
        message: `Row ${i + 1}: Unit of Measure is required`,
      });
    }

    // Validate boolean fields
    const fieldLabels: Record<string, string> = {
      displayFlag: 'Displayed',
      allowUserEntryFlag: 'Allow User Entry',
      valueRequiredFlag: 'Value Required',
      createDatabaseItemFlag: 'Create Database Item',
      applyDefaultAtRuntimeFlag: 'Apply Default at Runtime',
    };

    for (const field of BOOLEAN_FIELDS) {
      const val = row[field].trim();
      if (val && !(val in YES_NO_MAP)) {
        warnings.push({
          rowIndex: i,
          id: 'INVALID_BOOLEAN',
          message: `Row ${i + 1}: ${fieldLabels[field]} must be Y, N, Yes, or No`,
        });
      }
    }

    if (!row.displaySequence.trim()) {
      warnings.push({
        rowIndex: i,
        id: 'MISSING_DISPLAY_SEQ',
        message: `Row ${i + 1}: Display Sequence is empty`,
      });
    }
  });

  return warnings;
}
