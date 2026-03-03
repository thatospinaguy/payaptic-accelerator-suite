'use client';

import { useState, useMemo, useEffect } from 'react';
import { ElementGroupRow } from '@/lib/element-group-loader/types';
import { generateDatContent } from '@/lib/element-group-loader/hdl-generator';
import { validateRows } from '@/lib/element-group-loader/validation';
import { DEMO_ROWS } from '@/lib/element-group-loader/demo-data';
import SessionDefaultsPanel from '@/components/element-group-loader/SessionDefaultsPanel';
import ElementGroupTable from '@/components/element-group-loader/ElementGroupTable';
import BulkPasteModal from '@/components/element-group-loader/BulkPasteModal';
import FileUploadZone from '@/components/element-group-loader/FileUploadZone';
import HdlPreviewPanel from '@/components/element-group-loader/HdlPreviewPanel';
import WarningPanel from '@/components/element-group-loader/WarningPanel';
import ExportButton from '@/components/element-group-loader/ExportButton';

export default function ElementGroupLoader() {
  // Session defaults
  const [action, setAction] = useState<'MERGE' | 'DELETE'>('MERGE');
  const [legislativeDataGroupName, setLegislativeDataGroupName] = useState('');

  // Row data
  const [rows, setRows] = useState<ElementGroupRow[]>([]);

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

  function handleBulkImport(newRows: ElementGroupRow[]) {
    setRows((prev) => [...prev, ...newRows]);
  }

  function loadSampleData() {
    setLegislativeDataGroupName('Acme CA LDG');
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

      <ElementGroupTable
        rows={rows}
        setRows={setRows}
        legislativeDataGroupName={legislativeDataGroupName}
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
