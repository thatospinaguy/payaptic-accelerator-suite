export interface ReportRow {
  formulaName: string;
  formulaType: string;
  effectiveStartDate: string;
  legislativeDataGroup: string;
  description: string;
  [key: string]: string;
}

export interface FormulaFile {
  fileName: string;
  content: string;
}

export interface FormulaEntry {
  id: string;
  formulaName: string;
  formulaType: string;
  effectiveStartDate: string;
  legislativeDataGroup: string;
  description: string;
  file: FormulaFile;
  matched: boolean;
  errors: string[];
}

export interface SessionDefaults {
  zipFileName: string;
  overrideEffectiveStartDate: string;
}
