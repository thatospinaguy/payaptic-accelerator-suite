import * as XLSX from 'xlsx';
import { BalanceCodeLookup } from './types';

/**
 * Parse a Balance Feeds Report (.xlsx) to build a Balance Name → Balance Code[] lookup map.
 * The report has columns including "Balance Name" and "Balance Code".
 * Most names map to exactly one code, but a few (e.g. "Bonus", "Commission") map to multiple.
 */
export function parseLookupFile(data: Uint8Array): BalanceCodeLookup {
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  if (!sheet['!ref']) {
    throw new Error('The uploaded file appears to be empty.');
  }

  const range = XLSX.utils.decode_range(sheet['!ref']);

  // Find header row with "Balance Name" and "Balance Code"
  let headerRow = -1;
  let balanceNameCol = -1;
  let balanceCodeCol = -1;

  for (let r = range.s.r; r <= Math.min(range.s.r + 10, range.e.r); r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })];
      if (cell && typeof cell.v === 'string') {
        const val = cell.v.toLowerCase().trim();
        if (val === 'balance name') {
          headerRow = r;
          balanceNameCol = c;
        } else if (val === 'balance code') {
          headerRow = r;
          balanceCodeCol = c;
        }
      }
    }
    if (balanceNameCol >= 0 && balanceCodeCol >= 0) break;
  }

  if (headerRow < 0 || balanceNameCol < 0 || balanceCodeCol < 0) {
    throw new Error(
      'Could not find "Balance Name" and "Balance Code" columns in the uploaded file.'
    );
  }

  // Build the lookup map: Balance Name → unique Balance Code[]
  const lookup: BalanceCodeLookup = new Map();

  for (let r = headerRow + 1; r <= range.e.r; r++) {
    const nameCell = sheet[XLSX.utils.encode_cell({ r, c: balanceNameCol })];
    const codeCell = sheet[XLSX.utils.encode_cell({ r, c: balanceCodeCol })];

    const name = nameCell ? String(nameCell.v).trim() : '';
    const code = codeCell ? String(codeCell.v).trim() : '';

    if (!name || !code) continue;

    const existing = lookup.get(name);
    if (existing) {
      if (!existing.includes(code)) {
        existing.push(code);
      }
    } else {
      lookup.set(name, [code]);
    }
  }

  return lookup;
}
