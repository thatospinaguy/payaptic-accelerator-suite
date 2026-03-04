import {
  ElementEligibilityRow,
  CostInfoRow,
  CostAllocationRow,
  CostAllocationAccountRow,
  GeneratedFiles,
} from './types';
import {
  METADATA_ELIGIBILITY,
  METADATA_COST_INFO,
  METADATA_COST_ALLOCATION,
  METADATA_COST_ALLOCATION_ACCOUNT,
} from './constants';

// NOTE: AutomaticEntryFlag outputs "Yes" or "No" — NOT "Y" or "N".
// Do NOT apply YES_NO_MAP normalization for this HDL.

export function generateEligibilityLine(
  row: ElementEligibilityRow,
  action: 'MERGE' | 'DELETE'
): string {
  return [
    action,
    'ElementEligibility',
    row.legislativeDataGroupName,
    row.elementCode,
    row.elementEligibilityName,
    row.effectiveStartDate,
    row.payrollStatUnitCode,
    row.legalEmployerCode,
    row.payrollCode,
    row.bargainingUnitCode,
    row.automaticEntryFlag,
    row.peopleGroup,
    row.costingLinkFlag,
  ].join('|');
}

export function generateCostInfoLine(
  row: CostInfoRow,
  action: 'MERGE' | 'DELETE'
): string {
  return [
    action,
    'CostInfoV3',
    row.costableType,
    row.distributionSetName,
    row.costedFlag,
    row.effectiveEndDate,
    row.effectiveStartDate,
    row.sourceType,
    row.transferToGlFlag,
    row.legislativeDataGroupName,
    row.elementCode,
    row.elementEligibilityName,
    row.linkInputName,
  ].join('|');
}

export function generateCostAllocationLine(
  row: CostAllocationRow,
  action: 'MERGE' | 'DELETE'
): string {
  return [
    action,
    'CostAllocationV3',
    row.effectiveEndDate,
    row.effectiveStartDate,
    row.sourceType,
    row.elementCode,
    row.elementEligibilityName,
    row.legislativeDataGroupName,
  ].join('|');
}

export function generateCostAllocationAccountLine(
  row: CostAllocationAccountRow,
  action: 'MERGE' | 'DELETE'
): string {
  return [
    action,
    'CostAllocationAccountV3',
    row.sourceType,
    row.segment1,
    row.segment2,
    row.segment3,
    row.segment4,
    row.segment5,
    row.segment6,
    row.sourceSubType,
    row.legislativeDataGroupName,
    row.elementCode,
    row.elementEligibilityName,
    row.effectiveDate,
    row.proportion,
    row.subTypeSequence,
  ].join('|');
}

export function generateAllDatContent(
  eligibilityRows: ElementEligibilityRow[],
  costInfoRows: CostInfoRow[],
  costAllocationRows: CostAllocationRow[],
  costAllocationAccountRows: CostAllocationAccountRow[],
  action: 'MERGE' | 'DELETE'
): GeneratedFiles {
  const eligibilityDat = [
    METADATA_ELIGIBILITY,
    ...eligibilityRows.map((row) => generateEligibilityLine(row, action)),
  ].join('\n');

  const costInfoDat = [
    METADATA_COST_INFO,
    ...costInfoRows.map((row) => generateCostInfoLine(row, action)),
  ].join('\n');

  const costAllocationDat = [
    METADATA_COST_ALLOCATION,
    ...costAllocationRows.map((row) => generateCostAllocationLine(row, action)),
  ].join('\n');

  const costAllocationAccountDat = [
    METADATA_COST_ALLOCATION_ACCOUNT,
    ...costAllocationAccountRows.map((row) =>
      generateCostAllocationAccountLine(row, action)
    ),
  ].join('\n');

  return {
    eligibilityDat,
    costInfoDat,
    costAllocationDat,
    costAllocationAccountDat,
  };
}
