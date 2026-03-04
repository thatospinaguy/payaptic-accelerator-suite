'use client';

interface CodeInputPanelProps {
  code: string;
  onChange: (code: string) => void;
}

export default function CodeInputPanel({ code, onChange }: CodeInputPanelProps) {
  return (
    <textarea
      value={code}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Paste your Oracle Fast Formula code here..."
      spellCheck={false}
      className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-800 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-payaptic-ocean"
      style={{
        fontFamily: "'Courier New', Courier, monospace",
        minHeight: '400px',
        resize: 'vertical',
        tabSize: 2,
      }}
    />
  );
}
