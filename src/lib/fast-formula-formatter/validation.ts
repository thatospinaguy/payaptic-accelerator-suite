import { FastFormulaFile, Warning } from './types';

export function validateFiles(files: FastFormulaFile[]): Warning[] {
  const warnings: Warning[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (!file.originalCode.trim()) {
      warnings.push({
        rowIndex: i,
        id: 'EMPTY_FILE',
        message: `File '${file.fileName}' is empty and was skipped.`,
      });
    }
  }

  return warnings;
}
