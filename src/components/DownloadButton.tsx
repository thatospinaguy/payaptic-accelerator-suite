"use client";

import React, { useCallback, useState } from "react";
import { Download, Loader2, AlertCircle } from "lucide-react";
import { FormulaEntry } from "@/lib/types";
import JSZip from "jszip";

interface DownloadButtonProps {
  entries: FormulaEntry[];
  zipFileName: string;
}

function formatDateForHDL(dateStr: string): string {
  if (!dateStr) return "";
  // Handle YYYY-MM-DD (HTML date input) → YYYY/MM/DD (Oracle HDL)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr.replace(/-/g, "/");
  }
  return dateStr;
}

function buildDatContent(entries: FormulaEntry[]): string {
  const header =
    "METADATA|FormulaGlobalHeader|FormulaName|FormulaType|EffectiveStartDate|LegislativeDataGroup|Description|SourceText";

  const rows = entries.map((entry) => {
    const sourceText = entry.file.content
      .replace(/\|/g, "{{PIPE}}")
      .replace(/\r\n/g, "\n");

    return [
      "MERGE",
      "FormulaGlobalHeader",
      entry.formulaName,
      entry.formulaType,
      formatDateForHDL(entry.effectiveStartDate),
      entry.legislativeDataGroup,
      entry.description,
      sourceText,
    ].join("|");
  });

  return [header, ...rows].join("\n");
}

export default function DownloadButton({
  entries,
  zipFileName,
}: DownloadButtonProps) {
  const [generating, setGenerating] = useState(false);

  const validEntries = entries.filter((e) => e.errors.length === 0);
  const hasErrors = entries.some((e) => e.errors.length > 0);

  const handleDownload = useCallback(async () => {
    if (validEntries.length === 0) return;

    setGenerating(true);
    try {
      const zip = new JSZip();
      const datContent = buildDatContent(validEntries);
      zip.file("FormulaGlobalHeader.dat", datContent);

      // Also include raw formula files for reference
      const formulaFolder = zip.folder("formulas");
      for (const entry of validEntries) {
        formulaFolder?.file(entry.file.fileName, entry.file.content);
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${zipFileName || "FastFormulaUpload"}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setGenerating(false);
    }
  }, [validEntries, zipFileName]);

  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500">
        Add formula entries above to generate a download package.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {hasErrors && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-sm text-amber-700">
            {entries.length - validEntries.length} entr
            {entries.length - validEntries.length !== 1 ? "ies" : "y"} with
            errors will be excluded from the download.
          </p>
        </div>
      )}
      <button
        onClick={handleDownload}
        disabled={generating || validEntries.length === 0}
        className="inline-flex items-center gap-2 rounded-lg bg-payaptic-emerald px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-payaptic-emerald/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {generating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {generating
          ? "Generating..."
          : `Download Zip (${validEntries.length} formula${
              validEntries.length !== 1 ? "s" : ""
            })`}
      </button>
    </div>
  );
}
