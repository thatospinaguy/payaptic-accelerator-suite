export const ZIP_FILENAME = 'Element_Eligibility_Costing_HDL_Final.zip';

export const ELIGIBILITY_DAT_FILENAME = 'PayrollElementDefinition.dat';
export const COST_INFO_DAT_FILENAME = 'CostInfoV3.dat';
export const COST_ALLOCATION_DAT_FILENAME = 'CostAllocationV3.dat';
export const COST_ALLOCATION_ACCOUNT_DAT_FILENAME = 'CostAllocationAccountV3.dat';

export const METADATA_ELIGIBILITY =
  'METADATA|ElementEligibility|LegislativeDataGroupName|ElementCode|ElementEligibilityName|EffectiveStartDate|PayrollStatUnitCode|LegalEmployerCode|PayrollCode|BargainingUnitCode|AutomaticEntryFlag|PeopleGroup|CostingLinkFlag';

export const METADATA_COST_INFO =
  'METADATA|CostInfoV3|CostableType|DistributionSetName|CostedFlag|EffectiveEndDate|EffectiveStartDate|SourceType|TransferToGlFlag|LegislativeDataGroupName|ElementCode|ElementEligibilityName|LinkInputName';

export const METADATA_COST_ALLOCATION =
  'METADATA|CostAllocationV3|EffectiveEndDate|EffectiveStartDate|SourceType|ElementCode|ElementEligibilityName|LegislativeDataGroupName';

export const METADATA_COST_ALLOCATION_ACCOUNT =
  'METADATA|CostAllocationAccountV3|SourceType|Segment1|Segment2|Segment3|Segment4|Segment5|Segment6|SourceSubType|LegislativeDataGroupName|ElementCode|ElementEligibilityName|EffectiveDate|Proportion|SubTypeSequence';

export const VALID_SOURCE_TYPES = ['EL', 'LIV'] as const;
export const VALID_SOURCE_SUB_TYPES = ['COST', 'BAL'] as const;
