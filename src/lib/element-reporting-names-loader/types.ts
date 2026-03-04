export interface ElementReportingNameRow {
  legislativeDataGroupName: string;
  language: string;
  elementCode: string;
  elementName: string;
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

export type ElementCodeLookup = Map<string, string>;
