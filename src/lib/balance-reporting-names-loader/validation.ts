import { BalanceReportingNameRow, Warning } from './types';
import { LANGUAGE_MAP } from '@/lib/hdl-common/constants';

export function validateRows(
  rows: BalanceReportingNameRow[],
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
    // MISSING_LANGUAGE
    if (!row.language.trim()) {
      warnings.push({
        rowIndex: i,
        id: 'MISSING_LANGUAGE',
        message: `Row ${i + 1}: Language is required`,
      });
    } else if (!(row.language in LANGUAGE_MAP)) {
      // INVALID_LANGUAGE
      warnings.push({
        rowIndex: i,
        id: 'INVALID_LANGUAGE',
        message: `Row ${i + 1}: Language must be 'American English' (US) or 'Canadian French' (FRC)`,
      });
    }

    // MISSING_BALANCE_NAME
    if (!row.balanceName.trim()) {
      warnings.push({
        rowIndex: i,
        id: 'MISSING_BALANCE_NAME',
        message: `Row ${i + 1}: Balance Name is required`,
      });
    }

    // MISSING_BALANCE_CODE
    if (!row.balanceCode.trim()) {
      warnings.push({
        rowIndex: i,
        id: 'MISSING_BALANCE_CODE',
        message: `Row ${i + 1}: Balance Code is required`,
      });
    }

    // MISSING_REPORTING_NAME
    if (!row.reportingName.trim()) {
      warnings.push({
        rowIndex: i,
        id: 'MISSING_REPORTING_NAME',
        message: `Row ${i + 1}: Reporting Name is required`,
      });
    }

    // EMPTY_DESCRIPTION (warning, not error)
    if (!row.description.trim()) {
      warnings.push({
        rowIndex: i,
        id: 'EMPTY_DESCRIPTION',
        message: `Row ${i + 1}: Description is empty — will load blank`,
      });
    }
  });

  return warnings;
}
