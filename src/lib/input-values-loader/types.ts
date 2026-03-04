export interface InputValueRow {
  legislativeDataGroupName: string;
  elementCode: string;
  inputValueCode: string;
  name: string;
  displaySequence: string;
  specialPurpose: string;
  uom: string;
  effectiveStartDate: string;
  displayFlag: string;
  allowUserEntryFlag: string;
  valueRequiredFlag: string;
  createDatabaseItemFlag: string;
  defaultValue: string;
  applyDefaultAtRuntimeFlag: string;
  lookupType: string;
  referenceCode: string;
  minimumValue: string;
  maximumValue: string;
  valueSet: string;
  validationFormulaCode: string;
  validationSource: string;
  warningOrError: string;
  rateFormulaCode: string;
}

export interface SessionDefaults {
  action: 'MERGE' | 'DELETE';
  legislativeDataGroupName: string;
  effectiveStartDate: string;
}

export interface Warning {
  rowIndex: number;
  id: string;
  message: string;
}
