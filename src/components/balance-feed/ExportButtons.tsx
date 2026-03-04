'use client';

import { useState } from 'react';
import {
  createZipBlob,
  createDatBlob,
  downloadBlob,
  generateZipFilename,
  downloadExportXlsx,
} from '@/lib/balance-feed/file-export';
import { DAT_FILENAME } from '@/lib/balance-feed/constants';
import { BalanceFeedRow } from '@/lib/balance-feed/types';

interface ExportButtonsProps {
  rows: BalanceFeedRow[];
  datContent: string;
}

export default function ExportButtons({
  rows,
  datContent,
}: ExportButtonsProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [zipFilename, setZipFilename] = useState(() => generateZipFilename());

  const mergeCount = rows.filter((r) => r.action === 'MERGE').length;
  const deleteCount = rows.filter((r) => r.action === 'DELETE').length;

  async function handleCopy() {
    await navigator.clipboard.writeText(datContent);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  }

  function handleDownloadDat() {
    const blob = createDatBlob(datContent);
    downloadBlob(blob, DAT_FILENAME);
  }

  async function handleDownloadZip() {
    // FIX-01: .dat file at root of zip, no subfolder
    const blob = await createZipBlob(datContent);
    downloadBlob(blob, zipFilename);
  }

  function handleDownloadExcel() {
    downloadExportXlsx(rows);
  }

  return (
    <div className="card p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
        <h2 className="text-sm font-semibold text-payaptic-ocean uppercase tracking-wider">
          Export
        </h2>
        <div className="text-sm text-gray-500">
          {rows.length} row{rows.length !== 1 ? 's' : ''}
          {mergeCount > 0 && (
            <span className="ml-2 text-payaptic-ocean">{mergeCount} MERGE</span>
          )}
          {deleteCount > 0 && (
            <span className="ml-2 text-red-500">{deleteCount} DELETE</span>
          )}
        </div>
      </div>

      {/* FIX-08: Show zip/dat file names ABOVE the download buttons */}
      <div className="mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Zip filename
          </label>
          <input
            type="text"
            value={zipFilename}
            onChange={(e) => setZipFilename(e.target.value)}
            className="input-field w-full text-xs font-mono"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          The .dat file inside is always named &quot;{DAT_FILENAME}&quot;
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleCopy}
          disabled={rows.length === 0}
          className="btn-outline text-sm"
        >
          {copySuccess ? 'Copied!' : 'Copy All Lines'}
        </button>
        <button
          onClick={handleDownloadDat}
          disabled={rows.length === 0}
          className="btn-secondary text-sm"
        >
          Download .dat
        </button>
        <button
          onClick={handleDownloadZip}
          disabled={rows.length === 0}
          className="btn-primary text-sm"
        >
          Download .zip
        </button>
        <button
          onClick={handleDownloadExcel}
          disabled={rows.length === 0}
          className="btn-outline text-sm"
        >
          Export to Excel (.xlsx)
        </button>
      </div>
    </div>
  );
}
