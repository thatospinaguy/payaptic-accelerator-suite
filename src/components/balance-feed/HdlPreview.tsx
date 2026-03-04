'use client';

import { useState } from 'react';

interface HdlPreviewProps {
  datContent: string;
}

export default function HdlPreview({ datContent }: HdlPreviewProps) {
  const [collapsed, setCollapsed] = useState(false);
  const lines = datContent.split('\n');

  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-payaptic-ocean uppercase tracking-wider">
          Live Preview
        </h2>
        {/* FIX-09: Collapsible sidebar toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-payaptic-ocean transition-colors text-lg leading-none px-2"
          title={collapsed ? 'Expand preview' : 'Collapse preview'}
        >
          {collapsed ? '\u2192' : '\u2190'}
        </button>
      </div>
      {!collapsed && (
        <div className="p-4 overflow-x-auto max-h-64 overflow-y-auto">
          <pre className="font-mono text-xs leading-relaxed">
            {lines.map((line, i) => (
              <div
                key={i}
                className={`${
                  i === 0
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
      )}
    </div>
  );
}
