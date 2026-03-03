import { FormulaEntry } from "./types";

export function validateEntry(entry: FormulaEntry): string[] {
  const errors: string[] = [];

  if (!entry.formulaName.trim()) {
    errors.push("Formula Name is required");
  }
  if (!entry.formulaType.trim()) {
    errors.push("Formula Type is required");
  }
  if (!entry.effectiveStartDate.trim()) {
    errors.push("Effective Start Date is required");
  }
  if (!entry.legislativeDataGroup.trim()) {
    errors.push("Legislative Data Group is required");
  }
  if (!entry.file.content.trim()) {
    errors.push("Formula file has no content");
  }

  return errors;
}
