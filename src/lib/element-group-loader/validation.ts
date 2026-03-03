import { ElementGroupRow, Warning } from './types';

export function validateRows(
  rows: ElementGroupRow[],
  legislativeDataGroupName: string
): Warning[] {
  const warnings: Warning[] = [];

  // MISSING_LDG: check session-level LDG
  if (!legislativeDataGroupName.trim()) {
    warnings.push({
      rowIndex: -1,
      id: 'MISSING_LDG',
      message: 'Legislative Data Group is required',
    });
  }

  rows.forEach((row, i) => {
    // MISSING_GROUP_NAME
    if (!row.elementGroupName.trim()) {
      warnings.push({
        rowIndex: i,
        id: 'MISSING_GROUP_NAME',
        message: `Row ${i + 1}: Element Group Name is required`,
      });
    }

    // MISSING_ELEMENT
    if (!row.elementName.trim()) {
      warnings.push({
        rowIndex: i,
        id: 'MISSING_ELEMENT',
        message: `Row ${i + 1}: Element Name is required`,
      });
    }

    // INVALID_INCLUSION
    if (
      row.includeOrExclude !== 'Include' &&
      row.includeOrExclude !== 'Exclude'
    ) {
      warnings.push({
        rowIndex: i,
        id: 'INVALID_INCLUSION',
        message: `Row ${i + 1}: Inclusion Status must be 'Include' or 'Exclude'`,
      });
    }
  });

  return warnings;
}
