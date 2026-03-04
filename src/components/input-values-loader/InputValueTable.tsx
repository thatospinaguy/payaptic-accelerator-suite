'use client';

import { InputValueRow, Warning } from '@/lib/input-values-loader/types';

interface InputValueTableProps {
  rows: InputValueRow[];
  setRows: (rows: InputValueRow[]) => void;
  legislativeDataGroupName: string;
  effectiveStartDate: string;
  warnings: Warning[];
  onBulkPaste: () => void;
  onFileUpload: () => void;
}

const EMPTY_ROW: Omit<InputValueRow, 'legislativeDataGroupName' | 'effectiveStartDate'> = {
  elementCode: '',
  inputValueCode: '',
  name: '',
  displaySequence: '',
  specialPurpose: '',
  uom: '',
  displayFlag: 'Y',
  allowUserEntryFlag: 'Y',
  valueRequiredFlag: 'N',
  createDatabaseItemFlag: 'N',
  defaultValue: '',
  applyDefaultAtRuntimeFlag: 'N',
  lookupType: '',
  referenceCode: '',
  minimumValue: '',
  maximumValue: '',
  valueSet: '',
  validationFormulaCode: '',
  validationSource: '',
  warningOrError: '',
  rateFormulaCode: '',
};

const YN_OPTIONS = ['Y', 'N', 'Yes', 'No'];

export default function InputValueTable({
  rows,
  setRows,
  legislativeDataGroupName,
  effectiveStartDate,
  warnings,
  onBulkPaste,
  onFileUpload,
}: InputValueTableProps) {
  function addRow() {
    setRows([
      ...rows,
      {
        ...EMPTY_ROW,
        legislativeDataGroupName,
        effectiveStartDate,
      },
    ]);
  }

  function updateRow(index: number, field: keyof InputValueRow, value: string) {
    const updated = rows.map((row, i) => {
      if (i !== index) return row;
      // When inputValueCode changes, also set name to same value
      if (field === 'inputValueCode') {
        return { ...row, inputValueCode: value, name: value };
      }
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

  const columns: { key: keyof InputValueRow; label: string; width: string; type: 'text' | 'select'; placeholder?: string }[] = [
    { key: 'elementCode', label: 'Element Code', width: 'min-w-[220px]', type: 'text', placeholder: 'e.g. TL Call back pay 1_0 Result' },
    { key: 'inputValueCode', label: 'Input Value Code', width: 'min-w-[180px]', type: 'text', placeholder: 'e.g. CRR Costing Default' },
    { key: 'displaySequence', label: 'Display Seq', width: 'min-w-[100px]', type: 'text', placeholder: 'e.g. 90' },
    { key: 'specialPurpose', label: 'Special Purpose', width: 'min-w-[130px]', type: 'text' },
    { key: 'uom', label: 'UOM', width: 'min-w-[120px]', type: 'text', placeholder: 'e.g. Character' },
    { key: 'displayFlag', label: 'Displayed', width: 'min-w-[90px]', type: 'select' },
    { key: 'allowUserEntryFlag', label: 'Allow Entry', width: 'min-w-[90px]', type: 'select' },
    { key: 'valueRequiredFlag', label: 'Required', width: 'min-w-[90px]', type: 'select' },
    { key: 'createDatabaseItemFlag', label: 'Create DB Item', width: 'min-w-[100px]', type: 'select' },
    { key: 'defaultValue', label: 'Default', width: 'min-w-[100px]', type: 'text', placeholder: 'e.g. 00' },
    { key: 'applyDefaultAtRuntimeFlag', label: 'Runtime Default', width: 'min-w-[100px]', type: 'select' },
    { key: 'lookupType', label: 'Lookup Type', width: 'min-w-[130px]', type: 'text' },
    { key: 'referenceCode', label: 'Reference', width: 'min-w-[180px]', type: 'text' },
    { key: 'minimumValue', label: 'Minimum', width: 'min-w-[100px]', type: 'text' },
    { key: 'maximumValue', label: 'Maximum', width: 'min-w-[100px]', type: 'text' },
    { key: 'valueSet', label: 'Value Set', width: 'min-w-[120px]', type: 'text' },
    { key: 'validationFormulaCode', label: 'Validation Formula', width: 'min-w-[150px]', type: 'text' },
    { key: 'validationSource', label: 'Validation Source', width: 'min-w-[130px]', type: 'text' },
    { key: 'warningOrError', label: 'Warning/Error', width: 'min-w-[120px]', type: 'text' },
    { key: 'rateFormulaCode', label: 'Rate Formula', width: 'min-w-[130px]', type: 'text' },
  ];

  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-payaptic-ocean uppercase tracking-wider">
          Input Values
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
        <table className="w-full text-sm" style={{ minWidth: '2400px' }}>
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
                          {YN_OPTIONS.map((opt) => (
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
                            (col.key === 'inputValueCode' && !row.inputValueCode) ||
                            (col.key === 'uom' && !row.uom)
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
