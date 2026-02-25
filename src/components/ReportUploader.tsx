"use client";

import React, { useCallback, useRef } from "react";
import { FileSpreadsheet, CheckCircle } from "lucide-react";
import { ReportRow } from "@/lib/types";
import * as XLSX from "xlsx";

interface ReportUploaderProps {
  onReportParsed: (rows: ReportRow[]) => void;
  reportRows: ReportRow[];
}

export default function ReportUploader({
  onReportParsed,
  reportRows,
}: ReportUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseExcel = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        if (!data) return;

        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json<Record<string, string>>(
          sheet,
          { defval: "" }
        );

        const rows: ReportRow[] = rawRows
          .map((row) => {
            const findCol = (patterns: string[]) => {
              for (const key of Object.keys(row)) {
                const normalized = key.toLowerCase().replace(/[_\s]+/g, "");
                for (const pattern of patterns) {
                  if (
                    normalized.includes(
                      pattern.toLowerCase().replace(/[_\s]+/g, "")
                    )
                  ) {
                    return row[key]?.toString() || "";
                  }
                }
              }
              return "";
            };

            return {
              formulaName: findCol(["formulaname", "formula_name", "name"]),
              formulaType: findCol(["formulatype", "formula_type", "type"]),
              effectiveStartDate: findCol([
                "effectivestartdate",
                "effective_start_date",
                "startdate",
              ]),
              legislativeDataGroup: findCol([
                "legislativedatagroup",
                "legislative_data_group",
                "ldg",
              ]),
              description: findCol(["description", "desc"]),
            };
          })
          .filter((row) => row.formulaName.trim() !== "");

        onReportParsed(rows);
      };
      reader.readAsArrayBuffer(file);
    },
    [onReportParsed]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) parseExcel(file);
    },
    [parseExcel]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) parseExcel(file);
    },
    [parseExcel]
  );

  if (reportRows.length > 0) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-payaptic-emerald/30 bg-payaptic-emerald/5 p-4">
        <CheckCircle className="h-5 w-5 shrink-0 text-payaptic-emerald" />
        <span className="text-sm font-medium text-payaptic-navy">
          {reportRows.length} formula{reportRows.length !== 1 ? "s" : ""} loaded
          from report
        </span>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="ml-auto text-sm text-payaptic-ocean hover:underline"
        >
          Replace
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleChange}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-payaptic-emerald/50"
    >
      <FileSpreadsheet className="mx-auto mb-3 h-10 w-10 text-gray-400" />
      <p className="mb-2 text-sm text-gray-600">
        Drag and drop your Payaptic Fast Formula Report (.xlsx) here
      </p>
      <p className="mb-4 text-xs text-gray-400">or</p>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="rounded-lg bg-payaptic-emerald px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-payaptic-emerald/90"
      >
        Browse Files
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
