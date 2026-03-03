export function toOracleDate(input: string | Date): string {
  if (input instanceof Date) {
    const yyyy = input.getFullYear();
    const mm = String(input.getMonth() + 1).padStart(2, '0');
    const dd = String(input.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
  }

  const trimmed = input.trim();

  // Already in YYYY/MM/DD format
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // ISO format: YYYY-MM-DD or YYYY-MM-DDT...
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const datePart = trimmed.slice(0, 10);
    return datePart.replace(/-/g, '/');
  }

  // US format: MM/DD/YYYY
  const usMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (usMatch) {
    return `${usMatch[3]}/${usMatch[1]}/${usMatch[2]}`;
  }

  // Unrecognized format — return as-is
  return trimmed;
}
