'use client';

import { useState, useMemo, useCallback } from 'react';
import { FastFormulaFile, FormatterConfig, Warning } from '@/lib/fast-formula-formatter/types';
import { DEFAULT_CONFIG, ACCEPTED_EXTENSIONS } from '@/lib/fast-formula-formatter/constants';
import { formatFormula, extractFormulaNameFromCode } from '@/lib/fast-formula-formatter/formatter';
import { validateFiles } from '@/lib/fast-formula-formatter/validation';
import { SAMPLE_FORMULA_FULL } from '@/lib/fast-formula-formatter/sample-data';
import FormatterConfigPanel from '@/components/fast-formula-formatter/FormatterConfigPanel';
import CodeInputPanel from '@/components/fast-formula-formatter/CodeInputPanel';
import FileUploadZone from '@/components/fast-formula-formatter/FileUploadZone';
import DiffViewPanel from '@/components/fast-formula-formatter/DiffViewPanel';
import FormulaListPanel from '@/components/fast-formula-formatter/FormulaListPanel';
import ExportButton from '@/components/fast-formula-formatter/ExportButton';
import WarningPanel from '@/components/fast-formula-formatter/WarningPanel';

export default function FastFormulaFormatter() {
  const [config, setConfig] = useState<FormatterConfig>({ ...DEFAULT_CONFIG });
  const [files, setFiles] = useState<FastFormulaFile[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [codeInput, setCodeInput] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);

  const handleFormat = useCallback(() => {
    if (!codeInput.trim()) return;

    const { formatted, warnings: fmtWarnings } = formatFormula(codeInput, config);
    const formulaName = extractFormulaNameFromCode(codeInput);

    const newFile: FastFormulaFile = {
      fileName: formulaName + '.txt',
      originalCode: codeInput,
      formattedCode: formatted,
      formulaName,
    };

    setFiles([newFile]);
    setActiveFileIndex(0);
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
        // Also set code input to the first file
        setCodeInput(newFiles[0].originalCode);
      }
      setShowFileUpload(false);
    },
    [config]
  );

  const handleLoadSample = useCallback(() => {
    setCodeInput(SAMPLE_FORMULA_FULL);
    const { formatted } = formatFormula(SAMPLE_FORMULA_FULL, config);
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
  }, [config]);

  const handleReformat = useCallback(() => {
    if (files.length === 0) return;
    const reformatted = files.map((f) => {
      const { formatted } = formatFormula(f.originalCode, config);
      return { ...f, formattedCode: formatted };
    });
    setFiles(reformatted);
  }, [files, config]);

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
            : 'No formulas — paste code, upload files, or load the sample formula'}
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

      {/* Input section: code editor + upload */}
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
            onClick={() => {
              setCodeInput('');
              setFiles([]);
            }}
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

      {/* Warnings */}
      <WarningPanel warnings={allWarnings} />

      {/* Multi-file list + Diff view */}
      {files.length > 0 && (
        <div className="card overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-payaptic-ocean">
              Formatted Output
            </h2>
          </div>

          <div className="flex">
            {/* File list sidebar when multiple files */}
            {files.length > 1 && (
              <FormulaListPanel
                files={files}
                activeIndex={activeFileIndex}
                onSelect={setActiveFileIndex}
              />
            )}

            {/* Diff view */}
            <div className="flex-1 min-w-0">
              {activeFile && (
                <DiffViewPanel
                  originalCode={activeFile.originalCode}
                  formattedCode={activeFile.formattedCode}
                  fileName={activeFile.fileName}
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
