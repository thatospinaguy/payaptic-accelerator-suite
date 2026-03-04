'use client';

import { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Upload } from 'lucide-react';
import { InputValueRow } from '@/lib/input-values-loader/types';
import { toOracleDate } from '@/lib/hdl-common/date-utils';

interface FileUploadZoneProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (rows: InputValueRow[]) => void;
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
          val === 'element' ||
          val === '* element' ||
          val === 'elementcode' ||
          val === 'element code' ||
          val === '* input value' ||
          val === 'input value'
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
): InputValueRow[] {
  const headerRowIndex = findHeaderRow(sheet);
  if (headerRowIndex < 0) {
    throw new Error(
      'Could not find header row. Looking for "Element" or "Input Value" in any cell.'
    );
  }

  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  const headers: string[] = [];
  for (let c = range.s.c; c <= range.e.c; c++) {
    const cell = sheet[XLSX.utils.encode_cell({ r: headerRowIndex, c })];
    headers.push(cell ? String(cell.v).trim().toLowerCase().replace(/^\* ?/, '') : '');
  }

  // Find column indices — map from MC050 tab 22.01 layout
  const ldgIdx = headers.findIndex(
    (h) => h === 'ldg' || h === 'legislative data group' || h === 'legislativedatagroupname'
  );
  const elementIdx = headers.findIndex(
    (h) => h === 'element' || h === 'element code' || h === 'elementcode'
  );
  const inputValueIdx = headers.findIndex(
    (h) => h === 'input value' || h === 'input value code' || h === 'inputvaluecode'
  );
  const dispSeqIdx = headers.findIndex(
    (h) => h === 'display sequence' || h === 'displaysequence'
  );
  const specialPurposeIdx = headers.findIndex(
    (h) => h === 'special purpose' || h === 'specialpurpose'
  );
  const uomIdx = headers.findIndex(
    (h) => h === 'unit of measure' || h === 'uom' || h === 'unit'
  );
  const dateIdx = headers.findIndex(
    (h) => h === 'effective as of date' || h === 'effective date' || h === 'effectivestartdate' || h === 'effective start date'
  );
  const displayFlagIdx = headers.findIndex(
    (h) => h === 'displayed' || h === 'displayflag' || h === 'display flag'
  );
  const allowEntryIdx = headers.findIndex(
    (h) => h === 'allow user entry' || h === 'allowuserentryflag'
  );
  const requiredIdx = headers.findIndex(
    (h) => h === 'required' || h === 'valuerequiredflag' || h === 'value required'
  );
  const createDbIdx = headers.findIndex(
    (h) => h === 'create a database item' || h === 'create database item' || h === 'createdatabaseitemflag'
  );
  const defaultIdx = headers.findIndex(
    (h) => h === 'default' || h === 'defaultvalue' || h === 'default value'
  );
  const runtimeIdx = headers.findIndex(
    (h) => h === 'apply default at run time' || h === 'apply default at runtime' || h === 'applydefaultatruntimeflag'
  );
  const lookupIdx = headers.findIndex(
    (h) => h === 'lookup type' || h === 'lookuptype'
  );
  const referenceIdx = headers.findIndex(
    (h) => h === 'reference' || h === 'referencecode' || h === 'reference code'
  );
  const minIdx = headers.findIndex(
    (h) => h === 'minimum' || h === 'minimumvalue' || h === 'min'
  );
  const maxIdx = headers.findIndex(
    (h) => h === 'maximum' || h === 'maximumvalue' || h === 'max'
  );
  const valFormulaIdx = headers.findIndex(
    (h) => h === 'validation formula' || h === 'validationformulacode'
  );
  const valSourceIdx = headers.findIndex(
    (h) => h === 'validation source' || h === 'validationsource'
  );

  if (elementIdx < 0 && inputValueIdx < 0) {
    throw new Error(
      'Could not find required column "Element" or "Input Value" in the header row.'
    );
  }

  const rows: InputValueRow[] = [];
  for (let r = headerRowIndex + 1; r <= range.e.r; r++) {
    const getCell = (c: number) => {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })];
      return cell ? String(cell.v).trim() : '';
    };

    const elementCode = elementIdx >= 0 ? getCell(elementIdx) : '';
    const inputValueCode = inputValueIdx >= 0 ? getCell(inputValueIdx) : '';

    // Skip empty rows
    if (!elementCode && !inputValueCode) continue;

    const rowLdg = ldgIdx >= 0 ? getCell(ldgIdx) : '';
    const rowDate = dateIdx >= 0 ? getCell(dateIdx) : '';

    rows.push({
      legislativeDataGroupName: rowLdg || legislativeDataGroupName,
      elementCode,
      inputValueCode,
      name: inputValueCode,
      displaySequence: dispSeqIdx >= 0 ? getCell(dispSeqIdx) : '',
      specialPurpose: specialPurposeIdx >= 0 ? getCell(specialPurposeIdx) : '',
      uom: uomIdx >= 0 ? getCell(uomIdx) : '',
      effectiveStartDate: rowDate ? toOracleDate(rowDate) : effectiveStartDate,
      displayFlag: displayFlagIdx >= 0 ? getCell(displayFlagIdx) || 'Y' : 'Y',
      allowUserEntryFlag: allowEntryIdx >= 0 ? getCell(allowEntryIdx) || 'Y' : 'Y',
      valueRequiredFlag: requiredIdx >= 0 ? getCell(requiredIdx) || 'N' : 'N',
      createDatabaseItemFlag: createDbIdx >= 0 ? getCell(createDbIdx) || 'N' : 'N',
      defaultValue: defaultIdx >= 0 ? getCell(defaultIdx) : '',
      applyDefaultAtRuntimeFlag: runtimeIdx >= 0 ? getCell(runtimeIdx) || 'N' : 'N',
      lookupType: lookupIdx >= 0 ? getCell(lookupIdx) : '',
      referenceCode: referenceIdx >= 0 ? getCell(referenceIdx) : '',
      minimumValue: minIdx >= 0 ? getCell(minIdx) : '',
      maximumValue: maxIdx >= 0 ? getCell(maxIdx) : '',
      valueSet: '',
      validationFormulaCode: valFormulaIdx >= 0 ? getCell(valFormulaIdx) : '',
      validationSource: valSourceIdx >= 0 ? getCell(valSourceIdx) : '',
      warningOrError: '',
      rateFormulaCode: '',
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
          The file should contain columns matching the MC050 22.01 tab layout: Element, Input Value, Display Sequence, UOM, Displayed, Allow User Entry, Required, Create Database Item, Default, Apply Default at Runtime, etc. Status columns will be skipped automatically.
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
