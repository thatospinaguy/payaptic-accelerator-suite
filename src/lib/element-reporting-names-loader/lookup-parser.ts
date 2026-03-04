import * as XLSX from 'xlsx';
import { ElementCodeLookup } from './types';

/**
 * Parse a Balance Feeds Report (.xlsx) to build an Element Name → Element Code lookup map.
 * The report has columns including "Element Name" and "Element Code".
 * The mapping is 1:1 (no multi-code conflicts). Common patterns:
 * "Results" (name) → "Result" (code), "Retroactive" → "Retro".
 */
export function parseLookupFile(data: Uint8Array): ElementCodeLookup {
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  if (!sheet['!ref']) {
    throw new Error('The uploaded file appears to be empty.');
  }

  const range = XLSX.utils.decode_range(sheet['!ref']);

  // Find header row with "Element Name" and "Element Code"
  let headerRow = -1;
  let elementNameCol = -1;
  let elementCodeCol = -1;

  for (let r = range.s.r; r <= Math.min(range.s.r + 10, range.e.r); r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })];
      if (cell && typeof cell.v === 'string') {
        const val = cell.v.toLowerCase().trim();
        if (val === 'element name') {
          headerRow = r;
          elementNameCol = c;
        } else if (val === 'element code') {
          headerRow = r;
          elementCodeCol = c;
        }
      }
    }
    if (elementNameCol >= 0 && elementCodeCol >= 0) break;
  }

  if (headerRow < 0 || elementNameCol < 0 || elementCodeCol < 0) {
    throw new Error(
      'Could not find "Element Name" and "Element Code" columns in the uploaded file.'
    );
  }

  // Build the lookup map: Element Name → Element Code (1:1 mapping)
  const lookup: ElementCodeLookup = new Map();

  for (let r = headerRow + 1; r <= range.e.r; r++) {
    const nameCell = sheet[XLSX.utils.encode_cell({ r, c: elementNameCol })];
    const codeCell = sheet[XLSX.utils.encode_cell({ r, c: elementCodeCol })];

    const name = nameCell ? String(nameCell.v).trim() : '';
    const code = codeCell ? String(codeCell.v).trim() : '';

    if (!name || !code) continue;

    // 1:1 mapping — first occurrence wins (all duplicates have same code)
    if (!lookup.has(name)) {
      lookup.set(name, code);
    }
  }

  return lookup;
}
