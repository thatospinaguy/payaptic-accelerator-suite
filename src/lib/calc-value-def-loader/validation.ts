import { CalcValueDefRow, Warning } from './types';

export function validateRows(
  rows: CalcValueDefRow[],
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
    // MISSING_DEF_NAME
    if (!row.valueDefinitionName.trim()) {
      warnings.push({
        rowIndex: i,
        id: 'MISSING_DEF_NAME',
        message: `Row ${i + 1}: Value Definition Name is required`,
      });
    }

    // MISSING_DATE
    if (!row.effectiveStartDate.trim()) {
      warnings.push({
        rowIndex: i,
        id: 'MISSING_DATE',
        message: `Row ${i + 1}: Effective Start Date is required`,
      });
    }

    // INVALID_DATE_FORMAT
    if (
      row.effectiveStartDate.trim() &&
      !/^\d{4}\/\d{2}\/\d{2}$/.test(row.effectiveStartDate.trim())
    ) {
      warnings.push({
        rowIndex: i,
        id: 'INVALID_DATE_FORMAT',
        message: `Row ${i + 1}: Date must be in YYYY/MM/DD format`,
      });
    }

    // MISSING_LOW_VALUE
    if (!row.lowValue.trim()) {
      warnings.push({
        rowIndex: i,
        id: 'MISSING_LOW_VALUE',
        message: `Row ${i + 1}: Low Value is empty, will default to 0`,
      });
    }

    // MISSING_HIGH_VALUE
    if (!row.highValue.trim()) {
      warnings.push({
        rowIndex: i,
        id: 'MISSING_HIGH_VALUE',
        message: `Row ${i + 1}: High Value is empty, will default to 999999999`,
      });
    }

    // MISSING_RATE
    if (!row.value1.trim()) {
      warnings.push({
        rowIndex: i,
        id: 'MISSING_RATE',
        message: `Row ${i + 1}: Rate/Value is required`,
      });
    }
  });

  return warnings;
}
