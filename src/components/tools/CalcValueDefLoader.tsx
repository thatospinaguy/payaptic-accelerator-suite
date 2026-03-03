'use client';

import { useState, useMemo, useEffect } from 'react';
import { CalcValueDefRow } from '@/lib/calc-value-def-loader/types';
import { generateDatContent } from '@/lib/calc-value-def-loader/hdl-generator';
import { validateRows } from '@/lib/calc-value-def-loader/validation';
import { DEMO_ROWS } from '@/lib/calc-value-def-loader/demo-data';
import SessionDefaultsPanel from '@/components/calc-value-def-loader/SessionDefaultsPanel';
import CalcValueDefTable from '@/components/calc-value-def-loader/CalcValueDefTable';
import BulkPasteModal from '@/components/calc-value-def-loader/BulkPasteModal';
import FileUploadZone from '@/components/calc-value-def-loader/FileUploadZone';
import HdlPreviewPanel from '@/components/calc-value-def-loader/HdlPreviewPanel';
import WarningPanel from '@/components/calc-value-def-loader/WarningPanel';
import ExportButton from '@/components/calc-value-def-loader/ExportButton';

export default function CalcValueDefLoader() {
  // Session defaults
  const [action, setAction] = useState<'MERGE' | 'DELETE'>('MERGE');
  const [legislativeDataGroupName, setLegislativeDataGroupName] = useState('');
  const [effectiveStartDate, setEffectiveStartDate] = useState('1951/01/01');

  // Row data
  const [rows, setRows] = useState<CalcValueDefRow[]>([]);

  // Modal states
  const [showBulkPaste, setShowBulkPaste] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);

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

  // Sync effective date to all rows when it changes
  useEffect(() => {
    if (rows.length > 0) {
      setRows((prev) =>
        prev.map((row) => ({
          ...row,
          effectiveStartDate,
        }))
      );
    }
  }, [effectiveStartDate]); // eslint-disable-line react-hooks/exhaustive-deps

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

  function handleBulkImport(newRows: CalcValueDefRow[]) {
    setRows((prev) => [...prev, ...newRows]);
  }

  function loadSampleData() {
    setLegislativeDataGroupName('Chartwell CA LDG');
    setEffectiveStartDate('1951/01/01');
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
        effectiveStartDate={effectiveStartDate}
        setEffectiveStartDate={setEffectiveStartDate}
        action={action}
        setAction={setAction}
      />

      <CalcValueDefTable
        rows={rows}
        setRows={setRows}
        legislativeDataGroupName={legislativeDataGroupName}
        effectiveStartDate={effectiveStartDate}
        warnings={warnings}
        onBulkPaste={() => setShowBulkPaste(true)}
        onFileUpload={() => setShowFileUpload(true)}
      />

      <WarningPanel warnings={warnings} />

      {rows.length > 0 && <HdlPreviewPanel datContent={datContent} />}

      <ExportButton datContent={datContent} rowCount={rowCount} />

      <BulkPasteModal
        isOpen={showBulkPaste}
        onClose={() => setShowBulkPaste(false)}
        onImport={handleBulkImport}
        legislativeDataGroupName={legislativeDataGroupName}
        effectiveStartDate={effectiveStartDate}
      />

      <FileUploadZone
        isOpen={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        onImport={handleBulkImport}
        legislativeDataGroupName={legislativeDataGroupName}
        effectiveStartDate={effectiveStartDate}
      />
    </div>
  );
}
