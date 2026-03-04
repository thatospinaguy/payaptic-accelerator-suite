'use client';

import { ElementEligibilityRow, Warning } from '@/lib/element-eligibility-costing-loader/types';

interface EligibilityTableProps {
  rows: ElementEligibilityRow[];
  setRows: (rows: ElementEligibilityRow[]) => void;
  legislativeDataGroupName: string;
  effectiveStartDate: string;
  warnings: Warning[];
}

const EMPTY_ELIGIBILITY_ROW: Omit<ElementEligibilityRow, 'legislativeDataGroupName' | 'effectiveStartDate'> = {
  elementCode: '',
  elementEligibilityName: '',
  payrollStatUnitCode: '',
  legalEmployerCode: '',
  payrollCode: '',
  bargainingUnitCode: '',
  automaticEntryFlag: 'No',
  peopleGroup: '',
  costingLinkFlag: '',
};

const AUTOMATIC_ENTRY_OPTIONS = ['Yes', 'No'];

export default function EligibilityTable({
  rows,
  setRows,
  legislativeDataGroupName,
  effectiveStartDate,
  warnings,
}: EligibilityTableProps) {
  function addRow() {
    setRows([
      ...rows,
      {
        ...EMPTY_ELIGIBILITY_ROW,
        legislativeDataGroupName,
        effectiveStartDate,
      },
    ]);
  }

  function updateRow(index: number, field: keyof ElementEligibilityRow, value: string) {
    const updated = rows.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );
    setRows(updated);
  }

  function removeRow(index: number) {
    setRows(rows.filter((_, i) => i !== index));
  }

  // Only show eligibility-specific warnings (rowIndex matches and relevant IDs)
  const eligibilityWarningIds = new Set(['MISSING_ELEMENT_CODE', 'MISSING_ELIGIBILITY_NAME']);
  function getRowWarnings(index: number): Warning[] {
    return warnings.filter(
      (w) => w.rowIndex === index && eligibilityWarningIds.has(w.id)
    );
  }

  const columns: {
    key: keyof ElementEligibilityRow;
    label: string;
    width: string;
    type: 'text' | 'select';
    placeholder?: string;
  }[] = [
    { key: 'elementCode', label: 'Element Code', width: 'min-w-[280px]', type: 'text', placeholder: 'e.g. TL Call back pay 1_0 Canadian Calculation' },
    { key: 'elementEligibilityName', label: 'Eligibility Name', width: 'min-w-[320px]', type: 'text', placeholder: 'e.g. TL Call back pay 1_0 Canadian Calculation-Hours Cost' },
    { key: 'payrollStatUnitCode', label: 'Stat Unit', width: 'min-w-[100px]', type: 'text' },
    { key: 'legalEmployerCode', label: 'Legal Employer', width: 'min-w-[120px]', type: 'text' },
    { key: 'payrollCode', label: 'Payroll', width: 'min-w-[100px]', type: 'text' },
    { key: 'bargainingUnitCode', label: 'Bargaining Unit', width: 'min-w-[120px]', type: 'text' },
    { key: 'automaticEntryFlag', label: 'Auto Entry', width: 'min-w-[90px]', type: 'select' },
    { key: 'peopleGroup', label: 'People Group', width: 'min-w-[120px]', type: 'text' },
    { key: 'costingLinkFlag', label: 'Costing Link', width: 'min-w-[100px]', type: 'text' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">
          Element Eligibility ({rows.length} row{rows.length !== 1 ? 's' : ''})
        </h3>
        <button onClick={addRow} className="btn-primary text-sm px-3 py-1.5">
          + Add Row
        </button>
      </div>
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm" style={{ minWidth: '1800px' }}>
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-3 py-2 font-medium text-gray-600 w-10 sticky left-0 bg-gray-50 z-10">#</th>
              {columns.map((col) => (
                <th key={col.key} className={`px-3 py-2 font-medium text-gray-600 ${col.width}`}>
                  {col.label}
                </th>
              ))}
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
                  <td className="px-3 py-2 text-gray-400 font-mono text-xs sticky left-0 bg-inherit z-10">
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
                  {columns.map((col) => (
                    <td key={col.key} className="px-3 py-2">
                      {col.type === 'select' ? (
                        <select
                          value={row[col.key]}
                          onChange={(e) => updateRow(i, col.key, e.target.value)}
                          className="input-field w-full"
                        >
                          {AUTOMATIC_ENTRY_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={row[col.key]}
                          onChange={(e) => updateRow(i, col.key, e.target.value)}
                          className={`input-field w-full ${
                            (col.key === 'elementCode' && !row.elementCode) ||
                            (col.key === 'elementEligibilityName' && !row.elementEligibilityName)
                              ? 'border-amber-300'
                              : ''
                          }`}
                          placeholder={col.placeholder || ''}
                        />
                      )}
                    </td>
                  ))}
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
                <td colSpan={columns.length + 2} className="px-3 py-8 text-center text-gray-400">
                  No eligibility rows yet. Click &quot;+ Add Row&quot; or upload a file to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
