'use client';

import { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Upload } from 'lucide-react';
import { BalanceReportingNameRow } from '@/lib/balance-reporting-names-loader/types';
import { LANGUAGE_MAP } from '@/lib/hdl-common/constants';

interface FileUploadZoneProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (rows: BalanceReportingNameRow[]) => void;
  legislativeDataGroupName: string;
}

function resolveLanguage(raw: unknown): string {
  if (!raw) return '';
  const str = String(raw).trim();
  return LANGUAGE_MAP[str] || str;
}

function findHeaderRow(sheet: XLSX.WorkSheet): number {
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })];
      if (cell && typeof cell.v === 'string') {
        const val = cell.v.toLowerCase().trim();
        if (val === 'balance name' || val === 'balance code' || val === 'reporting name') {
          return r;
        }
      }
    }
  }
  return -1;
}

function parseSheet(
  sheet: XLSX.WorkSheet,
  legislativeDataGroupName: string
): BalanceReportingNameRow[] {
  const headerRowIndex = findHeaderRow(sheet);
  if (headerRowIndex < 0) {
    throw new Error(
      'Could not find header row. Looking for "Balance Name", "Balance Code", or "Reporting Name" in any cell.'
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

  const languageIdx = headers.findIndex(
    (h) => (h === 'language' || h === '* language') && !statusColumns.has(h)
  );
  const balanceCodeIdx = headers.findIndex(
    (h) => h === 'balance code' && !statusColumns.has(h)
  );
  const balanceNameIdx = headers.findIndex(
    (h) => h === 'balance name' && !statusColumns.has(h)
  );
  const descriptionIdx = headers.findIndex(
    (h) => h === 'description' && !statusColumns.has(h)
  );
  const reportingNameIdx = headers.findIndex(
    (h) => h === 'reporting name' && !statusColumns.has(h)
  );

  if (balanceNameIdx < 0) {
    throw new Error(
      'Could not find required column "Balance Name" in the header row.'
    );
  }

  const rows: BalanceReportingNameRow[] = [];
  for (let r = headerRowIndex + 1; r <= range.e.r; r++) {
    const getCell = (c: number) => {
      if (c < 0) return '';
      const cell = sheet[XLSX.utils.encode_cell({ r, c })];
      return cell ? String(cell.v).trim() : '';
    };

    const balanceName = getCell(balanceNameIdx);
    // Skip empty rows
    if (!balanceName) continue;

    rows.push({
      legislativeDataGroupName,
      language: languageIdx >= 0 ? resolveLanguage(getCell(languageIdx)) : '',
      balanceName,
      balanceCode: getCell(balanceCodeIdx),
      reportingName: getCell(reportingNameIdx),
      description: getCell(descriptionIdx),
    });
  }

  return rows;
}

export default function FileUploadZone({
  isOpen,
  onClose,
  onImport,
  legislativeDataGroupName,
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

          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const rows = parseSheet(sheet, legislativeDataGroupName);

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
    [legislativeDataGroupName, onImport, onClose]
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
          The file should contain columns for &quot;Language&quot;, &quot;Balance Code&quot;, &quot;Balance Name&quot;, &quot;Reporting Name&quot;, and &quot;Description&quot;. Status columns (Pilot/Ready/Dev4/SIT/UAT/PROD) will be skipped automatically.
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
