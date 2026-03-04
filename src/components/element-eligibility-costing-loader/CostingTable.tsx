'use client';

import { useState } from 'react';
import {
  CostInfoRow,
  CostAllocationRow,
  CostAllocationAccountRow,
  Warning,
} from '@/lib/element-eligibility-costing-loader/types';

interface CostingTableProps {
  costInfoRows: CostInfoRow[];
  setCostInfoRows: (rows: CostInfoRow[]) => void;
  costAllocationRows: CostAllocationRow[];
  setCostAllocationRows: (rows: CostAllocationRow[]) => void;
  costAllocationAccountRows: CostAllocationAccountRow[];
  setCostAllocationAccountRows: (rows: CostAllocationAccountRow[]) => void;
  legislativeDataGroupName: string;
  effectiveStartDate: string;
  effectiveEndDate: string;
  warnings: Warning[];
}

type CostSubTab = 'costInfo' | 'costAllocation' | 'costAllocationAccount';

export default function CostingTable({
  costInfoRows,
  setCostInfoRows,
  costAllocationRows,
  setCostAllocationRows,
  costAllocationAccountRows,
  setCostAllocationAccountRows,
  legislativeDataGroupName,
  effectiveStartDate,
  effectiveEndDate,
  warnings,
}: CostingTableProps) {
  const [subTab, setSubTab] = useState<CostSubTab>('costInfo');

  // --- CostInfo ---
  function addCostInfoRow() {
    setCostInfoRows([
      ...costInfoRows,
      {
        costableType: 'C',
        distributionSetName: '',
        costedFlag: 'Y',
        effectiveEndDate,
        effectiveStartDate,
        sourceType: 'EL',
        transferToGlFlag: 'Y',
        legislativeDataGroupName,
        elementCode: '',
        elementEligibilityName: '',
        linkInputName: '',
      },
    ]);
  }

  function updateCostInfoRow(index: number, field: keyof CostInfoRow, value: string) {
    setCostInfoRows(
      costInfoRows.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  function removeCostInfoRow(index: number) {
    setCostInfoRows(costInfoRows.filter((_, i) => i !== index));
  }

  // --- CostAllocation ---
  function addCostAllocationRow() {
    setCostAllocationRows([
      ...costAllocationRows,
      {
        effectiveEndDate,
        effectiveStartDate,
        sourceType: 'EL',
        elementCode: '',
        elementEligibilityName: '',
        legislativeDataGroupName,
      },
    ]);
  }

  function updateCostAllocationRow(index: number, field: keyof CostAllocationRow, value: string) {
    setCostAllocationRows(
      costAllocationRows.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  function removeCostAllocationRow(index: number) {
    setCostAllocationRows(costAllocationRows.filter((_, i) => i !== index));
  }

  // --- CostAllocationAccount ---
  function addCostAllocationAccountRow() {
    setCostAllocationAccountRows([
      ...costAllocationAccountRows,
      {
        sourceType: 'EL',
        segment1: '',
        segment2: '',
        segment3: '',
        segment4: '',
        segment5: '',
        segment6: '',
        sourceSubType: 'COST',
        legislativeDataGroupName,
        elementCode: '',
        elementEligibilityName: '',
        effectiveDate: effectiveStartDate,
        proportion: '1',
        subTypeSequence: '1',
      },
    ]);
  }

  function updateCostAllocationAccountRow(
    index: number,
    field: keyof CostAllocationAccountRow,
    value: string
  ) {
    setCostAllocationAccountRows(
      costAllocationAccountRows.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    );
  }

  function removeCostAllocationAccountRow(index: number) {
    setCostAllocationAccountRows(
      costAllocationAccountRows.filter((_, i) => i !== index)
    );
  }

  const subTabs: { key: CostSubTab; label: string; count: number }[] = [
    { key: 'costInfo', label: 'CostInfo', count: costInfoRows.length },
    { key: 'costAllocation', label: 'CostAllocation', count: costAllocationRows.length },
    { key: 'costAllocationAccount', label: 'CostAllocationAccount', count: costAllocationAccountRows.length },
  ];

  return (
    <div>
      {/* Sub-tabs for costing record types */}
      <div className="flex gap-1 mb-4">
        {subTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSubTab(tab.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              subTab === tab.key
                ? 'bg-payaptic-ocean text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* CostInfo table */}
      {subTab === 'costInfo' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">
              CostInfoV3 ({costInfoRows.length} row{costInfoRows.length !== 1 ? 's' : ''})
            </h3>
            <button onClick={addCostInfoRow} className="btn-primary text-sm px-3 py-1.5">
              + Add Row
            </button>
          </div>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm" style={{ minWidth: '1600px' }}>
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-3 py-2 font-medium text-gray-600 w-10">#</th>
                  <th className="px-3 py-2 font-medium text-gray-600 min-w-[70px]">Costable</th>
                  <th className="px-3 py-2 font-medium text-gray-600 min-w-[60px]">Costed</th>
                  <th className="px-3 py-2 font-medium text-gray-600 min-w-[70px]">Source</th>
                  <th className="px-3 py-2 font-medium text-gray-600 min-w-[60px]">GL</th>
                  <th className="px-3 py-2 font-medium text-gray-600 min-w-[280px]">Element Code</th>
                  <th className="px-3 py-2 font-medium text-gray-600 min-w-[320px]">Eligibility Name</th>
                  <th className="px-3 py-2 font-medium text-gray-600 min-w-[120px]">Link Input Name</th>
                  <th className="px-3 py-2 font-medium text-gray-600 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {costInfoRows.map((row, i) => (
                  <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-400 font-mono text-xs">{i + 1}</td>
                    <td className="px-3 py-2">
                      <input type="text" value={row.costableType} onChange={(e) => updateCostInfoRow(i, 'costableType', e.target.value)} className="input-field w-full" placeholder="C" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="text" value={row.costedFlag} onChange={(e) => updateCostInfoRow(i, 'costedFlag', e.target.value)} className="input-field w-full" placeholder="Y" />
                    </td>
                    <td className="px-3 py-2">
                      <select value={row.sourceType} onChange={(e) => updateCostInfoRow(i, 'sourceType', e.target.value)} className="input-field w-full">
                        <option value="EL">EL</option>
                        <option value="LIV">LIV</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input type="text" value={row.transferToGlFlag} onChange={(e) => updateCostInfoRow(i, 'transferToGlFlag', e.target.value)} className="input-field w-full" placeholder="Y" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="text" value={row.elementCode} onChange={(e) => updateCostInfoRow(i, 'elementCode', e.target.value)} className="input-field w-full" placeholder="Element Code" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="text" value={row.elementEligibilityName} onChange={(e) => updateCostInfoRow(i, 'elementEligibilityName', e.target.value)} className="input-field w-full" placeholder="Eligibility Name" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="text" value={row.linkInputName} onChange={(e) => updateCostInfoRow(i, 'linkInputName', e.target.value)} className="input-field w-full" placeholder="Hours / Pay Value" />
                    </td>
                    <td className="px-3 py-2">
                      <button onClick={() => removeCostInfoRow(i)} className="text-gray-400 hover:text-red-500 transition-colors" title="Remove row">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
                {costInfoRows.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-3 py-8 text-center text-gray-400">
                      No CostInfo rows yet. Click &quot;+ Add Row&quot; or upload a file.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CostAllocation table */}
      {subTab === 'costAllocation' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">
              CostAllocationV3 ({costAllocationRows.length} row{costAllocationRows.length !== 1 ? 's' : ''})
            </h3>
            <button onClick={addCostAllocationRow} className="btn-primary text-sm px-3 py-1.5">
              + Add Row
            </button>
          </div>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm" style={{ minWidth: '1200px' }}>
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-3 py-2 font-medium text-gray-600 w-10">#</th>
                  <th className="px-3 py-2 font-medium text-gray-600 min-w-[70px]">Source</th>
                  <th className="px-3 py-2 font-medium text-gray-600 min-w-[280px]">Element Code</th>
                  <th className="px-3 py-2 font-medium text-gray-600 min-w-[320px]">Eligibility Name</th>
                  <th className="px-3 py-2 font-medium text-gray-600 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {costAllocationRows.map((row, i) => (
                  <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-400 font-mono text-xs">{i + 1}</td>
                    <td className="px-3 py-2">
                      <select value={row.sourceType} onChange={(e) => updateCostAllocationRow(i, 'sourceType', e.target.value)} className="input-field w-full">
                        <option value="EL">EL</option>
                        <option value="LIV">LIV</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input type="text" value={row.elementCode} onChange={(e) => updateCostAllocationRow(i, 'elementCode', e.target.value)} className="input-field w-full" placeholder="Element Code" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="text" value={row.elementEligibilityName} onChange={(e) => updateCostAllocationRow(i, 'elementEligibilityName', e.target.value)} className="input-field w-full" placeholder="Eligibility Name" />
                    </td>
                    <td className="px-3 py-2">
                      <button onClick={() => removeCostAllocationRow(i)} className="text-gray-400 hover:text-red-500 transition-colors" title="Remove row">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
                {costAllocationRows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-gray-400">
                      No CostAllocation rows yet. Click &quot;+ Add Row&quot; or upload a file.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CostAllocationAccount table */}
      {subTab === 'costAllocationAccount' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">
              CostAllocationAccountV3 ({costAllocationAccountRows.length} row{costAllocationAccountRows.length !== 1 ? 's' : ''})
            </h3>
            <button onClick={addCostAllocationAccountRow} className="btn-primary text-sm px-3 py-1.5">
              + Add Row
            </button>
          </div>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm" style={{ minWidth: '2000px' }}>
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-3 py-2 font-medium text-gray-600 w-10">#</th>
                  <th className="px-3 py-2 font-medium text-gray-600 min-w-[70px]">Source</th>
                  <th className="px-3 py-2 font-medium text-gray-600 min-w-[100px]">Seg1 (Company)</th>
                  <th className="px-3 py-2 font-medium text-gray-600 min-w-[100px]">Seg2 (Cost Ctr)</th>
                  <th className="px-3 py-2 font-medium text-gray-600 min-w-[80px]">Seg3 (Job)</th>
                  <th className="px-3 py-2 font-medium text-gray-600 min-w-[100px]">Seg4 (Account)</th>
                  <th className="px-3 py-2 font-medium text-gray-600 min-w-[80px]">Seg5</th>
                  <th className="px-3 py-2 font-medium text-gray-600 min-w-[80px]">Seg6</th>
                  <th className="px-3 py-2 font-medium text-gray-600 min-w-[80px]">SubType</th>
                  <th className="px-3 py-2 font-medium text-gray-600 min-w-[280px]">Element Code</th>
                  <th className="px-3 py-2 font-medium text-gray-600 min-w-[320px]">Eligibility Name</th>
                  <th className="px-3 py-2 font-medium text-gray-600 min-w-[60px]">Prop.</th>
                  <th className="px-3 py-2 font-medium text-gray-600 min-w-[50px]">Seq</th>
                  <th className="px-3 py-2 font-medium text-gray-600 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {costAllocationAccountRows.map((row, i) => {
                  const accountWarnings = warnings.filter(
                    (w) =>
                      w.rowIndex === i &&
                      (w.id === 'MISSING_ACCOUNT' || w.id === 'INVALID_SOURCE_SUB_TYPE')
                  );
                  const hasWarning = accountWarnings.length > 0;
                  return (
                    <tr key={i} className={`border-t border-gray-100 ${hasWarning ? 'bg-amber-50' : 'hover:bg-gray-50'}`}>
                      <td className="px-3 py-2 text-gray-400 font-mono text-xs">
                        {i + 1}
                        {hasWarning && <span className="text-amber-500 ml-1" title={accountWarnings.map((w) => w.message).join('\n')}>!</span>}
                      </td>
                      <td className="px-3 py-2">
                        <select value={row.sourceType} onChange={(e) => updateCostAllocationAccountRow(i, 'sourceType', e.target.value)} className="input-field w-full">
                          <option value="EL">EL</option>
                          <option value="LIV">LIV</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input type="text" value={row.segment1} onChange={(e) => updateCostAllocationAccountRow(i, 'segment1', e.target.value)} className="input-field w-full" placeholder="" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="text" value={row.segment2} onChange={(e) => updateCostAllocationAccountRow(i, 'segment2', e.target.value)} className="input-field w-full" placeholder="00" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="text" value={row.segment3} onChange={(e) => updateCostAllocationAccountRow(i, 'segment3', e.target.value)} className="input-field w-full" placeholder="00" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="text" value={row.segment4} onChange={(e) => updateCostAllocationAccountRow(i, 'segment4', e.target.value)} className="input-field w-full" placeholder="920110" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="text" value={row.segment5} onChange={(e) => updateCostAllocationAccountRow(i, 'segment5', e.target.value)} className="input-field w-full" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="text" value={row.segment6} onChange={(e) => updateCostAllocationAccountRow(i, 'segment6', e.target.value)} className="input-field w-full" />
                      </td>
                      <td className="px-3 py-2">
                        <select value={row.sourceSubType} onChange={(e) => updateCostAllocationAccountRow(i, 'sourceSubType', e.target.value)} className="input-field w-full">
                          <option value="COST">COST</option>
                          <option value="BAL">BAL</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input type="text" value={row.elementCode} onChange={(e) => updateCostAllocationAccountRow(i, 'elementCode', e.target.value)} className="input-field w-full" placeholder="Element Code" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="text" value={row.elementEligibilityName} onChange={(e) => updateCostAllocationAccountRow(i, 'elementEligibilityName', e.target.value)} className="input-field w-full" placeholder="Eligibility Name" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="text" value={row.proportion} onChange={(e) => updateCostAllocationAccountRow(i, 'proportion', e.target.value)} className="input-field w-full" placeholder="1" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="text" value={row.subTypeSequence} onChange={(e) => updateCostAllocationAccountRow(i, 'subTypeSequence', e.target.value)} className="input-field w-full" placeholder="1" />
                      </td>
                      <td className="px-3 py-2">
                        <button onClick={() => removeCostAllocationAccountRow(i)} className="text-gray-400 hover:text-red-500 transition-colors" title="Remove row">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {costAllocationAccountRows.length === 0 && (
                  <tr>
                    <td colSpan={14} className="px-3 py-8 text-center text-gray-400">
                      No CostAllocationAccount rows yet. Click &quot;+ Add Row&quot; or upload a file.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
