'use client';

import { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Upload } from 'lucide-react';
import {
  ElementEligibilityRow,
  CostInfoRow,
  CostAllocationRow,
  CostAllocationAccountRow,
  AllData,
} from '@/lib/element-eligibility-costing-loader/types';

interface FileUploadZoneProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: AllData) => void;
  legislativeDataGroupName: string;
  effectiveStartDate: string;
  effectiveEndDate: string;
}

function findHeaderRow(sheet: XLSX.WorkSheet, keywords: string[]): number {
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  for (let r = range.s.r; r <= Math.min(range.e.r, 20); r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })];
      if (cell && typeof cell.v === 'string') {
        const val = cell.v.toLowerCase().trim().replace(/^\* ?/, '');
        if (keywords.some((kw) => val.includes(kw))) {
          return r;
        }
      }
    }
  }
  return -1;
}

function getHeaders(sheet: XLSX.WorkSheet, headerRow: number): string[] {
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  const headers: string[] = [];
  for (let c = range.s.c; c <= range.e.c; c++) {
    const cell = sheet[XLSX.utils.encode_cell({ r: headerRow, c })];
    const raw = cell ? String(cell.v).trim().toLowerCase().replace(/^\* ?/, '') : '';
    headers.push(raw);
  }
  return headers;
}

function findCol(headers: string[], ...candidates: string[]): number {
  return headers.findIndex((h) =>
    candidates.some((c) => h === c || h.includes(c))
  );
}

function parseEligibilitySheet(
  sheet: XLSX.WorkSheet,
  ldg: string,
  startDate: string
): ElementEligibilityRow[] {
  const headerRow = findHeaderRow(sheet, ['element', 'eligibility']);
  if (headerRow < 0) return [];

  const headers = getHeaders(sheet, headerRow);
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');

  const elementCodeIdx = findCol(headers, 'element code', 'elementcode', 'element');
  const eligNameIdx = findCol(headers, 'eligibility name', 'elementeligibilityname', 'eligibility');
  const autoEntryIdx = findCol(headers, 'automatic entry', 'automaticentryflag', 'auto entry');
  const statUnitIdx = findCol(headers, 'stat unit', 'payrollstatunitcode');
  const legalEmployerIdx = findCol(headers, 'legal employer', 'legalemployercode');
  const payrollIdx = findCol(headers, 'payroll code', 'payrollcode', 'payroll');
  const bargainingIdx = findCol(headers, 'bargaining', 'bargainingunitcode');
  const peopleGroupIdx = findCol(headers, 'people group', 'peoplegroup');
  const costingLinkIdx = findCol(headers, 'costing link', 'costinglinkflag');
  const dateIdx = findCol(headers, 'effective', 'start date', 'effectivestartdate');

  if (elementCodeIdx < 0 && eligNameIdx < 0) return [];

  const rows: ElementEligibilityRow[] = [];
  for (let r = headerRow + 1; r <= range.e.r; r++) {
    const getCell = (c: number) => {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })];
      return cell ? String(cell.v).trim() : '';
    };

    const elementCode = elementCodeIdx >= 0 ? getCell(elementCodeIdx) : '';
    const eligName = eligNameIdx >= 0 ? getCell(eligNameIdx) : '';

    if (!elementCode && !eligName) continue;

    rows.push({
      legislativeDataGroupName: ldg,
      elementCode,
      elementEligibilityName: eligName || elementCode,
      effectiveStartDate: dateIdx >= 0 && getCell(dateIdx) ? getCell(dateIdx) : startDate,
      payrollStatUnitCode: statUnitIdx >= 0 ? getCell(statUnitIdx) : '',
      legalEmployerCode: legalEmployerIdx >= 0 ? getCell(legalEmployerIdx) : '',
      payrollCode: payrollIdx >= 0 ? getCell(payrollIdx) : '',
      bargainingUnitCode: bargainingIdx >= 0 ? getCell(bargainingIdx) : '',
      automaticEntryFlag: autoEntryIdx >= 0 ? (getCell(autoEntryIdx) || 'No') : 'No',
      peopleGroup: peopleGroupIdx >= 0 ? getCell(peopleGroupIdx) : '',
      costingLinkFlag: costingLinkIdx >= 0 ? getCell(costingLinkIdx) : '',
    });
  }

  return rows;
}

function parseCostingSheet(
  sheet: XLSX.WorkSheet,
  ldg: string,
  startDate: string,
  endDate: string
): {
  costInfoRows: CostInfoRow[];
  costAllocationRows: CostAllocationRow[];
  costAllocationAccountRows: CostAllocationAccountRow[];
} {
  const headerRow = findHeaderRow(sheet, [
    'cost account', 'offset', 'source type', 'costable',
    'element code', 'element', 'eligibility',
  ]);
  if (headerRow < 0) {
    return { costInfoRows: [], costAllocationRows: [], costAllocationAccountRows: [] };
  }

  const headers = getHeaders(sheet, headerRow);
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');

  const elementCodeIdx = findCol(headers, 'element code', 'elementcode', 'element');
  const eligNameIdx = findCol(headers, 'eligibility name', 'elementeligibilityname', 'eligibility');
  const sourceTypeIdx = findCol(headers, 'source type', 'sourcetype');
  const costAccountIdx = findCol(headers, 'cost account', 'account');
  const costCenterIdx = findCol(headers, 'cost center', 'cost centre', 'costcenter');
  const jobIdx = findCol(headers, 'job');
  const offsetAccountIdx = findCol(headers, 'offset account', 'offset');
  const offsetCostCenterIdx = findCol(headers, 'offset cost center', 'offset cost centre', 'offset center');
  const offsetJobIdx = findCol(headers, 'offset job');
  const linkInputIdx = findCol(headers, 'link input', 'linkinputname');

  if (elementCodeIdx < 0 && eligNameIdx < 0) {
    return { costInfoRows: [], costAllocationRows: [], costAllocationAccountRows: [] };
  }

  const costInfoRows: CostInfoRow[] = [];
  const costAllocationRows: CostAllocationRow[] = [];
  const costAllocationAccountRows: CostAllocationAccountRow[] = [];

  const seenAllocations = new Set<string>();

  for (let r = headerRow + 1; r <= range.e.r; r++) {
    const getCell = (c: number) => {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })];
      return cell ? String(cell.v).trim() : '';
    };

    const elementCode = elementCodeIdx >= 0 ? getCell(elementCodeIdx) : '';
    const eligName = eligNameIdx >= 0 ? getCell(eligNameIdx) : '';

    if (!elementCode && !eligName) continue;

    const costAccount = costAccountIdx >= 0 ? getCell(costAccountIdx) : '';
    const costCenter = costCenterIdx >= 0 ? getCell(costCenterIdx) : '';
    const job = jobIdx >= 0 ? getCell(jobIdx) : '';
    const offsetAccount = offsetAccountIdx >= 0 ? getCell(offsetAccountIdx) : '';
    const offsetCostCenter = offsetCostCenterIdx >= 0 ? getCell(offsetCostCenterIdx) : '';
    const offsetJob = offsetJobIdx >= 0 ? getCell(offsetJobIdx) : '';
    const linkInput = linkInputIdx >= 0 ? getCell(linkInputIdx) : '';
    const sourceType = sourceTypeIdx >= 0 ? (getCell(sourceTypeIdx) || 'EL') : 'EL';

    // CostInfoV3: EL row
    costInfoRows.push({
      costableType: 'C',
      distributionSetName: '',
      costedFlag: 'Y',
      effectiveEndDate: endDate,
      effectiveStartDate: startDate,
      sourceType: 'EL',
      transferToGlFlag: 'Y',
      legislativeDataGroupName: ldg,
      elementCode,
      elementEligibilityName: eligName,
      linkInputName: '',
    });

    // CostInfoV3: LIV row
    if (linkInput || eligName.includes('Canadian Calculation')) {
      costInfoRows.push({
        costableType: 'C',
        distributionSetName: '',
        costedFlag: 'Y',
        effectiveEndDate: endDate,
        effectiveStartDate: startDate,
        sourceType: 'LIV',
        transferToGlFlag: 'Y',
        legislativeDataGroupName: ldg,
        elementCode,
        elementEligibilityName: eligName,
        linkInputName: linkInput || (eligName.includes('Canadian Calculation') ? 'Hours' : 'Pay Value'),
      });
    } else if (eligName.includes('Results')) {
      costInfoRows.push({
        costableType: 'C',
        distributionSetName: '',
        costedFlag: 'Y',
        effectiveEndDate: endDate,
        effectiveStartDate: startDate,
        sourceType: 'LIV',
        transferToGlFlag: 'Y',
        legislativeDataGroupName: ldg,
        elementCode,
        elementEligibilityName: eligName,
        linkInputName: linkInput || 'Pay Value',
      });
    }

    // CostAllocationV3: one per unique eligibility
    const allocKey = `${elementCode}|${eligName}`;
    if (!seenAllocations.has(allocKey)) {
      seenAllocations.add(allocKey);
      costAllocationRows.push({
        effectiveEndDate: endDate,
        effectiveStartDate: startDate,
        sourceType: sourceType || 'EL',
        elementCode,
        elementEligibilityName: eligName,
        legislativeDataGroupName: ldg,
      });
    }

    // CostAllocationAccountV3: COST row
    if (costAccount || costCenter || job) {
      costAllocationAccountRows.push({
        sourceType: sourceType || 'EL',
        segment1: '',
        segment2: costCenter,
        segment3: job,
        segment4: costAccount,
        segment5: '',
        segment6: '',
        sourceSubType: 'COST',
        legislativeDataGroupName: ldg,
        elementCode,
        elementEligibilityName: eligName,
        effectiveDate: startDate,
        proportion: '1',
        subTypeSequence: '1',
      });
    }

    // CostAllocationAccountV3: BAL row
    if (offsetAccount || offsetCostCenter || offsetJob) {
      costAllocationAccountRows.push({
        sourceType: sourceType || 'EL',
        segment1: '',
        segment2: offsetCostCenter || '00',
        segment3: offsetJob || '00',
        segment4: offsetAccount,
        segment5: '',
        segment6: '',
        sourceSubType: 'BAL',
        legislativeDataGroupName: ldg,
        elementCode,
        elementEligibilityName: eligName,
        effectiveDate: startDate,
        proportion: '1',
        subTypeSequence: '1',
      });
    }
  }

  return { costInfoRows, costAllocationRows, costAllocationAccountRows };
}

export default function FileUploadZone({
  isOpen,
  onClose,
  onImport,
  legislativeDataGroupName,
  effectiveStartDate,
  effectiveEndDate,
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

          let eligibilityRows: ElementEligibilityRow[] = [];
          let costInfoRows: CostInfoRow[] = [];
          let costAllocationRows: CostAllocationRow[] = [];
          let costAllocationAccountRows: CostAllocationAccountRow[] = [];

          // Try to find eligibility sheet (tab 28.01 pattern)
          for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];
            const lower = sheetName.toLowerCase();

            if (
              lower.includes('28.01') ||
              lower.includes('eligibility') ||
              lower.includes('element elig')
            ) {
              eligibilityRows = parseEligibilitySheet(
                sheet,
                legislativeDataGroupName,
                effectiveStartDate
              );
            } else if (
              lower.includes('28.03') ||
              lower.includes('costing') ||
              lower.includes('cost')
            ) {
              const costing = parseCostingSheet(
                sheet,
                legislativeDataGroupName,
                effectiveStartDate,
                effectiveEndDate
              );
              costInfoRows = costing.costInfoRows;
              costAllocationRows = costing.costAllocationRows;
              costAllocationAccountRows = costing.costAllocationAccountRows;
            }
          }

          // If no specific sheets found, try to parse all sheets
          if (eligibilityRows.length === 0 && costInfoRows.length === 0) {
            for (const sheetName of workbook.SheetNames) {
              const sheet = workbook.Sheets[sheetName];

              if (eligibilityRows.length === 0) {
                const parsed = parseEligibilitySheet(
                  sheet,
                  legislativeDataGroupName,
                  effectiveStartDate
                );
                if (parsed.length > 0) {
                  eligibilityRows = parsed;
                  continue;
                }
              }

              if (costInfoRows.length === 0) {
                const costing = parseCostingSheet(
                  sheet,
                  legislativeDataGroupName,
                  effectiveStartDate,
                  effectiveEndDate
                );
                if (costing.costInfoRows.length > 0) {
                  costInfoRows = costing.costInfoRows;
                  costAllocationRows = costing.costAllocationRows;
                  costAllocationAccountRows = costing.costAllocationAccountRows;
                }
              }
            }
          }

          const totalRows =
            eligibilityRows.length +
            costInfoRows.length +
            costAllocationRows.length +
            costAllocationAccountRows.length;

          if (totalRows === 0) {
            setError(
              'No data rows found. Ensure the file has sheets matching MC050 tabs 28.01 (eligibility) and/or 28.03 (costing) layouts.'
            );
            return;
          }

          onImport({
            eligibilityRows,
            costInfoRows,
            costAllocationRows,
            costAllocationAccountRows,
          });
          onClose();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to parse file.');
        }
      };

      reader.readAsArrayBuffer(file);
    },
    [legislativeDataGroupName, effectiveStartDate, effectiveEndDate, onImport, onClose]
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
            Accepts .xlsx files
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>

        <p className="text-xs text-gray-500 mt-3">
          The file should contain sheets matching MC050 tabs 28.01 (Element Eligibility) and 28.03
          (Costing). Sheets are identified by name or header content. Status columns (Pilot, Ready,
          Dev4, SIT, UAT, PROD) are skipped automatically.
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
