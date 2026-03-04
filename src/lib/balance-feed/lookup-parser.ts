import * as XLSX from 'xlsx';
import { BalanceCodeLookup, ElementCodeLookup } from './types';

export interface LookupResult {
  balanceLookup: BalanceCodeLookup;
  elementLookup: ElementCodeLookup;
}

/**
 * Parse a Balance Feeds Report (.xlsx) to build both:
 * 1. Balance Name → Balance Code[] lookup map
 * 2. Element Name → Element Code lookup map (1:1)
 *
 * Reuses parsing logic from Modules 3/4 but combines both lookups from the same file.
 */
export function parseLookupFile(data: Uint8Array): LookupResult {
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  if (!sheet['!ref']) {
    throw new Error('The uploaded file appears to be empty.');
  }

  const range = XLSX.utils.decode_range(sheet['!ref']);

  // Find header row with Balance Name, Balance Code, Element Name, Element Code
  let headerRow = -1;
  let balanceNameCol = -1;
  let balanceCodeCol = -1;
  let elementNameCol = -1;
  let elementCodeCol = -1;

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
        } else if (val === 'element name') {
          headerRow = r;
          elementNameCol = c;
        } else if (val === 'element code') {
          headerRow = r;
          elementCodeCol = c;
        }
      }
    }
    if (
      balanceNameCol >= 0 &&
      balanceCodeCol >= 0 &&
      elementNameCol >= 0 &&
      elementCodeCol >= 0
    )
      break;
  }

  if (headerRow < 0) {
    throw new Error(
      'Could not find lookup columns. Expected at least "Balance Name" and "Balance Code" headers.'
    );
  }

  const balanceLookup: BalanceCodeLookup = new Map();
  const elementLookup: ElementCodeLookup = new Map();

  for (let r = headerRow + 1; r <= range.e.r; r++) {
    // Balance Name → Balance Code (1:many)
    if (balanceNameCol >= 0 && balanceCodeCol >= 0) {
      const nameCell = sheet[XLSX.utils.encode_cell({ r, c: balanceNameCol })];
      const codeCell = sheet[XLSX.utils.encode_cell({ r, c: balanceCodeCol })];
      const name = nameCell ? String(nameCell.v).trim() : '';
      const code = codeCell ? String(codeCell.v).trim() : '';

      if (name && code) {
        const existing = balanceLookup.get(name);
        if (existing) {
          if (!existing.includes(code)) {
            existing.push(code);
          }
        } else {
          balanceLookup.set(name, [code]);
        }
      }
    }

    // Element Name → Element Code (1:1)
    if (elementNameCol >= 0 && elementCodeCol >= 0) {
      const nameCell = sheet[XLSX.utils.encode_cell({ r, c: elementNameCol })];
      const codeCell = sheet[XLSX.utils.encode_cell({ r, c: elementCodeCol })];
      const name = nameCell ? String(nameCell.v).trim() : '';
      const code = codeCell ? String(codeCell.v).trim() : '';

      if (name && code && !elementLookup.has(name)) {
        elementLookup.set(name, code);
      }
    }
  }

  if (balanceLookup.size === 0 && elementLookup.size === 0) {
    throw new Error(
      'No mappings found in the uploaded file. Ensure it contains Balance Name/Code or Element Name/Code columns.'
    );
  }

  return { balanceLookup, elementLookup };
}
