'use client';

import { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Upload } from 'lucide-react';
import { CalcValueDefRow } from '@/lib/calc-value-def-loader/types';
import { toOracleDate } from '@/lib/hdl-common/date-utils';

interface FileUploadZoneProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (rows: CalcValueDefRow[]) => void;
  legislativeDataGroupName: string;
  effectiveStartDate: string;
}

function findHeaderRow(sheet: XLSX.WorkSheet): number {
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })];
      if (cell && typeof cell.v === 'string') {
        const val = cell.v.toLowerCase().trim();
        if (
          val === 'calculation value definition' ||
          val === 'value definition name' ||
          val === 'valuedefinitionname'
        ) {
          return r;
        }
      }
    }
  }
  return -1;
}

function parseSheet(
  sheet: XLSX.WorkSheet,
  legislativeDataGroupName: string,
  effectiveStartDate: string
): CalcValueDefRow[] {
  const headerRowIndex = findHeaderRow(sheet);
  if (headerRowIndex < 0) {
    throw new Error(
      'Could not find header row. Looking for "Calculation Value Definition" or "Value Definition Name" in any cell.'
    );
  }

  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  const headers: string[] = [];
  for (let c = range.s.c; c <= range.e.c; c++) {
    const cell = sheet[XLSX.utils.encode_cell({ r: headerRowIndex, c })];
    headers.push(cell ? String(cell.v).trim().toLowerCase() : '');
  }

  // Skip status columns
  const statusColumns = new Set(['pilot', 'ready', 'dev4', 'sit', 'uat', 'prod', 'status']);

  // Find column indices — map from MC050 tab 30.01 layout
  const ldgIdx = headers.findIndex(
    (h) => h === 'ldg' || h === 'legislativedatagroupname' || h === 'legislative data group'
  );
  const dateIdx = headers.findIndex(
    (h) =>
      h === 'effective date' ||
      h === 'effectivestartdate' ||
      h === 'effective start date' ||
      h === '*effective date'
  );
  const defNameIdx = headers.findIndex(
    (h) =>
      (h === 'calculation value definition' ||
        h === 'value definition name' ||
        h === 'valuedefinitionname') &&
      !statusColumns.has(h)
  );
  const fromIdx = headers.findIndex(
    (h) => h === 'from value' || h === 'from' || h === 'lowvalue' || h === 'low value'
  );
  const toIdx = headers.findIndex(
    (h) => h === 'to value' || h === 'to' || h === 'highvalue' || h === 'high value'
  );
  const rateIdx = headers.findIndex(
    (h) => h === 'rate' || h === 'value1' || h === 'value'
  );

  if (defNameIdx < 0) {
    throw new Error(
      'Could not find required column "Calculation Value Definition" or "Value Definition Name" in the header row.'
    );
  }

  const rows: CalcValueDefRow[] = [];
  for (let r = headerRowIndex + 1; r <= range.e.r; r++) {
    const getCell = (c: number) => {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })];
      return cell ? String(cell.v).trim() : '';
    };

    const valueDefinitionName = getCell(defNameIdx);

    // Skip empty rows
    if (!valueDefinitionName) continue;

    const rowLdg = ldgIdx >= 0 ? getCell(ldgIdx) : '';
    const rowDate = dateIdx >= 0 ? getCell(dateIdx) : '';
    const lowValue = fromIdx >= 0 ? getCell(fromIdx) : '0';
    const highValue = toIdx >= 0 ? getCell(toIdx) : '999999999';
    const value1 = rateIdx >= 0 ? getCell(rateIdx) : '';

    rows.push({
      legislativeDataGroupName: rowLdg || legislativeDataGroupName,
      effectiveStartDate: rowDate ? toOracleDate(rowDate) : effectiveStartDate,
      valueDefinitionName,
      lowValue: lowValue || '0',
      highValue: highValue || '999999999',
      value1,
    });
  }

  return rows;
}

export default function FileUploadZone({
  isOpen,
  onClose,
  onImport,
  legislativeDataGroupName,
  effectiveStartDate,
}: FileUploadZoneProps) {
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError('');
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });

          // Use the first sheet
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const rows = parseSheet(sheet, legislativeDataGroupName, effectiveStartDate);

          if (rows.length === 0) {
            setError('No data rows found in the file.');
            return;
          }

          onImport(rows);
          onClose();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to parse file.');
        }
      };

      reader.readAsArrayBuffer(file);
    },
    [legislativeDataGroupName, effectiveStartDate, onImport, onClose]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="card w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-payaptic-navy">Upload File</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-payaptic-emerald bg-payaptic-lime/20'
              : 'border-gray-300 hover:border-payaptic-ocean hover:bg-gray-50'
          }`}
        >
          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-3" />
          <p className="text-sm font-medium text-gray-700">
            Drag &amp; drop your file here, or click to browse
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Accepts .xlsx and .csv files
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>

        <p className="text-xs text-gray-500 mt-3">
          The file should contain columns for &quot;Calculation Value Definition&quot; (or &quot;Value Definition Name&quot;), &quot;From Value&quot;, &quot;To Value&quot;, and &quot;Rate&quot;. Status columns (Pilot/Ready/Dev4/SIT/UAT/PROD) will be skipped automatically.
        </p>

        {error && (
          <div className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="btn-outline text-sm">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
