'use client';

import { FormatStats } from '@/lib/fast-formula-formatter/formatter';

interface StatsPanelProps {
  stats: FormatStats;
}

function StatItem({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <span className="text-lg font-bold text-payaptic-navy">{value}</span>
      <span className="text-xs font-medium text-gray-500">{label}</span>
      {detail && <span className="mt-0.5 text-[10px] text-gray-400">{detail}</span>}
    </div>
  );
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  const lineDiff = stats.formattedLines - stats.originalLines;
  const lineDiffLabel = lineDiff > 0 ? `+${lineDiff}` : lineDiff === 0 ? '0' : `${lineDiff}`;

  return (
    <div className="card p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-payaptic-ocean">
        Format Summary
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatItem
          label="Original"
          value={stats.originalLines}
          detail="lines"
        />
        <StatItem
          label="Formatted"
          value={stats.formattedLines}
          detail={`${lineDiffLabel} lines`}
        />
        <StatItem
          label="Keywords"
          value={stats.keywordsUppercased}
          detail="uppercased"
        />
        <StatItem
          label="Max Depth"
          value={stats.maxIndentDepth}
          detail="indent levels"
        />
        <StatItem
          label="Blank Lines"
          value={stats.blankLinesNormalized}
          detail="normalized"
        />
        <StatItem
          label="Header"
          value={stats.headerAction === 'preserved' ? 'Kept' : stats.headerAction === 'added' ? 'Added' : '—'}
          detail={stats.headerAction === 'preserved' ? 'existing preserved' : stats.headerAction === 'added' ? 'new header' : 'no change'}
        />
      </div>
    </div>
  );
}
