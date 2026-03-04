import { FormatterConfig } from './types';

export const DEFAULT_CONFIG: FormatterConfig = {
  indentSize: 2,
  uppercaseKeywords: true,
  addHeaderBlock: true,
  headerAuthor: '',
  headerDescription: '',
};

export const ACCEPTED_EXTENSIONS = ['.txt', '.ff', '.frm', '.sql'];

export const ZIP_FILENAME = 'Formatted_Fast_Formulas.zip';
