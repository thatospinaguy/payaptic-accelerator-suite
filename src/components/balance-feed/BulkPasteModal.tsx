'use client';

import { useState } from 'react';
import { BalanceFeedRow, AddSubtractHuman } from '@/lib/balance-feed/types';

interface BulkPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (rows: BalanceFeedRow[]) => void;
  sessionDefaults: {
    legislativeDataGroupName: string;
    effectiveStartDate: string;
  };
}

function parseAddSubtract(raw: string | undefined): AddSubtractHuman {
  if (!raw) return 'Add';
  const trimmed = raw.trim();
  if (trimmed === '-1' || trimmed.toLowerCase() === 'subtract') {
    return 'Subtract';
  }
  return 'Add';
}

function isHeaderRow(cols: string[]): boolean {
  const joined = cols.join(' ').toLowerCase();
  return (
    joined.includes('balancecode') ||
    joined.includes('balance code') ||
    joined.includes('metadata') ||
    joined.includes('elementcode') ||
    joined.includes('element code')
  );
}

function stripLeadingColumns(cols: string[]): string[] {
  // If pasted data includes Action + "BalanceFeed" as first two columns, strip them
  if (
    cols.length >= 6 &&
    ['merge', 'delete'].includes(cols[0].trim().toLowerCase()) &&
    cols[1].trim().toLowerCase() === 'balancefeed'
  ) {
    return cols.slice(2);
  }
  // If just "BalanceFeed" is the first column (no action prefix)
  if (cols.length >= 5 && cols[0].trim().toLowerCase() === 'balancefeed') {
    return cols.slice(1);
  }
  return cols;
}

export default function BulkPasteModal({
  isOpen,
  onClose,
  onImport,
  sessionDefaults,
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

    const rows: BalanceFeedRow[] = [];

    for (let i = 0; i < lines.length; i++) {
      const rawCols = lines[i].split('\t');

      // Skip header rows
      if (isHeaderRow(rawCols)) {
        continue;
      }

      // Smart detection: strip Action + "BalanceFeed" columns if present
      const cols = stripLeadingColumns(rawCols);

      let row: BalanceFeedRow;

      if (cols.length >= 6) {
        // 6+ columns: BalanceCode, EffectiveStartDate, LDG, ElementCode, InputValueCode, Add/Subtract
        row = {
          action: 'MERGE', // Action is controlled at session level
          balanceCode: cols[0]?.trim() || '',
          effectiveStartDate: cols[1]?.trim() || sessionDefaults.effectiveStartDate,
          legislativeDataGroupName: cols[2]?.trim() || sessionDefaults.legislativeDataGroupName,
          elementCode: cols[3]?.trim() || '',
          inputValueCode: cols[4]?.trim() || '',
          addSubtractHuman: parseAddSubtract(cols[5]),
        };
      } else if (cols.length >= 4) {
        // 4-5 columns: BalanceCode, ElementCode, InputValueCode, Add/Subtract
        row = {
          action: 'MERGE', // Action is controlled at session level
          balanceCode: cols[0]?.trim() || '',
          effectiveStartDate: sessionDefaults.effectiveStartDate,
          legislativeDataGroupName: sessionDefaults.legislativeDataGroupName,
          elementCode: cols[1]?.trim() || '',
          inputValueCode: cols[2]?.trim() || '',
          addSubtractHuman: parseAddSubtract(cols[3]),
        };
      } else {
        setParseError(
          `Line ${i + 1} has only ${cols.length} column${cols.length !== 1 ? 's' : ''} (expected at least 4). Make sure you're pasting tab-separated data. Tip: Skip the Action and BalanceFeed columns when copying from your spreadsheet.`
        );
        return;
      }

      rows.push(row);
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
          Paste tab-separated data from Excel or Google Sheets. Skip columns A &amp; B (Action and BalanceFeed) — they&apos;ll be set automatically. If you accidentally include them, they&apos;ll be detected and stripped.
        </p>
        <ul className="text-xs text-gray-500 mb-4 list-disc list-inside space-y-1">
          <li>
            <strong>4 columns:</strong> BalanceCode, ElementCode, InputValueCode, Add/Subtract
          </li>
          <li>
            <strong>6 columns:</strong> BalanceCode, EffectiveStartDate, LDG, ElementCode, InputValueCode, Add/Subtract
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
