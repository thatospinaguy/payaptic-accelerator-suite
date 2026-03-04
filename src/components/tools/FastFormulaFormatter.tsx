'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { FastFormulaFile, FormatterConfig, Warning } from '@/lib/fast-formula-formatter/types';
import { DEFAULT_CONFIG, LOCAL_STORAGE_KEY } from '@/lib/fast-formula-formatter/constants';
import { formatFormula, extractFormulaNameFromCode, FormatStats } from '@/lib/fast-formula-formatter/formatter';
import { validateFiles } from '@/lib/fast-formula-formatter/validation';
import { SAMPLE_FORMULA_FULL } from '@/lib/fast-formula-formatter/sample-data';
import FormatterConfigPanel from '@/components/fast-formula-formatter/FormatterConfigPanel';
import CodeInputPanel from '@/components/fast-formula-formatter/CodeInputPanel';
import FileUploadZone from '@/components/fast-formula-formatter/FileUploadZone';
import DiffViewPanel from '@/components/fast-formula-formatter/DiffViewPanel';
import FormulaListPanel from '@/components/fast-formula-formatter/FormulaListPanel';
import ExportButton from '@/components/fast-formula-formatter/ExportButton';
import WarningPanel from '@/components/fast-formula-formatter/WarningPanel';
import StatsPanel from '@/components/fast-formula-formatter/StatsPanel';

function loadSavedConfig(): FormatterConfig {
  if (typeof window === 'undefined') return { ...DEFAULT_CONFIG };
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_CONFIG };
}

export default function FastFormulaFormatter() {
  const [config, setConfig] = useState<FormatterConfig>({ ...DEFAULT_CONFIG });
  const [files, setFiles] = useState<FastFormulaFile[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [codeInput, setCodeInput] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [latestStats, setLatestStats] = useState<FormatStats | null>(null);

  // Load config from localStorage on mount
  useEffect(() => {
    setConfig(loadSavedConfig());
  }, []);

  // Persist config to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
    } catch { /* ignore */ }
  }, [config]);

  const handleFormat = useCallback(() => {
    if (!codeInput.trim()) return;

    const { formatted, stats } = formatFormula(codeInput, config);
    const formulaName = extractFormulaNameFromCode(codeInput);

    const newFile: FastFormulaFile = {
      fileName: formulaName + '.txt',
      originalCode: codeInput,
      formattedCode: formatted,
      formulaName,
    };

    setFiles([newFile]);
    setActiveFileIndex(0);
    setLatestStats(stats);
  }, [codeInput, config]);

  const handleFilesUploaded = useCallback(
    (uploadedFiles: { name: string; content: string }[]) => {
      const newFiles: FastFormulaFile[] = uploadedFiles
        .filter((f) => f.content.trim())
        .map((f) => {
          const { formatted } = formatFormula(f.content, config);
          const formulaName = extractFormulaNameFromCode(f.content);
          return {
            fileName: f.name,
            originalCode: f.content,
            formattedCode: formatted,
            formulaName,
          };
        });

      if (newFiles.length > 0) {
        setFiles(newFiles);
        setActiveFileIndex(0);
        setCodeInput(newFiles[0].originalCode);

        // Compute aggregate stats from last file
        const { stats } = formatFormula(newFiles[0].originalCode, config);
        setLatestStats(stats);
      }
      setShowFileUpload(false);
    },
    [config]
  );

  const handleLoadSample = useCallback(() => {
    setCodeInput(SAMPLE_FORMULA_FULL);
    const { formatted, stats } = formatFormula(SAMPLE_FORMULA_FULL, config);
    const formulaName = extractFormulaNameFromCode(SAMPLE_FORMULA_FULL);

    setFiles([
      {
        fileName: 'XX_Overtime_Base_TL_Earnings_Results.sql',
        originalCode: SAMPLE_FORMULA_FULL,
        formattedCode: formatted,
        formulaName,
      },
    ]);
    setActiveFileIndex(0);
    setLatestStats(stats);
  }, [config]);

  const handleReformat = useCallback(() => {
    if (files.length === 0) return;
    let lastStats: FormatStats | null = null;
    const reformatted = files.map((f) => {
      const { formatted, stats } = formatFormula(f.originalCode, config);
      lastStats = stats;
      return { ...f, formattedCode: formatted };
    });
    setFiles(reformatted);
    if (lastStats) setLatestStats(lastStats);
  }, [files, config]);

  const handleEditFormatted = useCallback(
    (editedCode: string) => {
      setFiles((prev) =>
        prev.map((f, i) =>
          i === activeFileIndex ? { ...f, formattedCode: editedCode } : f
        )
      );
    },
    [activeFileIndex]
  );

  const handleFileDrop = useCallback(
    (droppedFiles: { name: string; content: string }[]) => {
      handleFilesUploaded(droppedFiles);
    },
    [handleFilesUploaded]
  );

  const handleClear = useCallback(() => {
    if (codeInput.trim() || files.length > 0) {
      setShowClearConfirm(true);
    }
  }, [codeInput, files]);

  const confirmClear = useCallback(() => {
    setCodeInput('');
    setFiles([]);
    setLatestStats(null);
    setShowClearConfirm(false);
  }, []);

  // Collect all warnings
  const allWarnings = useMemo(() => {
    const fileWarnings = validateFiles(files);
    const formatWarnings: Warning[] = [];
    files.forEach((f) => {
      const { warnings } = formatFormula(f.originalCode, config);
      formatWarnings.push(...warnings);
    });
    return [...fileWarnings, ...formatWarnings];
  }, [files, config]);

  const activeFile = files[activeFileIndex] || null;
  const fileCount = files.length;
  const hasFormatted = files.length > 0 && files.some((f) => f.formattedCode.trim());

  return (
    <div className="space-y-6">
      {/* Status bar */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2">
        <span className="text-sm text-gray-500">
          {fileCount > 0
            ? `${fileCount} formula${fileCount !== 1 ? 's' : ''} formatted${allWarnings.length > 0 ? ` | ${allWarnings.length} warning${allWarnings.length !== 1 ? 's' : ''}` : ''}`
            : 'Paste code, upload files, or load the sample formula'}
        </span>
        {fileCount === 0 && (
          <button
            onClick={handleLoadSample}
            className="text-sm font-medium text-payaptic-ocean hover:underline"
          >
            Load Sample
          </button>
        )}
      </div>

      {/* Config panel */}
      <FormatterConfigPanel
        config={config}
        setConfig={setConfig}
        onReformat={hasFormatted ? handleReformat : undefined}
      />

      {/* Input section */}
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-payaptic-ocean">
            Formula Input
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFileUpload(true)}
              className="btn-outline text-sm !px-3 !py-1.5"
            >
              Upload Files
            </button>
            <button
              onClick={handleLoadSample}
              className="btn-outline text-sm !px-3 !py-1.5"
            >
              Load Sample
            </button>
          </div>
        </div>

        <CodeInputPanel
          code={codeInput}
          onChange={setCodeInput}
          onFormat={handleFormat}
          onFileDrop={handleFileDrop}
          darkTheme={config.darkTheme}
          formatOnPaste={config.formatOnPaste}
        />

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleFormat}
            disabled={!codeInput.trim()}
            className="btn-primary text-sm"
          >
            Format Code
          </button>
          <button
            onClick={handleClear}
            disabled={!codeInput.trim() && files.length === 0}
            className="btn-outline text-sm"
          >
            Clear
          </button>
        </div>
      </div>

      {/* File upload modal */}
      <FileUploadZone
        isOpen={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        onFilesUploaded={handleFilesUploaded}
      />

      {/* Clear confirmation */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-bold text-payaptic-navy">Clear All?</h3>
            <p className="mb-4 text-sm text-gray-600">
              This will clear the code editor and all formatted output. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="btn-outline text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmClear}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                Clear Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      <WarningPanel warnings={allWarnings} />

      {/* Stats panel */}
      {latestStats && hasFormatted && (
        <StatsPanel stats={latestStats} />
      )}

      {/* Multi-file list + Diff view */}
      {files.length > 0 && (
        <div className="card overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-payaptic-ocean">
              Formatted Output
            </h2>
          </div>

          <div className="flex flex-col md:flex-row">
            {files.length > 1 && (
              <FormulaListPanel
                files={files}
                activeIndex={activeFileIndex}
                onSelect={setActiveFileIndex}
              />
            )}

            <div className="flex-1 min-w-0">
              {activeFile && (
                <DiffViewPanel
                  originalCode={activeFile.originalCode}
                  formattedCode={activeFile.formattedCode}
                  fileName={activeFile.fileName}
                  darkTheme={config.darkTheme}
                  onEditFormatted={handleEditFormatted}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Export */}
      {hasFormatted && (
        <ExportButton files={files} />
      )}
    </div>
  );
}
