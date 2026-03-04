import { ElementReportingNameRow, Warning } from './types';
import { LANGUAGE_MAP } from '@/lib/hdl-common/constants';

export function validateRows(
  rows: ElementReportingNameRow[],
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

    // MISSING_ELEMENT_CODE
    if (!row.elementCode.trim()) {
      warnings.push({
        rowIndex: i,
        id: 'MISSING_ELEMENT_CODE',
        message: `Row ${i + 1}: Element Code is required`,
      });
    }

    // MISSING_ELEMENT_NAME
    if (!row.elementName.trim()) {
      warnings.push({
        rowIndex: i,
        id: 'MISSING_ELEMENT_NAME',
        message: `Row ${i + 1}: Element Name is required`,
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
