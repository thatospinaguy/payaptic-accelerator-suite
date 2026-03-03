'use client';

import { useState, useMemo, useEffect } from 'react';
import { BalanceReportingNameRow, BalanceCodeLookup } from '@/lib/balance-reporting-names-loader/types';
import { generateDatContent } from '@/lib/balance-reporting-names-loader/hdl-generator';
import { validateRows } from '@/lib/balance-reporting-names-loader/validation';
import { DEMO_ROWS } from '@/lib/balance-reporting-names-loader/demo-data';
import SessionDefaultsPanel from '@/components/balance-reporting-names-loader/SessionDefaultsPanel';
import BalanceReportingTable from '@/components/balance-reporting-names-loader/BalanceReportingTable';
import BulkPasteModal from '@/components/balance-reporting-names-loader/BulkPasteModal';
import FileUploadZone from '@/components/balance-reporting-names-loader/FileUploadZone';
import LookupUploadZone from '@/components/balance-reporting-names-loader/LookupUploadZone';
import HdlPreviewPanel from '@/components/balance-reporting-names-loader/HdlPreviewPanel';
import WarningPanel from '@/components/balance-reporting-names-loader/WarningPanel';
import ExportButton from '@/components/balance-reporting-names-loader/ExportButton';

export default function BalanceReportingNamesLoader() {
  // Session defaults
  const [action, setAction] = useState<'MERGE' | 'DELETE'>('MERGE');
  const [legislativeDataGroupName, setLegislativeDataGroupName] = useState('');

  // Row data
  const [rows, setRows] = useState<BalanceReportingNameRow[]>([]);

  // Modal states
  const [showBulkPaste, setShowBulkPaste] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);

  // Balance Code V-Lookup
  const [balanceCodeLookup, setBalanceCodeLookup] = useState<BalanceCodeLookup>(new Map());

  // Sync LDG to all rows when it changes
  useEffect(() => {
    if (rows.length > 0) {
      setRows((prev) =>
        prev.map((row) => ({
          ...row,
          legislativeDataGroupName,
        }))
      );
    }
  }, [legislativeDataGroupName]); // eslint-disable-line react-hooks/exhaustive-deps

  // Computed values
  const datContent = useMemo(
    () => generateDatContent(rows, action),
    [rows, action]
  );
  const warnings = useMemo(
    () => validateRows(rows, legislativeDataGroupName),
    [rows, legislativeDataGroupName]
  );

  const warningCount = warnings.length;
  const rowCount = rows.length;

  function handleBulkImport(newRows: BalanceReportingNameRow[]) {
    // Auto-fill balance codes from lookup for imported rows
    const enrichedRows = newRows.map((row) => {
      if (!row.balanceCode && balanceCodeLookup.size > 0) {
        const codes = balanceCodeLookup.get(row.balanceName);
        if (codes && codes.length === 1) {
          return { ...row, balanceCode: codes[0] };
        }
      }
      return row;
    });
    setRows((prev) => [...prev, ...enrichedRows]);
  }

  function loadSampleData() {
    setLegislativeDataGroupName('Chartwell CA LDG');
    setRows([...DEMO_ROWS]);
  }

  return (
    <div className="space-y-6">
      {/* Status bar */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2">
        <span className="text-sm text-gray-500">
          {rowCount > 0
            ? `${rowCount} row${rowCount !== 1 ? 's' : ''}${warningCount > 0 ? ` | ${warningCount} warning${warningCount !== 1 ? 's' : ''}` : ''} | Ready to export`
            : 'No rows — add rows manually or load sample data to get started'}
        </span>
        {rowCount === 0 && (
          <button
            onClick={loadSampleData}
            className="text-sm font-medium text-payaptic-ocean hover:underline"
          >
            Load Sample Data
          </button>
        )}
      </div>

      <SessionDefaultsPanel
        legislativeDataGroupName={legislativeDataGroupName}
        setLegislativeDataGroupName={setLegislativeDataGroupName}
        action={action}
        setAction={setAction}
      />

      <LookupUploadZone
        onLookupLoaded={setBalanceCodeLookup}
        lookupSize={balanceCodeLookup.size}
      />

      <BalanceReportingTable
        rows={rows}
        setRows={setRows}
        legislativeDataGroupName={legislativeDataGroupName}
        warnings={warnings}
        onBulkPaste={() => setShowBulkPaste(true)}
        onFileUpload={() => setShowFileUpload(true)}
        balanceCodeLookup={balanceCodeLookup}
      />

      <WarningPanel warnings={warnings} />

      {rows.length > 0 && <HdlPreviewPanel datContent={datContent} />}

      <ExportButton datContent={datContent} rowCount={rowCount} />

      <BulkPasteModal
        isOpen={showBulkPaste}
        onClose={() => setShowBulkPaste(false)}
        onImport={handleBulkImport}
        legislativeDataGroupName={legislativeDataGroupName}
      />

      <FileUploadZone
        isOpen={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        onImport={handleBulkImport}
        legislativeDataGroupName={legislativeDataGroupName}
      />
    </div>
  );
}
