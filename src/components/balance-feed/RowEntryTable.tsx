'use client';

import { BalanceFeedRow, Action, AddSubtractHuman, Warning } from '@/lib/balance-feed/types';
import { KNOWN_INPUT_VALUE_CODES } from '@/lib/balance-feed/constants';
import { useState, useRef, useMemo } from 'react';

type BalanceCodeLookup = Map<string, string[]>;
type ElementCodeLookup = Map<string, string>;

interface RowEntryTableProps {
  rows: BalanceFeedRow[];
  setRows: (rows: BalanceFeedRow[] | ((prev: BalanceFeedRow[]) => BalanceFeedRow[])) => void;
  sessionDefaults: {
    legislativeDataGroupName: string;
    effectiveStartDate: string;
  };
  sessionAction: Action;
  onActionChange: (action: Action) => void;
  warnings: Warning[];
  onBulkPaste: () => void;
  balanceLookup?: BalanceCodeLookup;
  elementLookup?: ElementCodeLookup;
}

export default function RowEntryTable({
  rows,
  setRows,
  sessionDefaults,
  sessionAction,
  onActionChange,
  warnings,
  onBulkPaste,
  balanceLookup,
  elementLookup,
}: RowEntryTableProps) {
  const [showSuggestions, setShowSuggestions] = useState<number | null>(null);
  const [sortByWarnings, setSortByWarnings] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const lookupActive = !!(balanceLookup && balanceLookup.size > 0) || !!(elementLookup && elementLookup.size > 0);

  function addRow() {
    setRows([
      ...rows,
      {
        action: sessionAction,
        balanceCode: '',
        balanceName: '',
        effectiveStartDate: sessionDefaults.effectiveStartDate,
        legislativeDataGroupName: sessionDefaults.legislativeDataGroupName,
        elementCode: '',
        elementName: '',
        inputValueCode: '',
        addSubtractHuman: 'Add',
      },
    ]);
  }

  function updateRow(index: number, field: keyof BalanceFeedRow, value: string) {
    if (field === 'action') {
      onActionChange(value as Action);
      return;
    }
    const updated = rows.map((row, i) => {
      if (i !== index) return row;
      const newRow = { ...row, [field]: value };

      // Auto-fill Balance Code from Balance Name lookup
      if (field === 'balanceName' && balanceLookup) {
        const codes = balanceLookup.get(value.trim());
        if (codes && codes.length === 1) {
          newRow.balanceCode = codes[0];
        } else if (!codes) {
          newRow.balanceCode = '';
        }
        // If multiple codes, leave for user to pick via dropdown
      }

      // Auto-fill Element Code from Element Name lookup
      if (field === 'elementName' && elementLookup) {
        const code = elementLookup.get(value.trim());
        if (code) {
          newRow.elementCode = code;
        } else {
          newRow.elementCode = '';
        }
      }

      return newRow;
    });
    setRows(updated);
  }

  function removeRow(index: number) {
    setRows(rows.filter((_, i) => i !== index));
  }

  function clearAllRows() {
    setRows([]);
    setShowClearConfirm(false);
  }

  function getRowWarnings(index: number): Warning[] {
    return warnings.filter((w) => w.rowIndex === index);
  }

  function filteredSuggestions(value: string): string[] {
    if (!value) return KNOWN_INPUT_VALUE_CODES;
    return KNOWN_INPUT_VALUE_CODES.filter((code) =>
      code.toLowerCase().includes(value.toLowerCase())
    );
  }

  // FIX-05: Sort rows by warning status
  const displayRows = useMemo(() => {
    const indexed = rows.map((row, i) => ({ row, originalIndex: i }));
    if (!sortByWarnings) return indexed;

    const warningSet = new Set(warnings.map((w) => w.rowIndex));
    return [...indexed].sort((a, b) => {
      const aHas = warningSet.has(a.originalIndex) ? 0 : 1;
      const bHas = warningSet.has(b.originalIndex) ? 0 : 1;
      return aHas - bHas;
    });
  }, [rows, warnings, sortByWarnings]);

  // Get multi-code options for balance name
  function getBalanceCodeOptions(balanceName: string): string[] | null {
    if (!balanceLookup || !balanceName) return null;
    const codes = balanceLookup.get(balanceName.trim());
    if (codes && codes.length > 1) return codes;
    return null;
  }

  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-payaptic-ocean uppercase tracking-wider">
          Row Entry
        </h2>
        <div className="flex gap-2">
          {/* FIX-02: Clear All Rows button */}
          {rows.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="btn-outline text-sm px-3 py-1.5 text-red-600 border-red-300 hover:bg-red-50"
            >
              Clear All Rows
            </button>
          )}
          <button onClick={onBulkPaste} className="btn-outline text-sm px-3 py-1.5">
            Bulk Paste from Spreadsheet
          </button>
          <button onClick={addRow} className="btn-primary text-sm px-3 py-1.5">
            + Add Row
          </button>
        </div>
      </div>

      {/* FIX-05: Sort toggle */}
      {warnings.length > 0 && rows.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
          <button
            onClick={() => setSortByWarnings(!sortByWarnings)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              sortByWarnings
                ? 'bg-amber-200 text-amber-800 font-medium'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {sortByWarnings ? 'Showing issues first' : 'Show issues first'}
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-3 py-2 font-medium text-gray-600 w-10">#</th>
              <th className="px-3 py-2 font-medium text-gray-600 w-24">Action</th>
              {/* FIX-10: Balance Name column when lookup active */}
              {lookupActive && balanceLookup && balanceLookup.size > 0 && (
                <th className="px-3 py-2 font-medium text-gray-600">Balance Name</th>
              )}
              <th className="px-3 py-2 font-medium text-gray-600">Balance Code</th>
              {/* FIX-03: Effective Start Date column */}
              <th className="px-3 py-2 font-medium text-gray-600 w-36">Effective Start Date</th>
              <th className="px-3 py-2 font-medium text-gray-600">LDG</th>
              {/* FIX-10: Element Name column when lookup active */}
              {lookupActive && elementLookup && elementLookup.size > 0 && (
                <th className="px-3 py-2 font-medium text-gray-600">Element Name</th>
              )}
              <th className="px-3 py-2 font-medium text-gray-600">Element Code</th>
              <th className="px-3 py-2 font-medium text-gray-600 w-48">Input Value Code</th>
              <th className="px-3 py-2 font-medium text-gray-600 w-28">Add / Subtract</th>
              {/* FIX-04: Warnings/Errors column header */}
              <th
                className="px-3 py-2 font-medium text-gray-600 w-48 cursor-pointer select-none"
                onClick={() => {
                  if (warnings.length > 0) setSortByWarnings(!sortByWarnings);
                }}
                title="Click to sort by warnings"
              >
                Warnings / Errors
                {warnings.length > 0 && (
                  <span className="ml-1 text-xs text-amber-500">
                    {sortByWarnings ? '\u25B2' : '\u25BC'}
                  </span>
                )}
              </th>
              <th className="px-3 py-2 font-medium text-gray-600 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map(({ row, originalIndex }) => {
              const rowWarnings = getRowWarnings(originalIndex);
              const hasWarning = rowWarnings.length > 0;
              const balanceCodeOptions = getBalanceCodeOptions(row.balanceName || '');
              return (
                <tr
                  key={originalIndex}
                  className={`border-t border-gray-100 ${hasWarning ? 'bg-amber-50' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-3 py-2 text-gray-400 font-mono text-xs">
                    {originalIndex + 1}
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={row.action}
                      onChange={(e) => updateRow(originalIndex, 'action', e.target.value as Action)}
                      className="input-field w-full"
                    >
                      <option value="MERGE">MERGE</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </td>
                  {/* FIX-10: Balance Name input */}
                  {lookupActive && balanceLookup && balanceLookup.size > 0 && (
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.balanceName || ''}
                        onChange={(e) => updateRow(originalIndex, 'balanceName', e.target.value)}
                        className="input-field w-full"
                        placeholder="Balance Name"
                      />
                    </td>
                  )}
                  <td className="px-3 py-2">
                    {balanceCodeOptions ? (
                      <select
                        value={row.balanceCode}
                        onChange={(e) => updateRow(originalIndex, 'balanceCode', e.target.value)}
                        className="input-field w-full"
                      >
                        <option value="">-- Select Code --</option>
                        {balanceCodeOptions.map((code) => (
                          <option key={code} value={code}>{code}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={row.balanceCode}
                        onChange={(e) => updateRow(originalIndex, 'balanceCode', e.target.value)}
                        className={`input-field w-full ${!row.balanceCode ? 'border-amber-300' : ''}`}
                        placeholder="Balance Code"
                      />
                    )}
                  </td>
                  {/* FIX-03: Effective Start Date cell */}
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={row.effectiveStartDate}
                      onChange={(e) => updateRow(originalIndex, 'effectiveStartDate', e.target.value)}
                      className="input-field w-full text-xs"
                      placeholder="YYYY/MM/DD"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={row.legislativeDataGroupName}
                      onChange={(e) => updateRow(originalIndex, 'legislativeDataGroupName', e.target.value)}
                      className="input-field w-full text-xs"
                      placeholder="LDG"
                    />
                  </td>
                  {/* FIX-10: Element Name input */}
                  {lookupActive && elementLookup && elementLookup.size > 0 && (
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.elementName || ''}
                        onChange={(e) => updateRow(originalIndex, 'elementName', e.target.value)}
                        className="input-field w-full"
                        placeholder="Element Name"
                      />
                    </td>
                  )}
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={row.elementCode}
                      onChange={(e) => updateRow(originalIndex, 'elementCode', e.target.value)}
                      className={`input-field w-full ${!row.elementCode ? 'border-amber-300' : ''}`}
                      placeholder="Element Code"
                    />
                  </td>
                  <td className="px-3 py-2 relative">
                    <input
                      type="text"
                      value={row.inputValueCode}
                      onChange={(e) => updateRow(originalIndex, 'inputValueCode', e.target.value)}
                      onFocus={() => setShowSuggestions(originalIndex)}
                      onBlur={() => setTimeout(() => setShowSuggestions(null), 200)}
                      className={`input-field w-full ${!row.inputValueCode ? 'border-amber-300' : ''}`}
                      placeholder="Input Value Code"
                    />
                    {showSuggestions === originalIndex && (
                      <div
                        ref={suggestionsRef}
                        className="absolute z-10 top-full left-3 right-3 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto"
                      >
                        {filteredSuggestions(row.inputValueCode).map((code) => (
                          <button
                            key={code}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              updateRow(originalIndex, 'inputValueCode', code);
                              setShowSuggestions(null);
                            }}
                            className="block w-full text-left px-3 py-2 text-sm hover:bg-payaptic-lime/30 transition-colors"
                          >
                            {code}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={row.addSubtractHuman}
                      onChange={(e) =>
                        updateRow(originalIndex, 'addSubtractHuman', e.target.value as AddSubtractHuman)
                      }
                      className="input-field w-full"
                    >
                      <option value="Add">Add</option>
                      <option value="Subtract">Subtract</option>
                    </select>
                  </td>
                  {/* FIX-04: Inline Warnings/Errors column */}
                  <td className="px-3 py-2">
                    {rowWarnings.length > 0 && (
                      <div className="space-y-1">
                        {rowWarnings.map((w, wi) => (
                          <div key={wi} className="text-xs text-amber-700 flex items-start gap-1">
                            <span className="font-mono text-[10px] bg-amber-200 rounded px-1 py-0.5 shrink-0">
                              {w.id}
                            </span>
                            <span className="leading-tight">{w.message.replace(/^Row \d+: /, '')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => removeRow(originalIndex)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove row"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={lookupActive ? 12 : 10} className="px-3 py-8 text-center text-gray-400">
                  No rows yet. Click &quot;+ Add Row&quot; or use &quot;Bulk Paste&quot; to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FIX-02: Clear All Rows confirmation dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-full max-w-sm mx-4 p-6">
            <h3 className="text-lg font-semibold text-payaptic-navy mb-2">
              Clear All Rows?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to clear all rows? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="btn-outline text-sm"
              >
                Cancel
              </button>
              <button
                onClick={clearAllRows}
                className="bg-red-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
