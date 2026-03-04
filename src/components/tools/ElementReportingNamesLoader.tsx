'use client';

import { useState, useMemo, useEffect } from 'react';
import { ElementReportingNameRow, ElementCodeLookup } from '@/lib/element-reporting-names-loader/types';
import { generateDatContent } from '@/lib/element-reporting-names-loader/hdl-generator';
import { validateRows } from '@/lib/element-reporting-names-loader/validation';
import { DEMO_ROWS } from '@/lib/element-reporting-names-loader/demo-data';
import SessionDefaultsPanel from '@/components/element-reporting-names-loader/SessionDefaultsPanel';
import ElementReportingTable from '@/components/element-reporting-names-loader/ElementReportingTable';
import BulkPasteModal from '@/components/element-reporting-names-loader/BulkPasteModal';
import FileUploadZone from '@/components/element-reporting-names-loader/FileUploadZone';
import LookupUploadZone from '@/components/element-reporting-names-loader/LookupUploadZone';
import HdlPreviewPanel from '@/components/element-reporting-names-loader/HdlPreviewPanel';
import WarningPanel from '@/components/element-reporting-names-loader/WarningPanel';
import ExportButton from '@/components/element-reporting-names-loader/ExportButton';

export default function ElementReportingNamesLoader() {
  // Session defaults
  const [action, setAction] = useState<'MERGE' | 'DELETE'>('MERGE');
  const [legislativeDataGroupName, setLegislativeDataGroupName] = useState('');

  // Row data
  const [rows, setRows] = useState<ElementReportingNameRow[]>([]);

  // Modal states
  const [showBulkPaste, setShowBulkPaste] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);

  // Element Code V-Lookup
  const [elementCodeLookup, setElementCodeLookup] = useState<ElementCodeLookup>(new Map());

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

  function handleBulkImport(newRows: ElementReportingNameRow[]) {
    // Auto-fill element codes from lookup for imported rows
    const enrichedRows = newRows.map((row) => {
      if (!row.elementCode && elementCodeLookup.size > 0) {
        const code = elementCodeLookup.get(row.elementName);
        if (code) {
          return { ...row, elementCode: code };
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
        onLookupLoaded={setElementCodeLookup}
        lookupSize={elementCodeLookup.size}
      />

      <ElementReportingTable
        rows={rows}
        setRows={setRows}
        legislativeDataGroupName={legislativeDataGroupName}
        warnings={warnings}
        onBulkPaste={() => setShowBulkPaste(true)}
        onFileUpload={() => setShowFileUpload(true)}
        elementCodeLookup={elementCodeLookup}
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
