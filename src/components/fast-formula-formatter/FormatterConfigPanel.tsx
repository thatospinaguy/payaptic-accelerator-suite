'use client';

import { FormatterConfig } from '@/lib/fast-formula-formatter/types';

interface FormatterConfigPanelProps {
  config: FormatterConfig;
  setConfig: React.Dispatch<React.SetStateAction<FormatterConfig>>;
  onReformat?: () => void;
}

export default function FormatterConfigPanel({
  config,
  setConfig,
  onReformat,
}: FormatterConfigPanelProps) {
  function update(partial: Partial<FormatterConfig>) {
    setConfig((prev) => ({ ...prev, ...partial }));
  }

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-payaptic-ocean">
          Formatting Options
        </h2>
        {onReformat && (
          <button onClick={onReformat} className="btn-secondary text-sm !px-3 !py-1.5">
            Re-format with New Settings
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Indent size */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Indent Size (spaces)
          </label>
          <select
            value={config.indentSize}
            onChange={(e) => update({ indentSize: Number(e.target.value) })}
            className="input-field w-full"
          >
            <option value={2}>2</option>
            <option value={4}>4</option>
            <option value={6}>6</option>
            <option value={8}>8</option>
          </select>
        </div>

        {/* Uppercase keywords */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Uppercase Keywords
          </label>
          <button
            onClick={() => update({ uppercaseKeywords: !config.uppercaseKeywords })}
            className={`flex h-[38px] w-full items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
              config.uppercaseKeywords
                ? 'border-payaptic-emerald bg-payaptic-emerald/10 text-payaptic-emerald'
                : 'border-gray-300 bg-white text-gray-500'
            }`}
          >
            {config.uppercaseKeywords ? 'ON — IF, THEN, ELSE' : 'OFF — if, then, else'}
          </button>
        </div>

        {/* Header block */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Add Header Block
          </label>
          <button
            onClick={() => update({ addHeaderBlock: !config.addHeaderBlock })}
            className={`flex h-[38px] w-full items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
              config.addHeaderBlock
                ? 'border-payaptic-emerald bg-payaptic-emerald/10 text-payaptic-emerald'
                : 'border-gray-300 bg-white text-gray-500'
            }`}
          >
            {config.addHeaderBlock ? 'ON — Prepend if missing' : 'OFF — No header'}
          </button>
        </div>

        {/* Author name */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Author Name
          </label>
          <input
            type="text"
            value={config.headerAuthor}
            onChange={(e) => update({ headerAuthor: e.target.value })}
            placeholder="Your name"
            className="input-field w-full"
          />
        </div>
      </div>
    </div>
  );
}
