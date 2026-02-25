import { BalanceFeedRow, Warning } from './types';
import { KNOWN_INPUT_VALUE_CODES, DEFAULT_EFFECTIVE_START_DATE } from './constants';
import { generateHdlLine } from './hdl-generator';

export function validateRows(rows: BalanceFeedRow[]): Warning[] {
  const warnings: Warning[] = [];

  rows.forEach((row, i) => {
    // W1: Non-standard date
    if (row.effectiveStartDate !== DEFAULT_EFFECTIVE_START_DATE) {
      warnings.push({
        rowIndex: i,
        id: 'W1',
        message: `Row ${i + 1}: Effective Start Date is ${row.effectiveStartDate}. Usually ${DEFAULT_EFFECTIVE_START_DATE} for new implementations.`,
      });
    }

    // W2: Unknown InputValueCode
    if (
      row.inputValueCode &&
      !KNOWN_INPUT_VALUE_CODES.includes(row.inputValueCode)
    ) {
      warnings.push({
        rowIndex: i,
        id: 'W2',
        message: `Row ${i + 1}: InputValueCode "${row.inputValueCode}" is not in the usual set. Are you sure?`,
      });
    }

    // W3: Empty required fields
    if (!row.balanceCode || !row.elementCode || !row.inputValueCode) {
      const empty = [
        !row.balanceCode && 'BalanceCode',
        !row.elementCode && 'ElementCode',
        !row.inputValueCode && 'InputValueCode',
      ].filter(Boolean);
      warnings.push({
        rowIndex: i,
        id: 'W3',
        message: `Row ${i + 1}: Empty fields (${empty.join(', ')}). This will produce empty segments in the HDL string.`,
      });
    }
  });

  // W4: Duplicate detection
  const seen = new Map<string, number>();
  rows.forEach((row, i) => {
    const key = generateHdlLine(row);
    if (seen.has(key)) {
      warnings.push({
        rowIndex: i,
        id: 'W4',
        message: `Row ${i + 1} is a duplicate of Row ${seen.get(key)! + 1}.`,
      });
    } else {
      seen.set(key, i);
    }
  });

  // W5: Mixed actions (MERGE and DELETE in same file)
  if (rows.length > 1) {
    const hasMerge = rows.some((r) => r.action === 'MERGE');
    const hasDelete = rows.some((r) => r.action === 'DELETE');
    if (hasMerge && hasDelete) {
      warnings.push({
        rowIndex: -1,
        id: 'W5',
        message:
          'File contains both MERGE and DELETE actions. Oracle HDL requires all rows in a single file to use the same action. Split into separate files or change all rows to the same action.',
      });
    }
  }

  return warnings;
}
