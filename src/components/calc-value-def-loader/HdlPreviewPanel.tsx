'use client';

interface HdlPreviewPanelProps {
  datContent: string;
}

export default function HdlPreviewPanel({ datContent }: HdlPreviewPanelProps) {
  const lines = datContent.split('\n');
  const lineCount = lines.length;

  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-payaptic-ocean uppercase tracking-wider">
          HDL Preview
        </h2>
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
