'use client';

import { CalcValueDefRow, Warning } from '@/lib/calc-value-def-loader/types';

interface CalcValueDefTableProps {
  rows: CalcValueDefRow[];
  setRows: (rows: CalcValueDefRow[]) => void;
  legislativeDataGroupName: string;
  effectiveStartDate: string;
  warnings: Warning[];
  onBulkPaste: () => void;
  onFileUpload: () => void;
}

export default function CalcValueDefTable({
  rows,
  setRows,
  legislativeDataGroupName,
  effectiveStartDate,
  warnings,
  onBulkPaste,
  onFileUpload,
}: CalcValueDefTableProps) {
  function addRow() {
    setRows([
      ...rows,
      {
        legislativeDataGroupName,
        effectiveStartDate,
        valueDefinitionName: '',
        lowValue: '0',
        highValue: '999999999',
        value1: '',
      },
    ]);
  }

  function updateRow(index: number, field: keyof CalcValueDefRow, value: string) {
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

  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-payaptic-ocean uppercase tracking-wider">
          Value Definitions
        </h2>
        <div className="flex gap-2">
          <button onClick={onFileUpload} className="btn-outline text-sm px-3 py-1.5">
            Upload File
          </button>
          <button onClick={onBulkPaste} className="btn-outline text-sm px-3 py-1.5">
            Bulk Paste
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
              <th className="px-3 py-2 font-medium text-gray-600">Value Definition Name</th>
              <th className="px-3 py-2 font-medium text-gray-600 w-32">Low Value</th>
              <th className="px-3 py-2 font-medium text-gray-600 w-32">High Value</th>
              <th className="px-3 py-2 font-medium text-gray-600 w-36">Rate / Value</th>
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
                      <span
                        className="text-amber-500 ml-1"
                        title={rowWarnings.map((w) => w.message).join('\n')}
                      >
                        !
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={row.valueDefinitionName}
                      onChange={(e) => updateRow(i, 'valueDefinitionName', e.target.value)}
                      className={`input-field w-full ${!row.valueDefinitionName ? 'border-amber-300' : ''}`}
                      placeholder="Value Definition Name"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={row.lowValue}
                      onChange={(e) => updateRow(i, 'lowValue', e.target.value)}
                      className="input-field w-full"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={row.highValue}
                      onChange={(e) => updateRow(i, 'highValue', e.target.value)}
                      className="input-field w-full"
                      placeholder="999999999"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={row.value1}
                      onChange={(e) => updateRow(i, 'value1', e.target.value)}
                      className={`input-field w-full ${!row.value1 ? 'border-amber-300' : ''}`}
                      placeholder="e.g. H_DECIMAL3"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => removeRow(i)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove row"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-gray-400">
                  No rows yet. Click &quot;+ Add Row&quot;, use &quot;Bulk Paste&quot;, or upload a file to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
