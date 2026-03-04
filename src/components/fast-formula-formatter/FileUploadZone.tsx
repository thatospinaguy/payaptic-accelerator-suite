'use client';

import { useCallback, useRef, useState } from 'react';
import { ACCEPTED_EXTENSIONS } from '@/lib/fast-formula-formatter/constants';

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

  const processFiles = useCallback(
    async (fileList: FileList) => {
      const results: { name: string; content: string }[] = [];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!ACCEPTED_EXTENSIONS.includes(ext)) continue;

        const content = await file.text();
        results.push({ name: file.name, content });
      }

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
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
            isDragging
              ? 'border-payaptic-ocean bg-payaptic-ocean/5'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <svg
            className="mb-3 h-10 w-10 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="mb-1 text-sm font-medium text-gray-700">
            Drag & drop formula files here
          </p>
          <p className="mb-3 text-xs text-gray-500">
            Accepts {ACCEPTED_EXTENSIONS.join(', ')} files — multiple files supported
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
          />
        </div>
      </div>
    </div>
  );
}
