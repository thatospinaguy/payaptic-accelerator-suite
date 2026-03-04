'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload } from 'lucide-react';
import { parseLookupFile, LookupResult } from '@/lib/balance-feed/lookup-parser';

interface LookupUploadZoneProps {
  onLookupLoaded: (result: LookupResult) => void;
  balanceLookupSize: number;
  elementLookupSize: number;
}

export default function LookupUploadZone({
  onLookupLoaded,
  balanceLookupSize,
  elementLookupSize,
}: LookupUploadZoneProps) {
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loaded = balanceLookupSize > 0 || elementLookupSize > 0;

  const handleFile = useCallback(
    (file: File) => {
      setError('');
      setFileName('');
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const result = parseLookupFile(data);

          setFileName(file.name);
          onLookupLoaded(result);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to parse file.');
        }
      };

      reader.readAsArrayBuffer(file);
    },
    [onLookupLoaded]
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

  return (
    <div className="card p-6">
      <h2 className="text-sm font-semibold text-payaptic-ocean uppercase tracking-wider mb-2">
        Upload Balance Feeds Report for auto-lookup (optional)
      </h2>
      <p className="text-xs text-gray-500 mb-3">
        Upload the Balance Feeds Report generated from your Oracle environment to enable automatic Balance Name &rarr; Code and Element Name &rarr; Code mapping.
      </p>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-payaptic-emerald bg-payaptic-lime/20'
            : loaded
              ? 'border-green-300 bg-green-50'
              : 'border-gray-300 hover:border-payaptic-ocean hover:bg-gray-50'
        }`}
      >
        <Upload className={`h-6 w-6 mx-auto mb-2 ${loaded ? 'text-green-500' : 'text-gray-400'}`} />
        {loaded ? (
          <>
            <p className="text-sm font-medium text-green-700">
              Loaded {balanceLookupSize.toLocaleString()} balance mappings and {elementLookupSize.toLocaleString()} element mappings
            </p>
            {fileName && (
              <p className="text-xs text-green-600 mt-1">{fileName}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Drop a new file to replace
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-700">
              Drag &amp; drop the Balance Feeds Report here, or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Accepts .xlsx files
            </p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            if (e.target) e.target.value = '';
          }}
        />
      </div>

      {error && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
