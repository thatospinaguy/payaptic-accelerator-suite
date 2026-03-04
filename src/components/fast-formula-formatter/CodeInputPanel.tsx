'use client';

import { useCallback, useRef, useState } from 'react';
import { ACCEPTED_EXTENSIONS, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '@/lib/fast-formula-formatter/constants';

interface CodeInputPanelProps {
  code: string;
  onChange: (code: string) => void;
  onFormat: () => void;
  onFileDrop?: (files: { name: string; content: string }[]) => void;
  darkTheme: boolean;
  formatOnPaste: boolean;
}

export default function CodeInputPanel({
  code,
  onChange,
  onFormat,
  onFileDrop,
  darkTheme,
  formatOnPaste,
}: CodeInputPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Ctrl+Enter / Cmd+Enter to format
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onFormat();
        return;
      }

      // Tab inserts spaces instead of changing focus
      if (e.key === 'Tab') {
        e.preventDefault();
        const ta = e.currentTarget;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const spaces = '  ';
        const newValue = code.slice(0, start) + spaces + code.slice(end);
        onChange(newValue);
        // Restore cursor position after React re-render
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + spaces.length;
        });
      }
    },
    [code, onChange, onFormat]
  );

  const handlePaste = useCallback(
    (_e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      if (formatOnPaste) {
        // Let the paste happen, then trigger format on next tick
        setTimeout(() => onFormat(), 0);
      }
    },
    [formatOnPaste, onFormat]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (e.dataTransfer.files.length > 0 && onFileDrop) {
        const results: { name: string; content: string }[] = [];
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          const file = e.dataTransfer.files[i];
          const ext = '.' + file.name.split('.').pop()?.toLowerCase();
          if (!ACCEPTED_EXTENSIONS.includes(ext)) continue;
          if (file.size > MAX_FILE_SIZE_BYTES) {
            alert(`File "${file.name}" exceeds ${MAX_FILE_SIZE_MB}MB limit and was skipped.`);
            continue;
          }
          const content = await file.text();
          results.push({ name: file.name, content });
        }
        if (results.length > 0) {
          onFileDrop(results);
        }
      }
    },
    [onFileDrop]
  );

  const lineCount = code ? code.split('\n').length : 0;

  return (
    <div
      className={`relative rounded-lg border-2 transition-colors ${
        isDragging
          ? 'border-payaptic-ocean bg-payaptic-ocean/5'
          : darkTheme
            ? 'border-gray-700'
            : 'border-gray-300'
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {/* Line numbers + textarea */}
      <div className="flex">
        {/* Line numbers gutter */}
        <div
          className={`select-none border-r py-3 text-right ${
            darkTheme
              ? 'border-gray-700 bg-gray-900 text-gray-600'
              : 'border-gray-200 bg-gray-100 text-gray-400'
          }`}
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: '13px',
            lineHeight: '1.625',
            minWidth: '48px',
            paddingLeft: '8px',
            paddingRight: '8px',
          }}
          aria-hidden="true"
        >
          {Array.from({ length: Math.max(lineCount, 1) }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Paste your Oracle Fast Formula code here...  (Ctrl+Enter to format, Tab to indent)"
          spellCheck={false}
          aria-label="Formula code input"
          className={`w-full flex-1 px-4 py-3 text-sm leading-relaxed placeholder:text-gray-500 focus:outline-none ${
            darkTheme
              ? 'bg-gray-900 text-gray-200'
              : 'bg-gray-50 text-gray-800'
          }`}
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: '13px',
            minHeight: '400px',
            resize: 'vertical',
            tabSize: 2,
            lineHeight: '1.625',
          }}
        />
      </div>

      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-payaptic-ocean/10 backdrop-blur-sm">
          <p className="text-sm font-medium text-payaptic-ocean">
            Drop formula files here
          </p>
        </div>
      )}

      {/* Footer hints */}
      <div
        className={`flex items-center justify-between border-t px-3 py-1.5 text-xs ${
          darkTheme
            ? 'border-gray-700 bg-gray-900 text-gray-500'
            : 'border-gray-200 bg-gray-50 text-gray-400'
        }`}
      >
        <span>{lineCount} line{lineCount !== 1 ? 's' : ''}</span>
        <span>Ctrl+Enter to format &middot; Tab to indent &middot; Drop files here</span>
      </div>
    </div>
  );
}
