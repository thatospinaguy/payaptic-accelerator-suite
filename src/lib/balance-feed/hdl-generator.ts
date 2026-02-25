import { BalanceFeedRow, AddSubtractHuman } from './types';
import { METADATA_HEADER } from './constants';

export function toNumeric(human: AddSubtractHuman): number {
  return human === 'Add' ? 1 : -1;
}

export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    // If already in YYYY/MM/DD format, return as-is
    if (/^\d{4}\/\d{2}\/\d{2}$/.test(date)) {
      return date;
    }
    // Handle YYYY-MM-DD format (convert hyphens to slashes)
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date.replace(/-/g, '/');
    }
    // Parse other string formats
    const parts = date.split(/[-/]/);
    if (parts.length === 3) {
      const yyyy = parts[0];
      const mm = parts[1].padStart(2, '0');
      const dd = parts[2].padStart(2, '0');
      return `${yyyy}/${mm}/${dd}`;
    }
  }
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd}`;
}

export function generateHdlLine(row: BalanceFeedRow): string {
  return [
    row.action,
    'BalanceFeed',
    row.balanceCode,
    row.effectiveStartDate,
    row.legislativeDataGroupName,
    row.elementCode,
    row.inputValueCode,
    toNumeric(row.addSubtractHuman),
  ].join('|');
}

export function generateDatContent(rows: BalanceFeedRow[]): string {
  const lines = [METADATA_HEADER, ...rows.map(generateHdlLine)];
  return lines.join('\n');
}
