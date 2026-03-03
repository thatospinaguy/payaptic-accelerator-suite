'use client';

import { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Upload } from 'lucide-react';
import { ElementGroupRow } from '@/lib/element-group-loader/types';

interface FileUploadZoneProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (rows: ElementGroupRow[]) => void;
  legislativeDataGroupName: string;
}

function findHeaderRow(sheet: XLSX.WorkSheet): number {
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })];
      if (cell && typeof cell.v === 'string') {
        const val = cell.v.toLowerCase().trim();
        if (val === 'element group name' || val === 'objectgroupcode') {
          return r;
        }
      }
    }
  }
  return -1;
}

function parseInclusionStatus(raw: unknown): 'Include' | 'Exclude' {
  if (!raw) return 'Include';
  const str = String(raw).trim().toLowerCase();
  if (str === 'exclude') return 'Exclude';
  return 'Include';
}

function parseSheet(
  sheet: XLSX.WorkSheet,
  legislativeDataGroupName: string
): ElementGroupRow[] {
  const headerRowIndex = findHeaderRow(sheet);
  if (headerRowIndex < 0) {
    throw new Error(
      'Could not find header row. Looking for "Element Group Name" or "Element Name" in any cell.'
    );
  }

  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  const headers: string[] = [];
  for (let c = range.s.c; c <= range.e.c; c++) {
    const cell = sheet[XLSX.utils.encode_cell({ r: headerRowIndex, c })];
    headers.push(cell ? String(cell.v).trim().toLowerCase() : '');
  }

  // Find column indices — skip status columns (Pilot/Ready/Dev4/SIT/UAT/PROD)
  const statusColumns = new Set(['pilot', 'ready', 'dev4', 'sit', 'uat', 'prod', 'status']);
  const groupNameIdx = headers.findIndex(
    (h) => h === 'element group name' || h === 'objectgroupcode'
  );
  const elementNameIdx = headers.findIndex(
    (h) => h === 'element name' || h === 'objectcode'
  );
  const inclusionIdx = headers.findIndex(
    (h) =>
      (h === 'inclusion status' || h === 'includeorexclude' || h === 'include or exclude') &&
      !statusColumns.has(h)
  );

  if (groupNameIdx < 0 || elementNameIdx < 0) {
    throw new Error(
      'Could not find required columns "Element Group Name" and "Element Name" in the header row.'
    );
  }

  const rows: ElementGroupRow[] = [];
  for (let r = headerRowIndex + 1; r <= range.e.r; r++) {
    const getCell = (c: number) => {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })];
      return cell ? String(cell.v).trim() : '';
    };

    const elementGroupName = getCell(groupNameIdx);
    const elementName = getCell(elementNameIdx);

    // Skip empty rows
    if (!elementGroupName && !elementName) continue;

    const inclusionRaw = inclusionIdx >= 0 ? getCell(inclusionIdx) : '';

    rows.push({
      legislativeDataGroupName,
      elementGroupName,
      elementName,
      includeOrExclude: parseInclusionStatus(inclusionRaw),
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

          // Use the first sheet
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
          The file should contain columns for &quot;Element Group Name&quot;, &quot;Element Name&quot;, and optionally &quot;Inclusion Status&quot;. Status columns (Pilot/Ready/Dev4/SIT/UAT/PROD) will be skipped automatically.
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
