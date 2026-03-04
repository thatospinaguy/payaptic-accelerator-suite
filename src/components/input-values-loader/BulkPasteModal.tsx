'use client';

import { useState } from 'react';
import { InputValueRow } from '@/lib/input-values-loader/types';

interface BulkPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (rows: InputValueRow[]) => void;
  legislativeDataGroupName: string;
  effectiveStartDate: string;
}

function isHeaderRow(cols: string[]): boolean {
  const joined = cols.join(' ').toLowerCase();
  return (
    joined.includes('element') ||
    joined.includes('input value') ||
    joined.includes('inputvalue') ||
    joined.includes('display sequence') ||
    joined.includes('metadata')
  );
}

export default function BulkPasteModal({
  isOpen,
  onClose,
  onImport,
  legislativeDataGroupName,
  effectiveStartDate,
}: BulkPasteModalProps) {
  const [pasteData, setPasteData] = useState('');
  const [parseError, setParseError] = useState('');

  if (!isOpen) return null;

  function parsePastedData() {
    setParseError('');
    const lines = pasteData
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      setParseError('No data found. Paste tab-separated data from your spreadsheet.');
      return;
    }

    const rows: InputValueRow[] = [];

    for (let i = 0; i < lines.length; i++) {
      const cols = lines[i].split('\t');

      if (isHeaderRow(cols)) {
        continue;
      }

      // Expected column order from 22.01 tab:
      // 0: LDG, 1: Element, 2: Input Value, 3: Display Sequence, 4: Special Purpose,
      // 5: UOM, 6: Effective Date, 7: Displayed, 8: Allow User Entry, 9: Required,
      // 10: Create DB Item, 11: Default, 12: Apply Default at Runtime,
      // 13: Lookup Type, 14: Reference, 15: Minimum, 16: Maximum,
      // 17: Validation Formula, 18: Validation Source
      if (cols.length >= 2) {
        const inputValueCode = cols[2]?.trim() || cols[1]?.trim() || '';
        rows.push({
          legislativeDataGroupName: cols[0]?.trim() || legislativeDataGroupName,
          elementCode: cols[1]?.trim() || '',
          inputValueCode,
          name: inputValueCode,
          displaySequence: cols[3]?.trim() || '',
          specialPurpose: cols[4]?.trim() || '',
          uom: cols[5]?.trim() || '',
          effectiveStartDate: cols[6]?.trim() || effectiveStartDate,
          displayFlag: cols[7]?.trim() || 'Y',
          allowUserEntryFlag: cols[8]?.trim() || 'Y',
          valueRequiredFlag: cols[9]?.trim() || 'N',
          createDatabaseItemFlag: cols[10]?.trim() || 'N',
          defaultValue: cols[11]?.trim() || '',
          applyDefaultAtRuntimeFlag: cols[12]?.trim() || 'N',
          lookupType: cols[13]?.trim() || '',
          referenceCode: cols[14]?.trim() || '',
          minimumValue: cols[15]?.trim() || '',
          maximumValue: cols[16]?.trim() || '',
          valueSet: '',
          validationFormulaCode: cols[17]?.trim() || '',
          validationSource: cols[18]?.trim() || '',
          warningOrError: '',
          rateFormulaCode: '',
        });
      } else {
        setParseError(
          `Line ${i + 1} has only ${cols.length} column${cols.length !== 1 ? 's' : ''} (expected at least 2). Make sure you're pasting tab-separated data.`
        );
        return;
      }
    }

    if (rows.length === 0) {
      setParseError('No data rows found. Only header rows were detected.');
      return;
    }

    onImport(rows);
    setPasteData('');
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="card w-full max-w-2xl mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-payaptic-navy">
            Bulk Paste from Spreadsheet
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-2">
          Paste tab-separated data from Excel or Google Sheets.
        </p>
        <ul className="text-xs text-gray-500 mb-4 list-disc list-inside space-y-1">
          <li>
            <strong>Expected columns (22.01 tab order):</strong> LDG, Element, Input Value, Display Sequence, Special Purpose, UOM, Effective Date, Displayed, Allow User Entry, Required, Create DB Item, Default, Apply Default at Runtime, Lookup Type, Reference, Minimum, Maximum, Validation Formula, Validation Source
          </li>
          <li>Session defaults are used when LDG or Effective Date columns are empty</li>
          <li>Boolean fields accept Y, N, Yes, or No — normalization happens at export</li>
        </ul>

        <textarea
          value={pasteData}
          onChange={(e) => setPasteData(e.target.value)}
          className="input-field w-full h-48 font-mono text-xs"
          placeholder="Paste your spreadsheet data here (Ctrl+V / Cmd+V)..."
        />

        {parseError && (
          <div className="mt-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {parseError}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="btn-outline text-sm">
            Cancel
          </button>
          <button onClick={parsePastedData} className="btn-primary text-sm">
            Import Rows
          </button>
        </div>
      </div>
    </div>
  );
}
