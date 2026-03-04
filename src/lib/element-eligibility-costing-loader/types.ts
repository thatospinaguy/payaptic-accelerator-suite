export interface ElementEligibilityRow {
  legislativeDataGroupName: string;
  elementCode: string;
  elementEligibilityName: string;
  effectiveStartDate: string;
  payrollStatUnitCode: string;
  legalEmployerCode: string;
  payrollCode: string;
  bargainingUnitCode: string;
  automaticEntryFlag: string;
  peopleGroup: string;
  costingLinkFlag: string;
}

export interface CostInfoRow {
  costableType: string;
  distributionSetName: string;
  costedFlag: string;
  effectiveEndDate: string;
  effectiveStartDate: string;
  sourceType: string;
  transferToGlFlag: string;
  legislativeDataGroupName: string;
  elementCode: string;
  elementEligibilityName: string;
  linkInputName: string;
}

export interface CostAllocationRow {
  effectiveEndDate: string;
  effectiveStartDate: string;
  sourceType: string;
  elementCode: string;
  elementEligibilityName: string;
  legislativeDataGroupName: string;
}

export interface CostAllocationAccountRow {
  sourceType: string;
  segment1: string;
  segment2: string;
  segment3: string;
  segment4: string;
  segment5: string;
  segment6: string;
  sourceSubType: string;
  legislativeDataGroupName: string;
  elementCode: string;
  elementEligibilityName: string;
  effectiveDate: string;
  proportion: string;
  subTypeSequence: string;
}

export interface SessionDefaults {
  action: 'MERGE' | 'DELETE';
  legislativeDataGroupName: string;
  effectiveStartDate: string;
  effectiveEndDate: string;
}

export interface Warning {
  rowIndex: number;
  id: string;
  message: string;
}

export interface AllData {
  eligibilityRows: ElementEligibilityRow[];
  costInfoRows: CostInfoRow[];
  costAllocationRows: CostAllocationRow[];
  costAllocationAccountRows: CostAllocationAccountRow[];
}

export interface GeneratedFiles {
  eligibilityDat: string;
  costInfoDat: string;
  costAllocationDat: string;
  costAllocationAccountDat: string;
}
