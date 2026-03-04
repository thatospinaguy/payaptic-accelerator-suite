'use client';

import { useState } from 'react';
import { GeneratedFiles } from '@/lib/element-eligibility-costing-loader/types';
import {
  ELIGIBILITY_DAT_FILENAME,
  COST_INFO_DAT_FILENAME,
  COST_ALLOCATION_DAT_FILENAME,
  COST_ALLOCATION_ACCOUNT_DAT_FILENAME,
} from '@/lib/element-eligibility-costing-loader/constants';

interface MultiFilePreviewProps {
  generatedFiles: GeneratedFiles;
}

type PreviewTab = 'eligibility' | 'costInfo' | 'costAllocation' | 'costAllocationAccount';

export default function MultiFilePreview({ generatedFiles }: MultiFilePreviewProps) {
  const [activeTab, setActiveTab] = useState<PreviewTab>('eligibility');

  const tabs: { key: PreviewTab; label: string; filename: string; content: string }[] = [
    {
      key: 'eligibility',
      label: 'ElementEligibility',
      filename: ELIGIBILITY_DAT_FILENAME,
      content: generatedFiles.eligibilityDat,
    },
    {
      key: 'costInfo',
      label: 'CostInfoV3',
      filename: COST_INFO_DAT_FILENAME,
      content: generatedFiles.costInfoDat,
    },
    {
      key: 'costAllocation',
      label: 'CostAllocationV3',
      filename: COST_ALLOCATION_DAT_FILENAME,
      content: generatedFiles.costAllocationDat,
    },
    {
      key: 'costAllocationAccount',
      label: 'CostAllocAccountV3',
      filename: COST_ALLOCATION_ACCOUNT_DAT_FILENAME,
      content: generatedFiles.costAllocationAccountDat,
    },
  ];

  const currentTab = tabs.find((t) => t.key === activeTab)!;
  const lines = currentTab.content.split('\n');
  const lineCount = lines.length;

  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-payaptic-ocean uppercase tracking-wider mb-3">
          HDL Preview — 4 Output Files
        </h2>
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const tabLines = tab.content.split('\n').length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-payaptic-ocean text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label} ({tabLines})
              </button>
            );
          })}
        </div>
      </div>
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <span className="text-xs font-mono text-gray-500">{currentTab.filename}</span>
        <span className="text-xs text-gray-400">
          {lineCount} line{lineCount !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="p-4 overflow-x-auto max-h-64 overflow-y-auto">
        <pre className="font-mono text-xs leading-relaxed">
          {lines.map((line, i) => (
            <div
              key={i}
              className={`${
                line.startsWith('METADATA')
                  ? 'text-payaptic-ocean font-semibold'
                  : line.startsWith('DELETE')
                    ? 'text-red-600'
                    : 'text-payaptic-navy'
              }`}
            >
              {line}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
