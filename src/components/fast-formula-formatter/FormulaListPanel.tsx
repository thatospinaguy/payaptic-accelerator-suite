'use client';

import { FastFormulaFile } from '@/lib/fast-formula-formatter/types';

interface FormulaListPanelProps {
  files: FastFormulaFile[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export default function FormulaListPanel({
  files,
  activeIndex,
  onSelect,
}: FormulaListPanelProps) {
  return (
    <div className="w-56 flex-shrink-0 border-r border-gray-200 bg-gray-50">
      <div className="border-b border-gray-200 px-4 py-2">
        <span className="text-xs font-medium text-gray-500">
          {files.length} file{files.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="overflow-y-auto" style={{ maxHeight: '500px' }}>
        {files.map((file, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`flex w-full items-center gap-2 border-b border-gray-100 px-4 py-2.5 text-left transition-colors ${
              i === activeIndex
                ? 'bg-payaptic-ocean/10 text-payaptic-navy'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg className="h-4 w-4 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="truncate text-xs font-medium">{file.fileName}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
