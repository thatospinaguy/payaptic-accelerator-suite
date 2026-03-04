'use client';

import { useState } from 'react';
import { BalanceFeedRow, AddSubtractHuman, BalanceCodeLookup, ElementCodeLookup } from '@/lib/balance-feed/types';

interface BulkPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (rows: BalanceFeedRow[]) => void;
  sessionDefaults: {
    legislativeDataGroupName: string;
    effectiveStartDate: string;
  };
  balanceLookup?: BalanceCodeLookup;
  elementLookup?: ElementCodeLookup;
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
    joined.includes('balance name') ||
    joined.includes('metadata') ||
    joined.includes('elementcode') ||
    joined.includes('element code') ||
    joined.includes('element name')
  );
}

function stripLeadingColumns(cols: string[]): string[] {
  if (
    cols.length >= 6 &&
    ['merge', 'delete'].includes(cols[0].trim().toLowerCase()) &&
    cols[1].trim().toLowerCase() === 'balancefeed'
  ) {
    return cols.slice(2);
  }
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
  balanceLookup,
  elementLookup,
}: BulkPasteModalProps) {
  const [pasteData, setPasteData] = useState('');
  const [parseError, setParseError] = useState('');

  const lookupActive = !!(balanceLookup && balanceLookup.size > 0) || !!(elementLookup && elementLookup.size > 0);

  if (!isOpen) return null;

  // FIX-10: Detect if a value is a known code or a name that needs lookup
  function resolveBalanceValue(value: string): { balanceCode: string; balanceName?: string } {
    if (!balanceLookup || balanceLookup.size === 0) {
      return { balanceCode: value };
    }
    const trimmed = value.trim();
    // Check if value is a known name
    const codes = balanceLookup.get(trimmed);
    if (codes) {
      return { balanceCode: codes.length === 1 ? codes[0] : '', balanceName: trimmed };
    }
    // Check if value is already a code
    let isCode = false;
    balanceLookup.forEach((codeList) => {
      if (codeList.includes(trimmed)) isCode = true;
    });
    if (isCode) return { balanceCode: trimmed };
    return { balanceCode: value };
  }

  function resolveElementValue(value: string): { elementCode: string; elementName?: string } {
    if (!elementLookup || elementLookup.size === 0) {
      return { elementCode: value };
    }
    const trimmed = value.trim();
    const code = elementLookup.get(trimmed);
    if (code) {
      return { elementCode: code, elementName: trimmed };
    }
    let isCode = false;
    elementLookup.forEach((c) => {
      if (c === trimmed) isCode = true;
    });
    if (isCode) return { elementCode: trimmed };
    return { elementCode: value };
  }

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

      if (isHeaderRow(rawCols)) {
        continue;
      }

      const cols = stripLeadingColumns(rawCols);

      // FIX-07: Only 6-column format
      if (cols.length < 6) {
        setParseError(
          `Line ${i + 1} has only ${cols.length} column${cols.length !== 1 ? 's' : ''} (expected 6). ` +
          `Columns: Balance Code, Effective Start Date, Legislative Data Group, Element Code, Input Value Code, Add/Subtract.`
        );
        return;
      }

      const balanceRaw = cols[0]?.trim() || '';
      const elementRaw = cols[3]?.trim() || '';

      const { balanceCode, balanceName } = lookupActive
        ? resolveBalanceValue(balanceRaw)
        : { balanceCode: balanceRaw };

      const { elementCode, elementName } = lookupActive
        ? resolveElementValue(elementRaw)
        : { elementCode: elementRaw };

      const row: BalanceFeedRow = {
        action: 'MERGE',
        balanceCode,
        balanceName: balanceName || undefined,
        effectiveStartDate: cols[1]?.trim() || sessionDefaults.effectiveStartDate,
        legislativeDataGroupName: cols[2]?.trim() || sessionDefaults.legislativeDataGroupName,
        elementCode,
        elementName: elementName || undefined,
        inputValueCode: cols[4]?.trim() || '',
        addSubtractHuman: parseAddSubtract(cols[5]),
      };

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
          Paste tab-separated data from Excel or Google Sheets. Skip columns A &amp; B (Action and BalanceFeed) &mdash; they&apos;ll be set automatically.
        </p>
        <ul className="text-xs text-gray-500 mb-4 list-disc list-inside space-y-1">
          <li>
            <strong>6 columns:</strong>{' '}
            {lookupActive
              ? 'Balance Name/Code, Effective Start Date, LDG, Element Name/Code, Input Value Code, Add/Subtract'
              : 'Balance Code, Effective Start Date, LDG, Element Code, Input Value Code, Add/Subtract'}
          </li>
          {lookupActive && (
            <li>
              <strong>Lookup active:</strong> You can paste Balance Names or Element Names instead of codes &mdash; they&apos;ll be auto-resolved.
            </li>
          )}
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
