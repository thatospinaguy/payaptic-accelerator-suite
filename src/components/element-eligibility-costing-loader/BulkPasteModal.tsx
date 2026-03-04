'use client';

import { useState } from 'react';
import {
  ElementEligibilityRow,
  CostInfoRow,
  CostAllocationRow,
  CostAllocationAccountRow,
  AllData,
} from '@/lib/element-eligibility-costing-loader/types';

interface BulkPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: AllData) => void;
  legislativeDataGroupName: string;
  effectiveStartDate: string;
  effectiveEndDate: string;
}

type PasteTarget = 'eligibility' | 'costing';

function isHeaderRow(cols: string[]): boolean {
  const joined = cols.join(' ').toLowerCase();
  return (
    joined.includes('element') ||
    joined.includes('eligibility') ||
    joined.includes('metadata') ||
    joined.includes('cost account') ||
    joined.includes('source type')
  );
}

export default function BulkPasteModal({
  isOpen,
  onClose,
  onImport,
  legislativeDataGroupName,
  effectiveStartDate,
  effectiveEndDate,
}: BulkPasteModalProps) {
  const [pasteData, setPasteData] = useState('');
  const [parseError, setParseError] = useState('');
  const [pasteTarget, setPasteTarget] = useState<PasteTarget>('eligibility');

  if (!isOpen) return null;

  function parseEligibilityData(): ElementEligibilityRow[] {
    const lines = pasteData
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const rows: ElementEligibilityRow[] = [];

    for (const line of lines) {
      const cols = line.split('\t');
      if (isHeaderRow(cols)) continue;
      if (cols.length < 2) continue;

      rows.push({
        legislativeDataGroupName: cols[0]?.trim() || legislativeDataGroupName,
        elementCode: cols[1]?.trim() || '',
        elementEligibilityName: cols[2]?.trim() || cols[1]?.trim() || '',
        effectiveStartDate: cols[3]?.trim() || effectiveStartDate,
        payrollStatUnitCode: cols[4]?.trim() || '',
        legalEmployerCode: cols[5]?.trim() || '',
        payrollCode: cols[6]?.trim() || '',
        bargainingUnitCode: cols[7]?.trim() || '',
        automaticEntryFlag: cols[8]?.trim() || 'No',
        peopleGroup: cols[9]?.trim() || '',
        costingLinkFlag: cols[10]?.trim() || '',
      });
    }

    return rows;
  }

  function parseCostingData(): {
    costInfoRows: CostInfoRow[];
    costAllocationRows: CostAllocationRow[];
    costAllocationAccountRows: CostAllocationAccountRow[];
  } {
    const lines = pasteData
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const costInfoRows: CostInfoRow[] = [];
    const costAllocationRows: CostAllocationRow[] = [];
    const costAllocationAccountRows: CostAllocationAccountRow[] = [];
    const seenAllocations = new Set<string>();

    for (const line of lines) {
      const cols = line.split('\t');
      if (isHeaderRow(cols)) continue;
      if (cols.length < 2) continue;

      // Expected: ElementCode, EligibilityName, CostAccount, CostCenter, Job, OffsetAccount, OffsetCostCenter, OffsetJob, LinkInputName
      const elementCode = cols[0]?.trim() || '';
      const eligName = cols[1]?.trim() || '';
      const costAccount = cols[2]?.trim() || '';
      const costCenter = cols[3]?.trim() || '';
      const job = cols[4]?.trim() || '';
      const offsetAccount = cols[5]?.trim() || '';
      const offsetCostCenter = cols[6]?.trim() || '00';
      const offsetJob = cols[7]?.trim() || '00';
      const linkInput = cols[8]?.trim() || '';

      if (!elementCode && !eligName) continue;

      // CostInfoV3: EL row
      costInfoRows.push({
        costableType: 'C',
        distributionSetName: '',
        costedFlag: 'Y',
        effectiveEndDate: effectiveEndDate,
        effectiveStartDate: effectiveStartDate,
        sourceType: 'EL',
        transferToGlFlag: 'Y',
        legislativeDataGroupName,
        elementCode,
        elementEligibilityName: eligName,
        linkInputName: '',
      });

      // CostInfoV3: LIV row
      const derivedLinkInput = linkInput ||
        (eligName.includes('Canadian Calculation') ? 'Hours' : 'Pay Value');
      costInfoRows.push({
        costableType: 'C',
        distributionSetName: '',
        costedFlag: 'Y',
        effectiveEndDate: effectiveEndDate,
        effectiveStartDate: effectiveStartDate,
        sourceType: 'LIV',
        transferToGlFlag: 'Y',
        legislativeDataGroupName,
        elementCode,
        elementEligibilityName: eligName,
        linkInputName: derivedLinkInput,
      });

      // CostAllocationV3
      const allocKey = `${elementCode}|${eligName}`;
      if (!seenAllocations.has(allocKey)) {
        seenAllocations.add(allocKey);
        costAllocationRows.push({
          effectiveEndDate: effectiveEndDate,
          effectiveStartDate: effectiveStartDate,
          sourceType: 'EL',
          elementCode,
          elementEligibilityName: eligName,
          legislativeDataGroupName,
        });
      }

      // CostAllocationAccountV3: COST
      if (costAccount || costCenter || job) {
        costAllocationAccountRows.push({
          sourceType: 'EL',
          segment1: '',
          segment2: costCenter,
          segment3: job,
          segment4: costAccount,
          segment5: '',
          segment6: '',
          sourceSubType: 'COST',
          legislativeDataGroupName,
          elementCode,
          elementEligibilityName: eligName,
          effectiveDate: effectiveStartDate,
          proportion: '1',
          subTypeSequence: '1',
        });
      }

      // CostAllocationAccountV3: BAL
      if (offsetAccount) {
        costAllocationAccountRows.push({
          sourceType: 'EL',
          segment1: '',
          segment2: offsetCostCenter,
          segment3: offsetJob,
          segment4: offsetAccount,
          segment5: '',
          segment6: '',
          sourceSubType: 'BAL',
          legislativeDataGroupName,
          elementCode,
          elementEligibilityName: eligName,
          effectiveDate: effectiveStartDate,
          proportion: '1',
          subTypeSequence: '1',
        });
      }
    }

    return { costInfoRows, costAllocationRows, costAllocationAccountRows };
  }

  function parsePastedData() {
    setParseError('');

    if (!pasteData.trim()) {
      setParseError('No data found. Paste tab-separated data from your spreadsheet.');
      return;
    }

    if (pasteTarget === 'eligibility') {
      const eligibilityRows = parseEligibilityData();
      if (eligibilityRows.length === 0) {
        setParseError('No data rows found. Only header rows were detected.');
        return;
      }
      onImport({
        eligibilityRows,
        costInfoRows: [],
        costAllocationRows: [],
        costAllocationAccountRows: [],
      });
    } else {
      const costing = parseCostingData();
      const total =
        costing.costInfoRows.length +
        costing.costAllocationRows.length +
        costing.costAllocationAccountRows.length;
      if (total === 0) {
        setParseError('No data rows found. Only header rows were detected.');
        return;
      }
      onImport({
        eligibilityRows: [],
        ...costing,
      });
    }

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

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setPasteTarget('eligibility')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              pasteTarget === 'eligibility'
                ? 'bg-payaptic-ocean text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Eligibility Data
          </button>
          <button
            onClick={() => setPasteTarget('costing')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              pasteTarget === 'costing'
                ? 'bg-payaptic-ocean text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Costing Data
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-2">
          Paste tab-separated data from Excel or Google Sheets.
        </p>
        {pasteTarget === 'eligibility' ? (
          <ul className="text-xs text-gray-500 mb-4 list-disc list-inside space-y-1">
            <li>
              <strong>Expected columns (28.01 tab order):</strong> LDG, Element Code,
              Eligibility Name, Effective Start Date, Stat Unit, Legal Employer, Payroll,
              Bargaining Unit, Automatic Entry Flag, People Group, Costing Link
            </li>
            <li>AutomaticEntryFlag: use &quot;Yes&quot; or &quot;No&quot; (not Y/N)</li>
          </ul>
        ) : (
          <ul className="text-xs text-gray-500 mb-4 list-disc list-inside space-y-1">
            <li>
              <strong>Expected columns (28.03 tab order):</strong> Element Code, Eligibility Name,
              Cost Account, Cost Center, Job, Offset Account, Offset Cost Center, Offset Job,
              Link Input Name
            </li>
            <li>Each row generates CostInfo (EL+LIV), CostAllocation, and CostAllocationAccount (COST+BAL) records</li>
          </ul>
        )}

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
