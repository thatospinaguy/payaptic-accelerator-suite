export interface BalanceReportingNameRow {
  legislativeDataGroupName: string;
  language: string;
  balanceName: string;
  balanceCode: string;
  reportingName: string;
  description: string;
}

export interface SessionDefaults {
  action: 'MERGE' | 'DELETE';
  legislativeDataGroupName: string;
}

export interface Warning {
  rowIndex: number;
  id: string;
  message: string;
}

export type BalanceCodeLookup = Map<string, string[]>;
