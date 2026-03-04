export type Action = 'MERGE' | 'DELETE';
export type AddSubtractHuman = 'Add' | 'Subtract';

export interface BalanceFeedRow {
  action: Action;
  balanceCode: string;
  balanceName?: string; // Input-only: used for V-lookup (FIX-10)
  effectiveStartDate: string; // YYYY/MM/DD format
  legislativeDataGroupName: string;
  elementCode: string;
  elementName?: string; // Input-only: used for V-lookup (FIX-10)
  inputValueCode: string;
  addSubtractHuman: AddSubtractHuman;
}

export type BalanceCodeLookup = Map<string, string[]>;
export type ElementCodeLookup = Map<string, string>;

export interface Warning {
  rowIndex: number;
  id: string;
  message: string;
}
