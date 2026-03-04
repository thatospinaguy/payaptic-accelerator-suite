'use client';

import { useState } from 'react';
import { exportAsZip } from '@/lib/hdl-common/file-export';
import { DAT_FILENAME, ZIP_FILENAME } from '@/lib/balance-reporting-names-loader/constants';

interface ExportButtonProps {
  datContent: string;
  rowCount: number;
}

export default function ExportButton({ datContent, rowCount }: ExportButtonProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(datContent);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  }

  async function handleDownloadZip() {
    await exportAsZip(
      [{ name: DAT_FILENAME, content: datContent }],
      ZIP_FILENAME
    );
  }

  function handleDownloadDat() {
    const blob = new Blob([datContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = DAT_FILENAME;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="card p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
        <h2 className="text-sm font-semibold text-payaptic-ocean uppercase tracking-wider">
          Export
        </h2>
        <span className="text-sm text-gray-500">
          {rowCount} row{rowCount !== 1 ? 's' : ''} ready to export
        </span>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleCopy}
          disabled={rowCount === 0}
          className="btn-outline text-sm"
        >
          {copySuccess ? 'Copied!' : 'Copy All Lines'}
        </button>
        <button
          onClick={handleDownloadDat}
          disabled={rowCount === 0}
          className="btn-secondary text-sm"
        >
          Download .dat
        </button>
        <button
          onClick={handleDownloadZip}
          disabled={rowCount === 0}
          className="btn-primary text-sm"
        >
          Download .zip
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-3">
        ZIP contains &quot;{DAT_FILENAME}&quot; — ready for Oracle HCM HSDL import
      </p>
    </div>
  );
}
