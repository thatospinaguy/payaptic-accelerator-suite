import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import { DAT_FILENAME } from './constants';
import { BalanceFeedRow } from './types';
import { generateHdlLine } from './hdl-generator';

function timestampSuffix(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${yyyy}${mo}${dd}-${hh}${mm}${ss}`;
}

export function generateZipFilename(): string {
  return `payroll-balance-definition-${timestampSuffix()}.zip`;
}

export function generateFolderName(): string {
  return `PayrollBalanceDefinition_${timestampSuffix()}`;
}

export async function createZipBlob(datContent: string, folderName?: string): Promise<Blob> {
  const zip = new JSZip();
  if (folderName) {
    const folder = zip.folder(folderName);
    folder!.file(DAT_FILENAME, datContent);
  } else {
    zip.file(DAT_FILENAME, datContent);
  }
  return zip.generateAsync({ type: 'blob' });
}

export function createDatBlob(datContent: string): Blob {
  return new Blob([datContent], { type: 'text/plain;charset=utf-8' });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function createWorkbook(headers: string[], dataRows: string[][]): XLSX.WorkBook {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);

  // Auto-size columns based on content
  const colWidths = headers.map((h, i) => {
    const maxDataLen = dataRows.reduce((max, row) => Math.max(max, (row[i] || '').length), 0);
    return { wch: Math.max(h.length, maxDataLen) + 2 };
  });
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Balance Definitions');
  return wb;
}

function downloadWorkbook(wb: XLSX.WorkBook, filename: string): void {
  const wbOut = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbOut], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  downloadBlob(blob, filename);
}

export function downloadTemplateXlsx(): void {
  const headers = [
    'Action',
    'BalanceCode',
    'EffectiveStartDate',
    'LegislativeDataGroupName',
    'ElementCode',
    'InputValueCode',
    'AddSubtract',
  ];
  const exampleRow = [
    'MERGE',
    'XX CP HWB Program Report Hours Worked',
    '1951/01/01',
    'US Legislative Data Group',
    'XX Bereavement Pay Earnings Results',
    'Hours Calculated',
    'Add',
  ];
  const wb = createWorkbook(headers, [exampleRow]);
  downloadWorkbook(wb, 'payroll-balance-template.xlsx');
}

export function downloadExportXlsx(rows: BalanceFeedRow[]): void {
  const headers = [
    'Action',
    'BalanceFeed',
    'BalanceCode',
    'EffectiveStartDate',
    'LegislativeDataGroupName',
    'ElementCode',
    'InputValueCode',
    'AddSubtract',
    'AddSubtract (Label)',
    'HDL Definition String',
  ];

  const dataRows = rows.map((row) => {
    const hdlLine = generateHdlLine(row);
    const numericAddSubtract = row.addSubtractHuman === 'Add' ? '1' : '-1';
    return [
      row.action,
      'BalanceFeed',
      row.balanceCode,
      row.effectiveStartDate,
      row.legislativeDataGroupName,
      row.elementCode,
      row.inputValueCode,
      numericAddSubtract,
      row.addSubtractHuman,
      hdlLine,
    ];
  });

  const wb = createWorkbook(headers, dataRows);
  downloadWorkbook(wb, 'payroll-balance-export.xlsx');
}
