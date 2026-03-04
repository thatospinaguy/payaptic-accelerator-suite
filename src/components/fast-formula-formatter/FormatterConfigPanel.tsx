'use client';

import { FormatterConfig } from '@/lib/fast-formula-formatter/types';

interface FormatterConfigPanelProps {
  config: FormatterConfig;
  setConfig: React.Dispatch<React.SetStateAction<FormatterConfig>>;
  onReformat?: () => void;
}

function ToggleButton({
  label,
  enabled,
  onLabel,
  offLabel,
  onToggle,
  ariaLabel,
}: {
  label: string;
  enabled: boolean;
  onLabel: string;
  offLabel: string;
  onToggle: () => void;
  ariaLabel: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <button
        onClick={onToggle}
        aria-label={ariaLabel}
        aria-pressed={enabled}
        className={`flex h-[38px] w-full items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
          enabled
            ? 'border-payaptic-emerald bg-payaptic-emerald/10 text-payaptic-emerald'
            : 'border-gray-300 bg-white text-gray-500'
        }`}
      >
        {enabled ? onLabel : offLabel}
      </button>
    </div>
  );
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
            aria-label="Indent size in spaces"
          >
            <option value={2}>2</option>
            <option value={4}>4</option>
            <option value={6}>6</option>
            <option value={8}>8</option>
          </select>
        </div>

        <ToggleButton
          label="Uppercase Keywords"
          enabled={config.uppercaseKeywords}
          onLabel="ON — IF, THEN, ELSE"
          offLabel="OFF — if, then, else"
          onToggle={() => update({ uppercaseKeywords: !config.uppercaseKeywords })}
          ariaLabel="Toggle uppercase keywords"
        />

        <ToggleButton
          label="Add Header Block"
          enabled={config.addHeaderBlock}
          onLabel="ON — Prepend if missing"
          offLabel="OFF — No header"
          onToggle={() => update({ addHeaderBlock: !config.addHeaderBlock })}
          ariaLabel="Toggle header block prepending"
        />

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
            aria-label="Author name for header block"
          />
        </div>
      </div>

      {/* Second row: extra options */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ToggleButton
          label="Format on Paste"
          enabled={config.formatOnPaste}
          onLabel="ON — Auto-format"
          offLabel="OFF — Manual only"
          onToggle={() => update({ formatOnPaste: !config.formatOnPaste })}
          ariaLabel="Toggle auto-format on paste"
        />

        <ToggleButton
          label="Dark Code Theme"
          enabled={config.darkTheme}
          onLabel="ON — Dark editor"
          offLabel="OFF — Light editor"
          onToggle={() => update({ darkTheme: !config.darkTheme })}
          ariaLabel="Toggle dark code theme"
        />
      </div>
    </div>
  );
}
