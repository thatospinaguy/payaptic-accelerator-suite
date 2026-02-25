'use client';

import { BalanceFeedRow, Action, AddSubtractHuman, Warning } from '@/lib/balance-feed/types';
import { KNOWN_INPUT_VALUE_CODES } from '@/lib/balance-feed/constants';
import { useState, useRef } from 'react';

interface RowEntryTableProps {
  rows: BalanceFeedRow[];
  setRows: (rows: BalanceFeedRow[]) => void;
  sessionDefaults: {
    legislativeDataGroupName: string;
    effectiveStartDate: string;
  };
  sessionAction: Action;
  onActionChange: (action: Action) => void;
  warnings: Warning[];
  onBulkPaste: () => void;
}

export default function RowEntryTable({
  rows,
  setRows,
  sessionDefaults,
  sessionAction,
  onActionChange,
  warnings,
  onBulkPaste,
}: RowEntryTableProps) {
  const [showSuggestions, setShowSuggestions] = useState<number | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  function addRow() {
    setRows([
      ...rows,
      {
        action: sessionAction,
        balanceCode: '',
        effectiveStartDate: sessionDefaults.effectiveStartDate,
        legislativeDataGroupName: sessionDefaults.legislativeDataGroupName,
        elementCode: '',
        inputValueCode: '',
        addSubtractHuman: 'Add',
      },
    ]);
  }

  function updateRow(index: number, field: keyof BalanceFeedRow, value: string) {
    if (field === 'action') {
      // Enforce: changing action on any row changes ALL rows (file-level setting)
      onActionChange(value as Action);
      return;
    }
    const updated = rows.map((row, i) => {
      if (i !== index) return row;
      return { ...row, [field]: value };
    });
    setRows(updated);
  }

  function removeRow(index: number) {
    setRows(rows.filter((_, i) => i !== index));
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

  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-payaptic-ocean uppercase tracking-wider">
          Row Entry
        </h2>
        <div className="flex gap-2">
          <button onClick={onBulkPaste} className="btn-outline text-sm px-3 py-1.5">
            Bulk Paste from Spreadsheet
          </button>
          <button onClick={addRow} className="btn-primary text-sm px-3 py-1.5">
            + Add Row
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-3 py-2 font-medium text-gray-600 w-10">#</th>
              <th className="px-3 py-2 font-medium text-gray-600 w-24">Action</th>
              <th className="px-3 py-2 font-medium text-gray-600">Balance Code</th>
              <th className="px-3 py-2 font-medium text-gray-600">Element Code</th>
              <th className="px-3 py-2 font-medium text-gray-600 w-48">Input Value Code</th>
              <th className="px-3 py-2 font-medium text-gray-600 w-28">Add / Subtract</th>
              <th className="px-3 py-2 font-medium text-gray-600 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const rowWarnings = getRowWarnings(i);
              const hasWarning = rowWarnings.length > 0;
              return (
                <tr
                  key={i}
                  className={`border-t border-gray-100 ${hasWarning ? 'bg-amber-50' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-3 py-2 text-gray-400 font-mono text-xs">
                    {i + 1}
                    {hasWarning && (
                      <span className="text-amber-500 ml-1" title={rowWarnings.map(w => w.message).join('\n')}>
                        !
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={row.action}
                      onChange={(e) => updateRow(i, 'action', e.target.value as Action)}
                      className="input-field w-full"
                    >
                      <option value="MERGE">MERGE</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={row.balanceCode}
                      onChange={(e) => updateRow(i, 'balanceCode', e.target.value)}
                      className={`input-field w-full ${!row.balanceCode ? 'border-amber-300' : ''}`}
                      placeholder="Balance Code"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={row.elementCode}
                      onChange={(e) => updateRow(i, 'elementCode', e.target.value)}
                      className={`input-field w-full ${!row.elementCode ? 'border-amber-300' : ''}`}
                      placeholder="Element Code"
                    />
                  </td>
                  <td className="px-3 py-2 relative">
                    <input
                      type="text"
                      value={row.inputValueCode}
                      onChange={(e) => updateRow(i, 'inputValueCode', e.target.value)}
                      onFocus={() => setShowSuggestions(i)}
                      onBlur={() => setTimeout(() => setShowSuggestions(null), 200)}
                      className={`input-field w-full ${!row.inputValueCode ? 'border-amber-300' : ''}`}
                      placeholder="Input Value Code"
                    />
                    {showSuggestions === i && (
                      <div
                        ref={suggestionsRef}
                        className="absolute z-10 top-full left-3 right-3 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto"
                      >
                        {filteredSuggestions(row.inputValueCode).map((code) => (
                          <button
                            key={code}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              updateRow(i, 'inputValueCode', code);
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
                        updateRow(i, 'addSubtractHuman', e.target.value as AddSubtractHuman)
                      }
                      className="input-field w-full"
                    >
                      <option value="Add">Add</option>
                      <option value="Subtract">Subtract</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => removeRow(i)}
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
                <td colSpan={7} className="px-3 py-8 text-center text-gray-400">
                  No rows yet. Click &quot;+ Add Row&quot; or use &quot;Bulk Paste&quot; to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
