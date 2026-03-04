export const DAT_FILENAME = 'PayrollElementDefinition.dat';

export const ZIP_FILENAME = 'Input_Values_HDL_Final.zip';

export const METADATA_LINE =
  'METADATA|InputValue|LegislativeDataGroupName|ElementCode|InputValueCode|Name|DisplaySequence|SpecialPurpose|UOM|EffectiveStartDate|DisplayFlag|AllowUserEntryFlag|ValueRequiredFlag|CreateDatabaseItemFlag|DefaultValue|ApplyDefaultAtRuntimeFlag|LookupType|ReferenceCode|MinimumValue|MaximumValue|ValueSet|ValidationFormulaCode|ValidationSource|WarningOrError|RateFormulaCode';

export const BOOLEAN_FIELDS = [
  'displayFlag',
  'allowUserEntryFlag',
  'valueRequiredFlag',
  'createDatabaseItemFlag',
  'applyDefaultAtRuntimeFlag',
] as const;
