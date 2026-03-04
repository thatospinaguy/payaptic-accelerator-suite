import {
  ElementEligibilityRow,
  CostInfoRow,
  CostAllocationAccountRow,
  Warning,
} from './types';
import { VALID_SOURCE_TYPES, VALID_SOURCE_SUB_TYPES } from './constants';

export function validateAll(
  eligibilityRows: ElementEligibilityRow[],
  costInfoRows: CostInfoRow[],
  costAllocationAccountRows: CostAllocationAccountRow[],
  legislativeDataGroupName: string
): Warning[] {
  const warnings: Warning[] = [];

  // Global: MISSING_LDG
  if (!legislativeDataGroupName.trim()) {
    warnings.push({
      rowIndex: -1,
      id: 'MISSING_LDG',
      message: 'Legislative Data Group is required',
    });
  }

  // Eligibility row validation
  eligibilityRows.forEach((row, i) => {
    if (!row.elementCode.trim()) {
      warnings.push({
        rowIndex: i,
        id: 'MISSING_ELEMENT_CODE',
        message: `Eligibility row ${i + 1}: Element Code is required`,
      });
    }

    if (!row.elementEligibilityName.trim()) {
      warnings.push({
        rowIndex: i,
        id: 'MISSING_ELIGIBILITY_NAME',
        message: `Eligibility row ${i + 1}: Element Eligibility Name is required`,
      });
    }
  });

  // Cross-validation: ORPHAN_COSTING
  const eligibilityNames = new Set(
    eligibilityRows.map((r) => r.elementEligibilityName.trim())
  );

  costInfoRows.forEach((row, i) => {
    const name = row.elementEligibilityName.trim();
    if (name && !eligibilityNames.has(name)) {
      warnings.push({
        rowIndex: i,
        id: 'ORPHAN_COSTING',
        message: `Costing record references eligibility '${name}' which does not exist`,
      });
    }

    // INVALID_SOURCE_TYPE
    const st = row.sourceType.trim();
    if (st && !(VALID_SOURCE_TYPES as readonly string[]).includes(st)) {
      warnings.push({
        rowIndex: i,
        id: 'INVALID_SOURCE_TYPE',
        message: `CostInfo row ${i + 1}: Source Type must be 'EL' (Element) or 'LIV' (Link Input Value)`,
      });
    }
  });

  // CostAllocationAccount validation
  costAllocationAccountRows.forEach((row, i) => {
    // MISSING_ACCOUNT
    const hasSegment =
      row.segment1.trim() ||
      row.segment2.trim() ||
      row.segment3.trim() ||
      row.segment4.trim() ||
      row.segment5.trim() ||
      row.segment6.trim();
    if (!hasSegment) {
      warnings.push({
        rowIndex: i,
        id: 'MISSING_ACCOUNT',
        message: `CostAllocationAccount row ${i + 1}: Cost allocation account must have at least one segment value`,
      });
    }

    // INVALID_SOURCE_SUB_TYPE
    const sst = row.sourceSubType.trim();
    if (sst && !(VALID_SOURCE_SUB_TYPES as readonly string[]).includes(sst)) {
      warnings.push({
        rowIndex: i,
        id: 'INVALID_SOURCE_SUB_TYPE',
        message: `CostAllocationAccount row ${i + 1}: Source Sub Type must be 'COST' or 'BAL'`,
      });
    }

    // ORPHAN_COSTING for account rows too
    const name = row.elementEligibilityName.trim();
    if (name && !eligibilityNames.has(name)) {
      warnings.push({
        rowIndex: i,
        id: 'ORPHAN_COSTING',
        message: `CostAllocationAccount record references eligibility '${name}' which does not exist`,
      });
    }
  });

  return warnings;
}
