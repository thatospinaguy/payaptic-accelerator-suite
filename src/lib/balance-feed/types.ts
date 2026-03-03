export type Action = 'MERGE' | 'DELETE';
export type AddSubtractHuman = 'Add' | 'Subtract';

export interface BalanceFeedRow {
  action: Action;
  balanceCode: string;
  effectiveStartDate: string; // YYYY/MM/DD format
  legislativeDataGroupName: string;
  elementCode: string;
  inputValueCode: string;
  addSubtractHuman: AddSubtractHuman;
}

export interface Warning {
  rowIndex: number;
  id: string;
  message: string;
}
