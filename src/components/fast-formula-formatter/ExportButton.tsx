'use client';

import { useState } from 'react';
import { FastFormulaFile } from '@/lib/fast-formula-formatter/types';
import { ZIP_FILENAME } from '@/lib/fast-formula-formatter/constants';
import { exportAsZip } from '@/lib/hdl-common/file-export';

interface ExportButtonProps {
  files: FastFormulaFile[];
}

export default function ExportButton({ files }: ExportButtonProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  async function handleCopyAll() {
    const allFormatted = files.map((f) => f.formattedCode).join('\n\n');
    await navigator.clipboard.writeText(allFormatted);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  }

  function handleDownloadTxt() {
    if (files.length === 0) return;
    const file = files[0];
    const blob = new Blob([file.formattedCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const baseName = file.fileName.replace(/\.[^.]+$/, '');
    a.download = baseName + '_formatted.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleDownloadZip() {
    const zipFiles = files.map((f) => {
      const baseName = f.fileName.replace(/\.[^.]+$/, '');
      return {
        name: baseName + '_formatted.txt',
        content: f.formattedCode,
      };
    });
    await exportAsZip(zipFiles, ZIP_FILENAME);
  }

  const count = files.length;
  const disabled = count === 0;

  return (
    <div className="card p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-payaptic-ocean">
          Export
        </h2>
        <span className="text-sm text-gray-500">
          {count} formatted formula{count !== 1 ? 's' : ''} ready
        </span>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleCopyAll}
          disabled={disabled}
          className="btn-outline text-sm"
        >
          {copySuccess ? 'Copied!' : 'Copy Formatted Code'}
        </button>
        {count === 1 ? (
          <button
            onClick={handleDownloadTxt}
            disabled={disabled}
            className="btn-secondary text-sm"
          >
            Download .txt
          </button>
        ) : (
          <button
            onClick={handleDownloadZip}
            disabled={disabled}
            className="btn-secondary text-sm"
          >
            Download .zip ({count} files)
          </button>
        )}
      </div>
      <p className="mt-3 text-xs text-gray-400">
        {count > 1
          ? `ZIP contains ${count} formatted formula files`
          : 'Download the formatted formula as a text file'}
      </p>
    </div>
  );
}
