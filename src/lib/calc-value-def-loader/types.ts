export interface CalcValueDefRow {
  legislativeDataGroupName: string;
  effectiveStartDate: string;
  valueDefinitionName: string;
  lowValue: string;
  highValue: string;
  value1: string;
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
