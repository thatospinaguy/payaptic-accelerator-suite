'use client';

import { useState, useMemo, useEffect } from 'react';
import { BalanceFeedRow, Action } from '@/lib/balance-feed/types';
import { DEFAULT_EFFECTIVE_START_DATE } from '@/lib/balance-feed/constants';
import { generateDatContent } from '@/lib/balance-feed/hdl-generator';
import { validateRows } from '@/lib/balance-feed/validation';
import { DEMO_ROWS } from '@/lib/balance-feed/demo-data';
import SessionDefaults from '@/components/balance-feed/SessionDefaults';
import RowEntryTable from '@/components/balance-feed/RowEntryTable';
import BulkPasteModal from '@/components/balance-feed/BulkPasteModal';
import HdlPreview from '@/components/balance-feed/HdlPreview';
import WarningPanel from '@/components/balance-feed/WarningPanel';
import ExportButtons from '@/components/balance-feed/ExportButtons';

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
  const warnings = useMemo(() => validateRows(rows), [rows]);

  const warningCount = warnings.length;
  const rowCount = rows.length;

  function handleBulkImport(newRows: BalanceFeedRow[]) {
    const rowsWithAction = newRows.map((r) => ({ ...r, action: sessionAction }));
    setRows((prev) => [...prev, ...rowsWithAction]);
  }

  function handleActionChange(action: Action) {
    setSessionAction(action);
  }

  function loadSampleData() {
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
      />
    </div>
  );
}
