import { FormatterConfig } from './types';

export const DEFAULT_CONFIG: FormatterConfig = {
  indentSize: 2,
  uppercaseKeywords: true,
  addHeaderBlock: true,
  headerAuthor: '',
  headerDescription: '',
  formatOnPaste: false,
  darkTheme: false,
};

export const ACCEPTED_EXTENSIONS = ['.txt', '.ff', '.frm', '.sql'];

export const ZIP_FILENAME = 'Formatted_Fast_Formulas.zip';

export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const LOCAL_STORAGE_KEY = 'payaptic-ff-formatter-config';
