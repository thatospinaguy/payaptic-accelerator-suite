'use client';

import { Warning } from '@/lib/element-eligibility-costing-loader/types';
import { useState } from 'react';

interface WarningPanelProps {
  warnings: Warning[];
}

export default function WarningPanel({ warnings }: WarningPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (warnings.length === 0) return null;

  return (
    <div className="card border-amber-200 bg-amber-50 overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-sm font-semibold text-amber-800">
            Warnings ({warnings.length})
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-amber-600 transition-transform ${collapsed ? '' : 'rotate-180'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {!collapsed && (
        <div className="px-4 pb-4">
          <ul className="space-y-1">
            {warnings.map((w, i) => (
              <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                <span className="font-mono text-xs bg-amber-200 rounded px-1.5 py-0.5 mt-0.5 shrink-0">
                  {w.id}
                </span>
                <span>{w.message}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-amber-600 mt-3 italic">
            Warnings are advisory only. File generation is never blocked.
          </p>
        </div>
      )}
    </div>
  );
}
