'use client';

import { useCallback, useRef, useState } from 'react';
import { ACCEPTED_EXTENSIONS, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '@/lib/fast-formula-formatter/constants';

interface FileUploadZoneProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesUploaded: (files: { name: string; content: string }[]) => void;
}

export default function FileUploadZone({
  isOpen,
  onClose,
  onFilesUploaded,
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const processFiles = useCallback(
    async (fileList: FileList) => {
      const results: { name: string; content: string }[] = [];
      const newErrors: string[] = [];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();

        if (!ACCEPTED_EXTENSIONS.includes(ext)) {
          newErrors.push(`"${file.name}" — unsupported file type (${ext})`);
          continue;
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
          newErrors.push(`"${file.name}" — exceeds ${MAX_FILE_SIZE_MB}MB size limit`);
          continue;
        }

        const content = await file.text();
        if (!content.trim()) {
          newErrors.push(`"${file.name}" — file is empty`);
          continue;
        }

        results.push({ name: file.name, content });
      }

      setErrors(newErrors);

      if (results.length > 0) {
        onFilesUploaded(results);
      }
    },
    [onFilesUploaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
      }
    },
    [processFiles]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-payaptic-navy">Upload Formula Files</h3>
          <button
            onClick={() => { setErrors([]); onClose(); }}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close upload dialog"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
            isDragging
              ? 'border-payaptic-ocean bg-payaptic-ocean/5'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <svg className="mb-3 h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="mb-1 text-sm font-medium text-gray-700">
            Drag & drop formula files here
          </p>
          <p className="mb-3 text-xs text-gray-500">
            {ACCEPTED_EXTENSIONS.join(', ')} &middot; max {MAX_FILE_SIZE_MB}MB each &middot; multiple files supported
          </p>
          <button
            onClick={() => inputRef.current?.click()}
            className="btn-secondary text-sm !px-4 !py-1.5"
          >
            Browse Files
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS.join(',')}
            multiple
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Upload formula files"
          />
        </div>

        {/* Error messages */}
        {errors.length > 0 && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="mb-1 text-xs font-semibold text-red-700">Some files were skipped:</p>
            <ul className="space-y-0.5">
              {errors.map((err, i) => (
                <li key={i} className="text-xs text-red-600">{err}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
