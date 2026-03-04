'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  ElementEligibilityRow,
  CostInfoRow,
  CostAllocationRow,
  CostAllocationAccountRow,
  AllData,
} from '@/lib/element-eligibility-costing-loader/types';
import { generateAllDatContent } from '@/lib/element-eligibility-costing-loader/hdl-generator';
import { validateAll } from '@/lib/element-eligibility-costing-loader/validation';
import {
  DEMO_ELIGIBILITY_ROWS,
  DEMO_COST_INFO_ROWS,
  DEMO_COST_ALLOCATION_ROWS,
  DEMO_COST_ALLOCATION_ACCOUNT_ROWS,
} from '@/lib/element-eligibility-costing-loader/demo-data';
import SessionDefaultsPanel from '@/components/element-eligibility-costing-loader/SessionDefaultsPanel';
import EligibilityTable from '@/components/element-eligibility-costing-loader/EligibilityTable';
import CostingTable from '@/components/element-eligibility-costing-loader/CostingTable';
import FileUploadZone from '@/components/element-eligibility-costing-loader/FileUploadZone';
import BulkPasteModal from '@/components/element-eligibility-costing-loader/BulkPasteModal';
import MultiFilePreview from '@/components/element-eligibility-costing-loader/MultiFilePreview';
import WarningPanel from '@/components/element-eligibility-costing-loader/WarningPanel';
import ExportButton from '@/components/element-eligibility-costing-loader/ExportButton';

export default function ElementEligibilityCostingLoader() {
  // Session defaults
  const [action, setAction] = useState<'MERGE' | 'DELETE'>('MERGE');
  const [legislativeDataGroupName, setLegislativeDataGroupName] = useState('');
  const [effectiveStartDate, setEffectiveStartDate] = useState('1951/01/01');
  const [effectiveEndDate, setEffectiveEndDate] = useState('4712/12/31');

  // Data rows for all 4 file types
  const [eligibilityRows, setEligibilityRows] = useState<ElementEligibilityRow[]>([]);
  const [costInfoRows, setCostInfoRows] = useState<CostInfoRow[]>([]);
  const [costAllocationRows, setCostAllocationRows] = useState<CostAllocationRow[]>([]);
  const [costAllocationAccountRows, setCostAllocationAccountRows] = useState<CostAllocationAccountRow[]>([]);

  // Active data tab
  const [activeDataTab, setActiveDataTab] = useState<'eligibility' | 'costing'>('eligibility');

  // Modal states
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showBulkPaste, setShowBulkPaste] = useState(false);

  // Sync LDG to all rows when it changes
  useEffect(() => {
    if (eligibilityRows.length > 0) {
      setEligibilityRows((prev) =>
        prev.map((row) => ({ ...row, legislativeDataGroupName }))
      );
    }
    if (costInfoRows.length > 0) {
      setCostInfoRows((prev) =>
        prev.map((row) => ({ ...row, legislativeDataGroupName }))
      );
    }
    if (costAllocationRows.length > 0) {
      setCostAllocationRows((prev) =>
        prev.map((row) => ({ ...row, legislativeDataGroupName }))
      );
    }
    if (costAllocationAccountRows.length > 0) {
      setCostAllocationAccountRows((prev) =>
        prev.map((row) => ({ ...row, legislativeDataGroupName }))
      );
    }
  }, [legislativeDataGroupName]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync dates to all rows when they change
  useEffect(() => {
    if (eligibilityRows.length > 0) {
      setEligibilityRows((prev) =>
        prev.map((row) => ({ ...row, effectiveStartDate }))
      );
    }
    if (costInfoRows.length > 0) {
      setCostInfoRows((prev) =>
        prev.map((row) => ({ ...row, effectiveStartDate, effectiveEndDate }))
      );
    }
    if (costAllocationRows.length > 0) {
      setCostAllocationRows((prev) =>
        prev.map((row) => ({ ...row, effectiveStartDate, effectiveEndDate }))
      );
    }
    if (costAllocationAccountRows.length > 0) {
      setCostAllocationAccountRows((prev) =>
        prev.map((row) => ({ ...row, effectiveDate: effectiveStartDate }))
      );
    }
  }, [effectiveStartDate, effectiveEndDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Computed values
  const generatedFiles = useMemo(
    () =>
      generateAllDatContent(
        eligibilityRows,
        costInfoRows,
        costAllocationRows,
        costAllocationAccountRows,
        action
      ),
    [eligibilityRows, costInfoRows, costAllocationRows, costAllocationAccountRows, action]
  );

  const warnings = useMemo(
    () =>
      validateAll(
        eligibilityRows,
        costInfoRows,
        costAllocationAccountRows,
        legislativeDataGroupName
      ),
    [eligibilityRows, costInfoRows, costAllocationAccountRows, legislativeDataGroupName]
  );

  const totalRows =
    eligibilityRows.length +
    costInfoRows.length +
    costAllocationRows.length +
    costAllocationAccountRows.length;

  const warningCount = warnings.length;

  function handleFileImport(data: AllData) {
    setEligibilityRows((prev) => [...prev, ...data.eligibilityRows]);
    setCostInfoRows((prev) => [...prev, ...data.costInfoRows]);
    setCostAllocationRows((prev) => [...prev, ...data.costAllocationRows]);
    setCostAllocationAccountRows((prev) => [...prev, ...data.costAllocationAccountRows]);
  }

  function loadSampleData() {
    setLegislativeDataGroupName('Chartwell CA LDG');
    setEffectiveStartDate('1951/01/01');
    setEffectiveEndDate('4712/12/31');
    setEligibilityRows([...DEMO_ELIGIBILITY_ROWS]);
    setCostInfoRows([...DEMO_COST_INFO_ROWS]);
    setCostAllocationRows([...DEMO_COST_ALLOCATION_ROWS]);
    setCostAllocationAccountRows([...DEMO_COST_ALLOCATION_ACCOUNT_ROWS]);
  }

  function clearAllData() {
    setEligibilityRows([]);
    setCostInfoRows([]);
    setCostAllocationRows([]);
    setCostAllocationAccountRows([]);
  }

  return (
    <div className="space-y-6">
      {/* Status bar */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2">
        <span className="text-sm text-gray-500">
          {totalRows > 0
            ? `${eligibilityRows.length} eligibility | ${costInfoRows.length} cost info | ${costAllocationRows.length} cost alloc | ${costAllocationAccountRows.length} accounts${warningCount > 0 ? ` | ${warningCount} warning${warningCount !== 1 ? 's' : ''}` : ''} | Ready to export`
            : 'No data — upload a file or load sample data to get started'}
        </span>
        <div className="flex gap-3">
          {totalRows > 0 && (
            <button
              onClick={clearAllData}
              className="text-sm font-medium text-red-500 hover:underline"
            >
              Clear All
            </button>
          )}
          {totalRows === 0 && (
            <button
              onClick={loadSampleData}
              className="text-sm font-medium text-payaptic-ocean hover:underline"
            >
              Load Sample Data
            </button>
          )}
        </div>
      </div>

      <SessionDefaultsPanel
        legislativeDataGroupName={legislativeDataGroupName}
        setLegislativeDataGroupName={setLegislativeDataGroupName}
        effectiveStartDate={effectiveStartDate}
        setEffectiveStartDate={setEffectiveStartDate}
        effectiveEndDate={effectiveEndDate}
        setEffectiveEndDate={setEffectiveEndDate}
        action={action}
        setAction={setAction}
      />

      {/* Data input tabs */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveDataTab('eligibility')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeDataTab === 'eligibility'
                ? 'border-b-2 border-payaptic-ocean text-payaptic-ocean bg-white'
                : 'text-gray-500 hover:text-gray-700 bg-gray-50'
            }`}
          >
            Eligibility Records ({eligibilityRows.length})
          </button>
          <button
            onClick={() => setActiveDataTab('costing')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeDataTab === 'costing'
                ? 'border-b-2 border-payaptic-ocean text-payaptic-ocean bg-white'
                : 'text-gray-500 hover:text-gray-700 bg-gray-50'
            }`}
          >
            Costing Records ({costInfoRows.length + costAllocationRows.length + costAllocationAccountRows.length})
          </button>
        </div>

        <div className="p-4">
          <div className="flex justify-end gap-2 mb-4">
            <button onClick={() => setShowFileUpload(true)} className="btn-outline text-sm px-3 py-1.5">
              Upload .xlsx
            </button>
            <button onClick={() => setShowBulkPaste(true)} className="btn-outline text-sm px-3 py-1.5">
              Bulk Paste
            </button>
          </div>

          {activeDataTab === 'eligibility' ? (
            <EligibilityTable
              rows={eligibilityRows}
              setRows={setEligibilityRows}
              legislativeDataGroupName={legislativeDataGroupName}
              effectiveStartDate={effectiveStartDate}
              warnings={warnings}
            />
          ) : (
            <CostingTable
              costInfoRows={costInfoRows}
              setCostInfoRows={setCostInfoRows}
              costAllocationRows={costAllocationRows}
              setCostAllocationRows={setCostAllocationRows}
              costAllocationAccountRows={costAllocationAccountRows}
              setCostAllocationAccountRows={setCostAllocationAccountRows}
              legislativeDataGroupName={legislativeDataGroupName}
              effectiveStartDate={effectiveStartDate}
              effectiveEndDate={effectiveEndDate}
              warnings={warnings}
            />
          )}
        </div>
      </div>

      <WarningPanel warnings={warnings} />

      {totalRows > 0 && <MultiFilePreview generatedFiles={generatedFiles} />}

      <ExportButton generatedFiles={generatedFiles} totalRows={totalRows} />

      <FileUploadZone
        isOpen={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        onImport={handleFileImport}
        legislativeDataGroupName={legislativeDataGroupName}
        effectiveStartDate={effectiveStartDate}
        effectiveEndDate={effectiveEndDate}
      />

      <BulkPasteModal
        isOpen={showBulkPaste}
        onClose={() => setShowBulkPaste(false)}
        onImport={handleFileImport}
        legislativeDataGroupName={legislativeDataGroupName}
        effectiveStartDate={effectiveStartDate}
        effectiveEndDate={effectiveEndDate}
      />
    </div>
  );
}
