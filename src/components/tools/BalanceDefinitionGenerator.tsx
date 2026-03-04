'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { BalanceFeedRow, Action, BalanceCodeLookup, ElementCodeLookup } from '@/lib/balance-feed/types';
import { DEFAULT_EFFECTIVE_START_DATE } from '@/lib/balance-feed/constants';
import { generateDatContent } from '@/lib/balance-feed/hdl-generator';
import { validateRows } from '@/lib/balance-feed/validation';
import { downloadTemplateXlsx } from '@/lib/balance-feed/file-export';
import { LookupResult } from '@/lib/balance-feed/lookup-parser';
import SessionDefaults from '@/components/balance-feed/SessionDefaults';
import RowEntryTable from '@/components/balance-feed/RowEntryTable';
import BulkPasteModal from '@/components/balance-feed/BulkPasteModal';
import HdlPreview from '@/components/balance-feed/HdlPreview';
import WarningPanel from '@/components/balance-feed/WarningPanel';
import ExportButtons from '@/components/balance-feed/ExportButtons';
import LookupUploadZone from '@/components/balance-feed/LookupUploadZone';

export default function BalanceDefinitionGenerator() {
  // Session defaults
  const [sessionAction, setSessionAction] = useState<Action>('MERGE');
  const [legislativeDataGroup, setLegislativeDataGroup] = useState(
    'US Legislative Data Group'
  );
  const [effectiveStartDate, setEffectiveStartDate] = useState(
    DEFAULT_EFFECTIVE_START_DATE
  );
  const [clientEngagement, setClientEngagement] = useState('');

  // Row data
  const [rows, setRows] = useState<BalanceFeedRow[]>([]);

  // Bulk paste modal
  const [showBulkPaste, setShowBulkPaste] = useState(false);

  // FIX-10: V-lookup state
  const [balanceLookup, setBalanceLookup] = useState<BalanceCodeLookup>(new Map());
  const [elementLookup, setElementLookup] = useState<ElementCodeLookup>(new Map());

  // Apply session defaults to all rows when defaults change
  useEffect(() => {
    if (rows.length > 0) {
      setRows((prev) =>
        prev.map((row) => ({
          ...row,
          action: sessionAction,
          legislativeDataGroupName: legislativeDataGroup,
          effectiveStartDate: effectiveStartDate,
        }))
      );
    }
  }, [sessionAction, legislativeDataGroup, effectiveStartDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Computed values
  const datContent = useMemo(() => generateDatContent(rows), [rows]);
  const warnings = useMemo(
    () => validateRows(rows, balanceLookup.size > 0 ? balanceLookup : undefined, elementLookup.size > 0 ? elementLookup : undefined),
    [rows, balanceLookup, elementLookup]
  );

  const warningCount = warnings.length;
  const rowCount = rows.length;

  function handleBulkImport(newRows: BalanceFeedRow[]) {
    const rowsWithAction = newRows.map((r) => ({ ...r, action: sessionAction }));
    setRows((prev) => [...prev, ...rowsWithAction]);
  }

  function handleActionChange(action: Action) {
    setSessionAction(action);
  }

  // FIX-06: Download template handler
  function handleDownloadTemplate() {
    downloadTemplateXlsx();
  }

  // FIX-10: Lookup loaded handler
  const handleLookupLoaded = useCallback((result: LookupResult) => {
    setBalanceLookup(result.balanceLookup);
    setElementLookup(result.elementLookup);
  }, []);

  // FIX-10: Clear lookup handler (T-10q)
  const handleLookupCleared = useCallback(() => {
    setBalanceLookup(new Map());
    setElementLookup(new Map());
  }, []);

  return (
    <div className="space-y-6">
      {/* FIX-06: Download Template section at top */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
        <div>
          <span className="text-sm text-gray-500">
            {rowCount > 0
              ? `${rowCount} row${rowCount !== 1 ? 's' : ''}${warningCount > 0 ? ` | ${warningCount} warning${warningCount !== 1 ? 's' : ''}` : ''} | Ready to export`
              : 'No rows — add rows manually or paste data to get started'}
          </span>
          {rowCount === 0 && (
            <p className="text-xs text-gray-400 mt-1">
              First time? Download the template, fill it out in Excel, then paste your data below.
            </p>
          )}
        </div>
        <button
          onClick={handleDownloadTemplate}
          className="btn-outline text-sm px-3 py-1.5 shrink-0"
        >
          Download Template
        </button>
      </div>

      <SessionDefaults
        legislativeDataGroup={legislativeDataGroup}
        setLegislativeDataGroup={setLegislativeDataGroup}
        effectiveStartDate={effectiveStartDate}
        setEffectiveStartDate={setEffectiveStartDate}
        clientEngagement={clientEngagement}
        setClientEngagement={setClientEngagement}
        sessionAction={sessionAction}
        setSessionAction={setSessionAction}
      />

      {/* FIX-10: Lookup upload zone */}
      <LookupUploadZone
        onLookupLoaded={handleLookupLoaded}
        onLookupCleared={handleLookupCleared}
        balanceLookupSize={balanceLookup.size}
        elementLookupSize={elementLookup.size}
      />

      <RowEntryTable
        rows={rows}
        setRows={setRows}
        sessionDefaults={{
          legislativeDataGroupName: legislativeDataGroup,
          effectiveStartDate: effectiveStartDate,
        }}
        sessionAction={sessionAction}
        onActionChange={handleActionChange}
        warnings={warnings}
        onBulkPaste={() => setShowBulkPaste(true)}
        balanceLookup={balanceLookup.size > 0 ? balanceLookup : undefined}
        elementLookup={elementLookup.size > 0 ? elementLookup : undefined}
      />

      <WarningPanel warnings={warnings} />

      {rows.length > 0 && <HdlPreview datContent={datContent} />}

      <ExportButtons rows={rows} datContent={datContent} />

      <BulkPasteModal
        isOpen={showBulkPaste}
        onClose={() => setShowBulkPaste(false)}
        onImport={handleBulkImport}
        sessionDefaults={{
          legislativeDataGroupName: legislativeDataGroup,
          effectiveStartDate: effectiveStartDate,
        }}
        balanceLookup={balanceLookup.size > 0 ? balanceLookup : undefined}
        elementLookup={elementLookup.size > 0 ? elementLookup : undefined}
      />
    </div>
  );
}
