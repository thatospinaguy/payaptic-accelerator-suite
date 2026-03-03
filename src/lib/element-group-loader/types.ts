export interface ElementGroupRow {
  legislativeDataGroupName: string;
  elementGroupName: string;
  elementName: string;
  includeOrExclude: 'Include' | 'Exclude';
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
