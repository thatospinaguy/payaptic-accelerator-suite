'use client';

import { ElementReportingNameRow, Warning, ElementCodeLookup } from '@/lib/element-reporting-names-loader/types';
import { LANGUAGE_MAP } from '@/lib/hdl-common/constants';

interface ElementReportingTableProps {
  rows: ElementReportingNameRow[];
  setRows: (rows: ElementReportingNameRow[]) => void;
  legislativeDataGroupName: string;
  warnings: Warning[];
  onBulkPaste: () => void;
  onFileUpload: () => void;
  elementCodeLookup: ElementCodeLookup;
}

const LANGUAGE_OPTIONS = [
  { label: 'American English (US)', value: 'US' },
  { label: 'Canadian French (FRC)', value: 'FRC' },
];

export default function ElementReportingTable({
  rows,
  setRows,
  legislativeDataGroupName,
  warnings,
  onBulkPaste,
  onFileUpload,
  elementCodeLookup,
}: ElementReportingTableProps) {
  function addRow() {
    setRows([
      ...rows,
      {
        legislativeDataGroupName,
        language: 'US',
        elementCode: '',
        elementName: '',
        reportingName: '',
        description: '',
      },
    ]);
  }

  function updateRow(index: number, field: keyof ElementReportingNameRow, value: string) {
    const updated = rows.map((row, i) => {
      if (i !== index) return row;

      const updatedRow = { ...row, [field]: value };

      // Auto-fill element code when element name changes and lookup is available
      if (field === 'elementName' && elementCodeLookup.size > 0) {
        const code = elementCodeLookup.get(value);
        if (code) {
          updatedRow.elementCode = code;
        }
      }

      // Resolve language to Oracle code
      if (field === 'language') {
        const resolved = LANGUAGE_MAP[value];
        if (resolved) {
          updatedRow.language = resolved;
        }
      }

      return updatedRow;
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
          Element Reporting Names
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
              <th className="px-3 py-2 font-medium text-gray-600 w-48">Language</th>
              <th className="px-3 py-2 font-medium text-gray-600">Element Code</th>
              <th className="px-3 py-2 font-medium text-gray-600">Element Name</th>
              <th className="px-3 py-2 font-medium text-gray-600">Reporting Name</th>
              <th className="px-3 py-2 font-medium text-gray-600">Description</th>
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
                    <select
                      value={row.language}
                      onChange={(e) => updateRow(i, 'language', e.target.value)}
                      className={`input-field w-full ${!row.language ? 'border-amber-300' : ''}`}
                    >
                      <option value="">Select language...</option>
                      {LANGUAGE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
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
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={row.elementName}
                      onChange={(e) => updateRow(i, 'elementName', e.target.value)}
                      className={`input-field w-full ${!row.elementName ? 'border-amber-300' : ''}`}
                      placeholder="Element Name"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={row.reportingName}
                      onChange={(e) => updateRow(i, 'reportingName', e.target.value)}
                      className={`input-field w-full ${!row.reportingName ? 'border-amber-300' : ''}`}
                      placeholder="Reporting Name"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={row.description}
                      onChange={(e) => updateRow(i, 'description', e.target.value)}
                      className="input-field w-full"
                      placeholder="Description"
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
                <td colSpan={7} className="px-3 py-8 text-center text-gray-400">
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
