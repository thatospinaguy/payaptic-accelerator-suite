'use client';

import { useState } from 'react';
import { CalcValueDefRow } from '@/lib/calc-value-def-loader/types';

interface BulkPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (rows: CalcValueDefRow[]) => void;
  legislativeDataGroupName: string;
  effectiveStartDate: string;
}

function isHeaderRow(cols: string[]): boolean {
  const joined = cols.join(' ').toLowerCase();
  return (
    joined.includes('value definition') ||
    joined.includes('valuedefinition') ||
    joined.includes('low value') ||
    joined.includes('high value') ||
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

    const rows: CalcValueDefRow[] = [];

    for (let i = 0; i < lines.length; i++) {
      const cols = lines[i].split('\t');

      if (isHeaderRow(cols)) {
        continue;
      }

      if (cols.length >= 4) {
        rows.push({
          legislativeDataGroupName,
          effectiveStartDate,
          valueDefinitionName: cols[0]?.trim() || '',
          lowValue: cols[1]?.trim() || '0',
          highValue: cols[2]?.trim() || '999999999',
          value1: cols[3]?.trim() || '',
        });
      } else if (cols.length === 3) {
        // Three columns: Name, Low, Rate — default High to 999999999
        rows.push({
          legislativeDataGroupName,
          effectiveStartDate,
          valueDefinitionName: cols[0]?.trim() || '',
          lowValue: cols[1]?.trim() || '0',
          highValue: '999999999',
          value1: cols[2]?.trim() || '',
        });
      } else {
        setParseError(
          `Line ${i + 1} has only ${cols.length} column${cols.length !== 1 ? 's' : ''} (expected at least 3). Make sure you're pasting tab-separated data.`
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
            <strong>4 columns:</strong> Value Definition Name, Low Value, High Value, Rate
          </li>
          <li>
            <strong>3 columns:</strong> Value Definition Name, Low Value, Rate (High defaults to 999999999)
          </li>
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
