export interface FastFormulaFile {
  fileName: string;
  originalCode: string;
  formattedCode: string;
  formulaName: string;
}

export interface FormatterConfig {
  indentSize: number;
  uppercaseKeywords: boolean;
  addHeaderBlock: boolean;
  headerAuthor: string;
  headerDescription: string;
}

export interface Warning {
  rowIndex: number;
  id: string;
  message: string;
}
