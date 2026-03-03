import { FormulaFile, ReportRow, FormulaEntry } from "./types";

function normalizeFormulaName(name: string): string {
  return name
    .replace(/\.(txt|ff|sql|ffl)$/i, "")
    .replace(/\s+/g, "_")
    .toUpperCase()
    .trim();
}

export function matchFormulaFiles(
  files: FormulaFile[],
  reportRows: ReportRow[]
): FormulaEntry[] {
  return files.map((file) => {
    const normalizedFileName = normalizeFormulaName(file.fileName);
    const matchedRow = reportRows.find(
      (row) => normalizeFormulaName(row.formulaName) === normalizedFileName
    );

    return {
      id: `entry-${file.fileName}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      formulaName: matchedRow?.formulaName || normalizeFormulaName(file.fileName),
      formulaType: matchedRow?.formulaType || "",
      effectiveStartDate: matchedRow?.effectiveStartDate || "",
      legislativeDataGroup: matchedRow?.legislativeDataGroup || "",
      description: matchedRow?.description || "",
      file,
      matched: !!matchedRow,
      errors: [],
    };
  });
}
