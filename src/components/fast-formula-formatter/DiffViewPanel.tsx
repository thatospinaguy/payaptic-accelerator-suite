'use client';

import { useState } from 'react';

interface DiffViewPanelProps {
  originalCode: string;
  formattedCode: string;
  fileName: string;
}

export default function DiffViewPanel({
  originalCode,
  formattedCode,
  fileName,
}: DiffViewPanelProps) {
  const [view, setView] = useState<'diff' | 'formatted'>('diff');
  const [copySuccess, setCopySuccess] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(formattedCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">{fileName}</span>
          <div className="flex rounded-lg border border-gray-200 bg-gray-100 p-0.5">
            <button
              onClick={() => setView('diff')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                view === 'diff'
                  ? 'bg-white text-payaptic-navy shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setView('formatted')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                view === 'formatted'
                  ? 'bg-white text-payaptic-navy shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Formatted Only
            </button>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="btn-outline text-xs !px-2.5 !py-1"
        >
          {copySuccess ? 'Copied!' : 'Copy Formatted'}
        </button>
      </div>

      {/* Content */}
      {view === 'diff' ? (
        <div className="grid grid-cols-2 divide-x divide-gray-200">
          <div className="overflow-auto">
            <div className="border-b border-gray-100 bg-red-50/50 px-4 py-1.5">
              <span className="text-xs font-medium text-red-600">Original</span>
            </div>
            <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-gray-700" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
              {originalCode}
            </pre>
          </div>
          <div className="overflow-auto">
            <div className="border-b border-gray-100 bg-green-50/50 px-4 py-1.5">
              <span className="text-xs font-medium text-green-600">Formatted</span>
            </div>
            <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-gray-700" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
              {formattedCode}
            </pre>
          </div>
        </div>
      ) : (
        <div className="overflow-auto">
          <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-gray-700" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
            {formattedCode}
          </pre>
        </div>
      )}
    </div>
  );
}
