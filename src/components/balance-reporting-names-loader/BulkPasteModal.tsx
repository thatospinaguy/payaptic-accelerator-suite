'use client';

import { useState } from 'react';
import { BalanceReportingNameRow } from '@/lib/balance-reporting-names-loader/types';
import { LANGUAGE_MAP } from '@/lib/hdl-common/constants';

interface BulkPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (rows: BalanceReportingNameRow[]) => void;
  legislativeDataGroupName: string;
}

function resolveLanguage(raw: string): string {
  const trimmed = raw.trim();
  return LANGUAGE_MAP[trimmed] || trimmed;
}

function isHeaderRow(cols: string[]): boolean {
  const joined = cols.join(' ').toLowerCase();
  return (
    joined.includes('balance name') ||
    joined.includes('balancename') ||
    joined.includes('reporting name') ||
    joined.includes('language') ||
    joined.includes('metadata')
  );
}

export default function BulkPasteModal({
  isOpen,
  onClose,
  onImport,
  legislativeDataGroupName,
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

    const rows: BalanceReportingNameRow[] = [];

    for (let i = 0; i < lines.length; i++) {
      const cols = lines[i].split('\t');

      if (isHeaderRow(cols)) {
        continue;
      }

      if (cols.length >= 5) {
        // Language, Balance Code, Balance Name, Reporting Name, Description
        rows.push({
          legislativeDataGroupName,
          language: resolveLanguage(cols[0] || ''),
          balanceCode: cols[1]?.trim() || '',
          balanceName: cols[2]?.trim() || '',
          reportingName: cols[3]?.trim() || '',
          description: cols[4]?.trim() || '',
        });
      } else if (cols.length === 4) {
        // Language, Balance Code, Balance Name, Reporting Name (no description)
        rows.push({
          legislativeDataGroupName,
          language: resolveLanguage(cols[0] || ''),
          balanceCode: cols[1]?.trim() || '',
          balanceName: cols[2]?.trim() || '',
          reportingName: cols[3]?.trim() || '',
          description: '',
        });
      } else {
        setParseError(
          `Line ${i + 1} has only ${cols.length} column${cols.length !== 1 ? 's' : ''} (expected at least 4). Make sure you're pasting tab-separated data.`
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
            <strong>5 columns:</strong> Language, Balance Code, Balance Name, Reporting Name, Description
          </li>
          <li>
            <strong>4 columns:</strong> Language, Balance Code, Balance Name, Reporting Name (description left blank)
          </li>
          <li>
            Language accepts &quot;American English&quot; or &quot;US&quot;, &quot;Canadian French&quot; or &quot;FRC&quot;
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
