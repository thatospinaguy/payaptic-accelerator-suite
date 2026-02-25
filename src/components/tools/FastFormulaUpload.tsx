"use client";

import React, { useState, useCallback } from "react";
import {
  ReportRow,
  FormulaFile,
  FormulaEntry,
  SessionDefaults,
} from "@/lib/types";
import { matchFormulaFiles } from "@/lib/matchFormulas";
import { validateEntry } from "@/lib/validation";
import ReportUploader from "@/components/ReportUploader";
import FileUploader from "@/components/FileUploader";
import DefaultsPanel from "@/components/DefaultsPanel";
import FormulaTable from "@/components/FormulaTable";
import DownloadButton from "@/components/DownloadButton";

const DEFAULT_SESSION: SessionDefaults = {
  zipFileName: "FastFormulaUpload",
  overrideEffectiveStartDate: "",
};

export default function FastFormulaUpload() {
  const [reportRows, setReportRows] = useState<ReportRow[]>([]);
  const [formulaFiles, setFormulaFiles] = useState<FormulaFile[]>([]);
  const [entries, setEntries] = useState<FormulaEntry[]>([]);
  const [defaults, setDefaults] = useState<SessionDefaults>(DEFAULT_SESSION);

  const applyOverrideDate = useCallback(
    (matched: FormulaEntry[]): FormulaEntry[] => {
      if (!defaults.overrideEffectiveStartDate) return matched;
      return matched.map((entry) => ({
        ...entry,
        effectiveStartDate: defaults.overrideEffectiveStartDate,
      }));
    },
    [defaults.overrideEffectiveStartDate]
  );

  const handleReportParsed = useCallback(
    (rows: ReportRow[]) => {
      setReportRows(rows);
      if (formulaFiles.length > 0) {
        const matched = applyOverrideDate(
          matchFormulaFiles(formulaFiles, rows)
        );
        const validated = matched.map((entry) => ({
          ...entry,
          errors: validateEntry(entry),
        }));
        setEntries(validated);
      }
    },
    [formulaFiles, applyOverrideDate]
  );

  const handleFilesUploaded = useCallback(
    (files: FormulaFile[]) => {
      const fileMap = new Map<string, FormulaFile>();
      for (const f of formulaFiles) fileMap.set(f.fileName, f);
      for (const f of files) fileMap.set(f.fileName, f);
      const allFiles = Array.from(fileMap.values());
      setFormulaFiles(allFiles);

      const matched = applyOverrideDate(
        matchFormulaFiles(allFiles, reportRows)
      );
      const validated = matched.map((entry) => ({
        ...entry,
        errors: validateEntry(entry),
      }));
      setEntries(validated);
    },
    [formulaFiles, reportRows, applyOverrideDate]
  );

  const handleUpdateEntry = useCallback(
    (id: string, updates: Partial<FormulaEntry>) => {
      setEntries((prev) =>
        prev.map((entry) => {
          if (entry.id !== id) return entry;
          const updated = { ...entry, ...updates };
          updated.errors = validateEntry(updated);
          return updated;
        })
      );
    },
    []
  );

  const handleRemoveEntry = useCallback(
    (id: string) => {
      setEntries((prev) => {
        const newEntries = prev.filter((e) => e.id !== id);
        return newEntries;
      });
      setFormulaFiles((prev) => {
        const removedEntry = entries.find((e) => e.id === id);
        if (!removedEntry) return prev;
        return prev.filter((f) => f.fileName !== removedEntry.file.fileName);
      });
    },
    [entries]
  );

  const handleDefaultsChange = useCallback(
    (newDefaults: SessionDefaults) => {
      setDefaults(newDefaults);
      if (newDefaults.overrideEffectiveStartDate) {
        setEntries((prev) =>
          prev.map((entry) => {
            const updated = {
              ...entry,
              effectiveStartDate: newDefaults.overrideEffectiveStartDate,
            };
            updated.errors = validateEntry(updated);
            return updated;
          })
        );
      }
    },
    []
  );

  return (
    <div className="space-y-8">
      {/* Step 1: Upload Payaptic Fast Formula Report */}
      <section>
        <StepHeader number={1} title="Upload Payaptic Fast Formula Report" />
        <ReportUploader
          onReportParsed={handleReportParsed}
          reportRows={reportRows}
        />
      </section>

      {/* Step 2: Upload Formula Files */}
      <section>
        <StepHeader number={2} title="Upload Fast Formula Code Files" />
        <FileUploader
          onFilesUploaded={handleFilesUploaded}
          uploadedCount={formulaFiles.length}
        />
      </section>

      {/* Step 3: Configure Details */}
      <section>
        <StepHeader number={3} title="Configure Details" />
        <DefaultsPanel defaults={defaults} onChange={handleDefaultsChange} />
      </section>

      {/* Step 4: Preview & Edit */}
      <section>
        <StepHeader number={4} title="Preview & Edit" />
        <FormulaTable
          entries={entries}
          onUpdateEntry={handleUpdateEntry}
          onRemoveEntry={handleRemoveEntry}
        />
      </section>

      {/* Step 5: Generate & Download */}
      <section>
        <StepHeader number={5} title="Generate & Download" />
        <DownloadButton
          entries={entries}
          zipFileName={defaults.zipFileName}
        />
      </section>

      {/* Step 6: Upload to Oracle */}
      <section>
        <StepHeader number={6} title="Upload to Oracle HCM" />
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          <p className="mb-2 font-medium text-payaptic-navy">
            After downloading the zip file, upload it to Oracle HCM:
          </p>
          <ol className="ml-5 list-decimal space-y-1">
            <li>
              In Oracle HCM, navigate to <strong>My Client Groups</strong>{" "}
              &rarr; <strong>Data Exchange</strong>.
            </li>
            <li>
              Select <strong>Import and Load Data</strong>.
            </li>
            <li>
              Click <strong>Import Local File</strong> and select the downloaded
              zip file.
            </li>
            <li>
              Monitor the import status to confirm all formulas loaded
              successfully.
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}

function StepHeader({ number, title }: { number: number; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-payaptic-emerald text-sm font-bold text-white">
        {number}
      </div>
      <h2 className="text-lg font-semibold text-payaptic-navy">{title}</h2>
    </div>
  );
}
