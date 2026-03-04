'use client';

import { useState, useMemo } from 'react';
import { computeDiff, DiffLine } from '@/lib/fast-formula-formatter/formatter';

interface DiffViewPanelProps {
  originalCode: string;
  formattedCode: string;
  fileName: string;
  darkTheme: boolean;
  onEditFormatted?: (code: string) => void;
}

export default function DiffViewPanel({
  originalCode,
  formattedCode,
  fileName,
  darkTheme,
  onEditFormatted,
}: DiffViewPanelProps) {
  const [view, setView] = useState<'diff' | 'formatted'>('diff');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editBuffer, setEditBuffer] = useState('');

  const diffLines = useMemo(
    () => computeDiff(originalCode, formattedCode),
    [originalCode, formattedCode]
  );

  const stats = useMemo(() => {
    let same = 0, modified = 0, added = 0, removed = 0;
    diffLines.forEach((d) => {
      if (d.type === 'same') same++;
      else if (d.type === 'modified') modified++;
      else if (d.type === 'added') added++;
      else removed++;
    });
    return { same, modified, added, removed, total: diffLines.length };
  }, [diffLines]);

  async function handleCopy() {
    await navigator.clipboard.writeText(formattedCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  }

  function startEditing() {
    setEditBuffer(formattedCode);
    setIsEditing(true);
  }

  function saveEdits() {
    if (onEditFormatted) {
      onEditFormatted(editBuffer);
    }
    setIsEditing(false);
  }

  function cancelEdits() {
    setIsEditing(false);
    setEditBuffer('');
  }

  const bg = darkTheme ? 'bg-gray-900' : 'bg-white';
  const textColor = darkTheme ? 'text-gray-300' : 'text-gray-700';
  const borderColor = darkTheme ? 'border-gray-700' : 'border-gray-200';
  const gutterBg = darkTheme ? 'bg-gray-950' : 'bg-gray-50';
  const gutterText = darkTheme ? 'text-gray-600' : 'text-gray-400';

  function getDiffRowColors(type: DiffLine['type'], side: 'left' | 'right') {
    if (type === 'same') return '';
    if (type === 'modified') {
      return darkTheme
        ? side === 'left' ? 'bg-red-950/40' : 'bg-green-950/40'
        : side === 'left' ? 'bg-red-50' : 'bg-green-50';
    }
    if (type === 'removed') {
      return darkTheme ? 'bg-red-950/40' : 'bg-red-50';
    }
    if (type === 'added') {
      return darkTheme ? 'bg-green-950/40' : 'bg-green-50';
    }
    return '';
  }

  return (
    <div>
      {/* Toolbar */}
      <div className={`flex items-center justify-between border-b px-4 py-2 ${borderColor} ${gutterBg}`}>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium ${gutterText}`}>{fileName}</span>
          <div className={`flex rounded-lg border p-0.5 ${borderColor} ${gutterBg}`}>
            <button
              onClick={() => setView('diff')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                view === 'diff'
                  ? darkTheme ? 'bg-gray-700 text-white shadow-sm' : 'bg-white text-payaptic-navy shadow-sm'
                  : gutterText
              }`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setView('formatted')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                view === 'formatted'
                  ? darkTheme ? 'bg-gray-700 text-white shadow-sm' : 'bg-white text-payaptic-navy shadow-sm'
                  : gutterText
              }`}
            >
              Formatted Only
            </button>
          </div>
          {view === 'diff' && (
            <div className="flex items-center gap-2 text-xs">
              {stats.modified > 0 && (
                <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-yellow-700">
                  {stats.modified} modified
                </span>
              )}
              {stats.added > 0 && (
                <span className="rounded bg-green-100 px-1.5 py-0.5 text-green-700">
                  +{stats.added} added
                </span>
              )}
              {stats.removed > 0 && (
                <span className="rounded bg-red-100 px-1.5 py-0.5 text-red-700">
                  -{stats.removed} removed
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {view === 'formatted' && !isEditing && onEditFormatted && (
            <button onClick={startEditing} className="btn-outline text-xs !px-2.5 !py-1">
              Edit
            </button>
          )}
          {isEditing && (
            <>
              <button onClick={saveEdits} className="btn-primary text-xs !px-2.5 !py-1">
                Save
              </button>
              <button onClick={cancelEdits} className="btn-outline text-xs !px-2.5 !py-1">
                Cancel
              </button>
            </>
          )}
          <button onClick={handleCopy} className="btn-outline text-xs !px-2.5 !py-1">
            {copySuccess ? 'Copied!' : 'Copy Formatted'}
          </button>
        </div>
      </div>

      {/* Content */}
      {view === 'diff' ? (
        <div className={`grid grid-cols-1 md:grid-cols-2 divide-y md:divide-x md:divide-y-0 ${borderColor}`}>
          {/* Left: Original */}
          <div className="overflow-auto">
            <div className={`border-b px-4 py-1.5 ${
              darkTheme ? 'border-gray-700 bg-red-950/30' : 'border-gray-100 bg-red-50/50'
            }`}>
              <span className={`text-xs font-medium ${darkTheme ? 'text-red-400' : 'text-red-600'}`}>
                Original
              </span>
            </div>
            <div className={`overflow-x-auto ${bg}`} style={{ maxHeight: '600px' }}>
              <table className="w-full border-collapse" style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: '12px' }}>
                <tbody>
                  {diffLines.map((d, i) => {
                    if (d.type === 'added') {
                      return (
                        <tr key={i} className={getDiffRowColors('added', 'left')}>
                          <td className={`w-10 select-none border-r px-2 py-0 text-right ${borderColor} ${gutterBg} ${gutterText}`}></td>
                          <td className={`whitespace-pre px-3 py-0 leading-relaxed ${textColor}`}></td>
                        </tr>
                      );
                    }
                    return (
                      <tr key={i} className={getDiffRowColors(d.type, 'left')}>
                        <td className={`w-10 select-none border-r px-2 py-0 text-right ${borderColor} ${gutterBg} ${gutterText}`}>
                          {d.leftNum}
                        </td>
                        <td className={`whitespace-pre px-3 py-0 leading-relaxed ${textColor}`}>
                          {d.leftText}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Formatted */}
          <div className="overflow-auto">
            <div className={`border-b px-4 py-1.5 ${
              darkTheme ? 'border-gray-700 bg-green-950/30' : 'border-gray-100 bg-green-50/50'
            }`}>
              <span className={`text-xs font-medium ${darkTheme ? 'text-green-400' : 'text-green-600'}`}>
                Formatted
              </span>
            </div>
            <div className={`overflow-x-auto ${bg}`} style={{ maxHeight: '600px' }}>
              <table className="w-full border-collapse" style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: '12px' }}>
                <tbody>
                  {diffLines.map((d, i) => {
                    if (d.type === 'removed') {
                      return (
                        <tr key={i} className={getDiffRowColors('removed', 'right')}>
                          <td className={`w-10 select-none border-r px-2 py-0 text-right ${borderColor} ${gutterBg} ${gutterText}`}></td>
                          <td className={`whitespace-pre px-3 py-0 leading-relaxed ${textColor}`}></td>
                        </tr>
                      );
                    }
                    return (
                      <tr key={i} className={getDiffRowColors(d.type, 'right')}>
                        <td className={`w-10 select-none border-r px-2 py-0 text-right ${borderColor} ${gutterBg} ${gutterText}`}>
                          {d.rightNum}
                        </td>
                        <td className={`whitespace-pre px-3 py-0 leading-relaxed ${textColor}`}>
                          {d.rightText}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className={`overflow-auto ${bg}`} style={{ maxHeight: '600px' }}>
          {isEditing ? (
            <textarea
              value={editBuffer}
              onChange={(e) => setEditBuffer(e.target.value)}
              className={`w-full p-4 text-xs leading-relaxed focus:outline-none ${
                darkTheme ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-700'
              }`}
              style={{
                fontFamily: "'Courier New', Courier, monospace",
                minHeight: '400px',
                resize: 'vertical',
              }}
              aria-label="Edit formatted code"
            />
          ) : (
            <table className="w-full border-collapse" style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: '12px' }}>
              <tbody>
                {formattedCode.split('\n').map((line, i) => (
                  <tr key={i}>
                    <td className={`w-10 select-none border-r px-2 py-0 text-right ${borderColor} ${gutterBg} ${gutterText}`}>
                      {i + 1}
                    </td>
                    <td className={`whitespace-pre px-3 py-0 leading-relaxed ${textColor}`}>
                      {line}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
