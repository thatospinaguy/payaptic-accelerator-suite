import { FormatterConfig, Warning } from './types';

// ─── Keywords ────────────────────────────────────────────────────────────────
const CONTROL_FLOW = [
  'IF', 'THEN', 'ELSE', 'FOR', 'RETURN', 'DEFAULT', 'INPUTS', 'ARE', 'IS',
];
const DECLARATIONS = [
  'ALIAS', 'AS', 'DEFAULT_DATA_VALUE', 'WAS', 'DEFAULTED',
];
const LOGICAL_OPS = [
  'AND', 'OR', 'NOT', 'NULL', 'LIKE', 'BETWEEN', 'IN', 'EXISTS',
];
const TYPE_KEYWORDS = [
  'FORMULA', 'RESULT', 'TYPE', 'OVERRIDE',
];
const FUNCTION_KEYWORDS = [
  'CALL_FORMULA', 'CHANGE_CONTEXTS', 'CALC_DIR_EXISTS', 'CALC_DIR_TEXT_VALUE',
  'GET_CONTEXT', 'PAY_INTERNAL_LOG_WRITE', 'TO_CHAR', 'TO_DATE', 'ROUNDUP',
  // Common Oracle functions
  'SUBSTR', 'INSTR', 'UPPER', 'LOWER', 'LPAD', 'RPAD', 'ROUND', 'TRUNC',
  'ABS', 'MOD', 'SIGN', 'CEIL', 'FLOOR', 'SQRT', 'POWER', 'DECODE', 'NVL',
  'LENGTH', 'REPLACE', 'TRIM', 'LTRIM', 'RTRIM', 'GREATEST', 'LEAST',
  'TO_NUMBER', 'MONTHS_BETWEEN', 'ADD_MONTHS', 'LAST_DAY', 'NEXT_DAY',
  'SYSDATE', 'CONCAT',
];

const ALL_KEYWORDS = new Set([
  ...CONTROL_FLOW,
  ...DECLARATIONS,
  ...LOGICAL_OPS,
  ...TYPE_KEYWORDS,
  ...FUNCTION_KEYWORDS,
]);

// ─── Escaped quote-aware string skipper ──────────────────────────────────────
// Oracle FF uses '' to escape a single quote inside a string literal.
// e.g. 'O''Reilly' is the string O'Reilly.
function skipString(str: string, start: number): number {
  // start is the index of the opening quote
  let i = start + 1;
  while (i < str.length) {
    if (str[i] === "'") {
      // Check for escaped quote ''
      if (i + 1 < str.length && str[i + 1] === "'") {
        i += 2; // skip both quotes
        continue;
      }
      return i + 1; // past closing quote
    }
    i++;
  }
  return i; // unclosed string — return end of input
}

// ─── Warning-only scanner (replaces full tokenizer) ──────────────────────────
function scanForWarnings(code: string): Warning[] {
  const warnings: Warning[] = [];
  let i = 0;
  let lineNum = 1;

  while (i < code.length) {
    // Block comment
    if (code[i] === '/' && code[i + 1] === '*') {
      const startLine = lineNum;
      i += 2;
      while (i < code.length && !(code[i] === '*' && code[i + 1] === '/')) {
        if (code[i] === '\n') lineNum++;
        i++;
      }
      if (i >= code.length) {
        warnings.push({
          rowIndex: -1,
          id: 'UNCLOSED_COMMENT',
          message: `Unclosed block comment detected starting near line ${startLine}.`,
        });
      } else {
        i += 2;
      }
      continue;
    }

    // String literal (with escaped quote support)
    if (code[i] === "'") {
      const startLine = lineNum;
      const end = skipString(code, i);
      // Count newlines within string
      for (let j = i; j < end && j < code.length; j++) {
        if (code[j] === '\n') lineNum++;
      }
      if (end > code.length || (code[end - 1] !== "'")) {
        warnings.push({
          rowIndex: -1,
          id: 'UNCLOSED_STRING',
          message: `Unclosed string literal detected near line ${startLine}.`,
        });
      }
      i = end;
      continue;
    }

    if (code[i] === '\n') lineNum++;
    i++;
  }

  return warnings;
}

// ─── Header detection ────────────────────────────────────────────────────────
function hasExistingHeader(code: string): boolean {
  const first20Lines = code.split('\n').slice(0, 20).join('\n');
  const headerPatterns = ['Formula Name', '$Header', 'Version', 'Description'];
  const commentMatch = first20Lines.match(/\/\*[\s\S]*?\*\//);
  if (!commentMatch) return false;
  return headerPatterns.some((p) => commentMatch[0].includes(p));
}

function extractHeaderBlock(code: string): { header: string; body: string } {
  let i = 0;
  let lastCommentEnd = 0;

  while (i < code.length) {
    while (i < code.length && /[\s]/.test(code[i])) i++;

    if (code[i] === '/' && code[i + 1] === '*') {
      i += 2;
      while (i < code.length && !(code[i] === '*' && code[i + 1] === '/')) i++;
      if (i < code.length) i += 2;
      lastCommentEnd = i;
    } else {
      break;
    }
  }

  if (lastCommentEnd === 0) return { header: '', body: code };
  return { header: code.slice(0, lastCommentEnd), body: code.slice(lastCommentEnd) };
}

function generateHeaderBlock(
  formulaName: string,
  config: FormatterConfig
): string {
  const date = new Date().toISOString().slice(0, 10);
  const author = config.headerAuthor || 'Author';
  const desc = config.headerDescription || 'Formula description';

  return (
    `/******************************************************************************\n` +
    ` * Formula Name  : ${formulaName}\n` +
    ` * Formula Type  : \n` +
    ` * Description   : ${desc}\n` +
    ` * Author        : ${author}\n` +
    ` * Date          : ${date}\n` +
    ` * Version       : 1.0\n` +
    ` *\n` +
    ` * Change History:\n` +
    ` * Date          Author          Description\n` +
    ` * ----------    -----------     -----------------------------------------\n` +
    ` * ${date} ${author.padEnd(15)} Initial creation\n` +
    ` ******************************************************************************/`
  );
}

// ─── Line-based helpers ──────────────────────────────────────────────────────

function uppercaseKeywordsInLine(line: string): string {
  let result = '';
  let i = 0;

  while (i < line.length) {
    // String literal (skip with escaped quote support)
    if (line[i] === "'") {
      const end = skipString(line, i);
      result += line.slice(i, end);
      i = end;
      continue;
    }

    // Block comment (skip)
    if (line[i] === '/' && line[i + 1] === '*') {
      const start = i;
      i += 2;
      while (i < line.length && !(line[i] === '*' && line[i + 1] === '/')) i++;
      if (i < line.length) i += 2;
      result += line.slice(start, i);
      continue;
    }

    // Word
    if (/[a-zA-Z_]/.test(line[i])) {
      const start = i;
      while (i < line.length && /[a-zA-Z0-9_]/.test(line[i])) i++;
      const word = line.slice(start, i);
      const upper = word.toUpperCase();

      if (/^l_/i.test(word) || /^dummy$/i.test(word)) {
        result += word;
      } else if (ALL_KEYWORDS.has(upper)) {
        result += upper;
      } else {
        result += word;
      }
      continue;
    }

    result += line[i];
    i++;
  }

  return result;
}

function getStrippedContent(line: string): string {
  let result = '';
  let i = 0;
  while (i < line.length) {
    if (line[i] === "'") {
      result += "'___'";
      const end = skipString(line, i);
      i = end;
      continue;
    }
    result += line[i];
    i++;
  }
  return result;
}

function isLogWriteLine(line: string): boolean {
  return /PAY_INTERNAL_LOG_WRITE/i.test(line);
}

function isCallFormulaStart(line: string): boolean {
  const stripped = getStrippedContent(line);
  return /CALL_FORMULA\s*\(/i.test(stripped);
}

function isChangeContextsStart(line: string): boolean {
  const stripped = getStrippedContent(line);
  return /CHANGE_CONTEXTS\s*\(/i.test(stripped);
}

function isReturnStatement(line: string): boolean {
  return /^\s*RETURN\b/i.test(line);
}

function countChar(str: string, ch: string): number {
  let count = 0;
  let inStr = false;
  let inComment = false;
  for (let i = 0; i < str.length; i++) {
    if (inComment) {
      if (str[i] === '*' && str[i + 1] === '/') {
        inComment = false;
        i++;
      }
      continue;
    }
    if (inStr) {
      if (str[i] === "'" && str[i + 1] === "'") { i++; continue; } // escaped quote
      if (str[i] === "'") inStr = false;
      continue;
    }
    if (str[i] === "'") { inStr = true; continue; }
    if (str[i] === '/' && str[i + 1] === '*') { inComment = true; i++; continue; }
    if (str[i] === ch) count++;
  }
  return count;
}

function formatCallFormula(lines: string[], startIdx: number, indentSize: number, baseIndent: number): { formatted: string[]; consumed: number } {
  let parenDepth = 0;
  let collected = '';
  let consumed = 0;

  for (let i = startIdx; i < lines.length; i++) {
    collected += (i === startIdx ? '' : ' ') + lines[i].trim();
    consumed++;
    parenDepth += countChar(lines[i], '(') - countChar(lines[i], ')');
    if (parenDepth <= 0) break;
  }

  const match = collected.match(/^(.*?)CALL_FORMULA\s*\(\s*(.+)$/i);
  if (!match) return { formatted: [collected], consumed };

  const prefix = match[1];
  const rest = match[2];

  const lastParen = rest.lastIndexOf(')');
  if (lastParen === -1) return { formatted: [collected], consumed };
  const paramsStr = rest.slice(0, lastParen);

  const params = splitByComma(paramsStr);
  if (params.length === 0) return { formatted: [collected], consumed };

  const indent = ' '.repeat(baseIndent * indentSize);
  const paramIndent = indent + ' '.repeat(indentSize);

  if (params.length <= 2 && collected.length < 120) {
    return { formatted: [indent + collected.trim()], consumed };
  }

  const result: string[] = [];
  const prefixStr = prefix.trim();

  if (prefixStr) {
    result.push(indent + prefixStr + `CALL_FORMULA(${params[0].trim()}`);
  } else {
    result.push(indent + `CALL_FORMULA(${params[0].trim()}`);
  }

  for (let p = 1; p < params.length; p++) {
    const param = params[p].trim();
    const isLast = p === params.length - 1;
    result.push(paramIndent + ',' + param + (isLast ? ')' : ''));
  }

  const lastLine = result[result.length - 1];
  if (!lastLine.trimEnd().endsWith(')')) {
    result[result.length - 1] = lastLine + ')';
  }

  return { formatted: result, consumed };
}

function splitByComma(str: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let inStr = false;
  let current = '';

  for (let i = 0; i < str.length; i++) {
    if (inStr) {
      current += str[i];
      if (str[i] === "'" && str[i + 1] === "'") { current += str[i + 1]; i++; continue; } // escaped
      if (str[i] === "'") inStr = false;
      continue;
    }
    if (str[i] === "'") { inStr = true; current += str[i]; continue; }
    if (str[i] === '(') { depth++; current += str[i]; continue; }
    if (str[i] === ')') { depth--; current += str[i]; continue; }
    if (str[i] === ',' && depth === 0) {
      parts.push(current);
      current = '';
      continue;
    }
    current += str[i];
  }
  if (current.trim()) parts.push(current);
  return parts;
}

// ─── Statistics ──────────────────────────────────────────────────────────────
export interface FormatStats {
  originalLines: number;
  formattedLines: number;
  keywordsUppercased: number;
  maxIndentDepth: number;
  blankLinesNormalized: number;
  headerAction: 'preserved' | 'added' | 'none';
}

function computeStats(
  original: string,
  formatted: string,
  config: FormatterConfig,
  hadHeader: boolean,
  addedHeader: boolean
): FormatStats {
  const origLines = original.split('\n');
  const fmtLines = formatted.split('\n');

  let keywordsUppercased = 0;
  if (config.uppercaseKeywords) {
    // Count keywords that were lowercased in original but uppercased in formatted
    const origOutside = original.replace(/'[^']*'/g, "''").replace(/\/\*[\s\S]*?\*\//g, '');
    ALL_KEYWORDS.forEach((kw) => {
      const lower = kw.toLowerCase();
      const regex = new RegExp(`\\b${lower}\\b`, 'g');
      const matches = origOutside.match(regex);
      if (matches) keywordsUppercased += matches.length;
    });
  }

  let maxIndentDepth = 0;
  for (const line of fmtLines) {
    if (line.trim().length === 0) continue;
    const leadingSpaces = line.match(/^( *)/)?.[1]?.length || 0;
    const depth = config.indentSize > 0 ? Math.floor(leadingSpaces / config.indentSize) : 0;
    if (depth > maxIndentDepth) maxIndentDepth = depth;
  }

  // Count blank lines difference
  const origBlanks = origLines.filter((l) => l.trim() === '').length;
  const fmtBlanks = fmtLines.filter((l) => l.trim() === '').length;

  return {
    originalLines: origLines.length,
    formattedLines: fmtLines.length,
    keywordsUppercased,
    maxIndentDepth,
    blankLinesNormalized: Math.abs(origBlanks - fmtBlanks),
    headerAction: hadHeader ? 'preserved' : addedHeader ? 'added' : 'none',
  };
}

// ─── Main format function ────────────────────────────────────────────────────
export function formatFormula(
  code: string,
  config: FormatterConfig
): { formatted: string; warnings: Warning[]; stats: FormatStats } {
  const emptyStats: FormatStats = {
    originalLines: 0, formattedLines: 0, keywordsUppercased: 0,
    maxIndentDepth: 0, blankLinesNormalized: 0, headerAction: 'none',
  };

  if (!code.trim()) {
    return {
      formatted: '',
      warnings: [{ rowIndex: -1, id: 'EMPTY_INPUT', message: 'No formula code provided. Paste code or upload a file.' }],
      stats: emptyStats,
    };
  }

  const warnings: Warning[] = [];

  // Check parentheses balance
  const openParens = countChar(code, '(');
  const closeParens = countChar(code, ')');
  if (openParens !== closeParens) {
    warnings.push({
      rowIndex: -1,
      id: 'UNBALANCED_PARENS',
      message: `Unbalanced parentheses detected: ${openParens} opening vs ${closeParens} closing. Output may not be correctly formatted.`,
    });
  }

  // Scan for unclosed comments/strings
  warnings.push(...scanForWarnings(code));

  // Separate header from body
  const existingHeader = hasExistingHeader(code);
  let headerPart = '';
  let bodyCode = code;

  if (existingHeader) {
    const { header, body } = extractHeaderBlock(code);
    headerPart = header;
    bodyCode = body;
  }

  // Format body lines
  const rawLines = bodyCode.split('\n');
  const formattedLines: string[] = [];
  let indent = 0;
  let inBlockComment = false;
  let inInputsAre = false;
  let i = 0;

  while (i < rawLines.length) {
    const line = rawLines[i];
    const trimmed = line.trim();

    if (trimmed === '') {
      if (formattedLines.length > 0 && formattedLines[formattedLines.length - 1].trim() !== '') {
        formattedLines.push('');
      }
      i++;
      continue;
    }

    if (inBlockComment) {
      formattedLines.push(' '.repeat(indent * config.indentSize) + trimmed);
      if (trimmed.includes('*/')) {
        inBlockComment = false;
      }
      i++;
      continue;
    }

    if (trimmed.startsWith('/*')) {
      if (trimmed.includes('*/')) {
        formattedLines.push(' '.repeat(indent * config.indentSize) + trimmed);
      } else {
        inBlockComment = true;
        formattedLines.push(' '.repeat(indent * config.indentSize) + trimmed);
      }
      i++;
      continue;
    }

    if (isLogWriteLine(trimmed)) {
      const processed = config.uppercaseKeywords ? uppercaseKeywordsInLine(trimmed) : trimmed;
      formattedLines.push(' '.repeat(indent * config.indentSize) + processed);
      i++;
      continue;
    }

    if (isReturnStatement(trimmed)) {
      const processed = config.uppercaseKeywords ? uppercaseKeywordsInLine(trimmed) : trimmed;
      formattedLines.push(' '.repeat(indent * config.indentSize) + processed);
      i++;
      continue;
    }

    // INPUTS ARE continuation
    if (inInputsAre) {
      const processed = config.uppercaseKeywords ? uppercaseKeywordsInLine(trimmed) : trimmed;
      formattedLines.push(' '.repeat((indent + 1) * config.indentSize) + processed);
      if (!trimmed.endsWith(',')) {
        inInputsAre = false;
      }
      i++;
      continue;
    }

    if (/^INPUTS\s+ARE\b/i.test(trimmed)) {
      const processed = config.uppercaseKeywords ? uppercaseKeywordsInLine(trimmed) : trimmed;
      formattedLines.push(' '.repeat(indent * config.indentSize) + processed);
      if (trimmed.endsWith(',')) {
        inInputsAre = true;
      }
      i++;
      continue;
    }

    // CALL_FORMULA
    if (isCallFormulaStart(trimmed)) {
      const remainingLines = rawLines.slice(i);
      const { formatted, consumed } = formatCallFormula(remainingLines, 0, config.indentSize, indent);
      for (const fl of formatted) {
        const processed = config.uppercaseKeywords ? uppercaseKeywordsInLine(fl) : fl;
        formattedLines.push(processed);
      }
      i += consumed;
      continue;
    }

    // CHANGE_CONTEXTS
    if (isChangeContextsStart(trimmed) && !isLogWriteLine(trimmed)) {
      const processed = config.uppercaseKeywords ? uppercaseKeywordsInLine(trimmed) : trimmed;
      formattedLines.push(' '.repeat(indent * config.indentSize) + processed);
      const opens = countChar(trimmed, '(');
      const closes = countChar(trimmed, ')');
      if (opens > closes) {
        indent += (opens - closes);
      }
      i++;
      continue;
    }

    // Closing parens on their own
    if (/^\)+$/.test(trimmed)) {
      const parenCount = trimmed.length;
      indent = Math.max(0, indent - parenCount);
      formattedLines.push(' '.repeat(indent * config.indentSize) + trimmed);
      i++;
      continue;
    }

    // Lines starting with )
    if (trimmed.startsWith(')')) {
      indent = Math.max(0, indent - 1);
    }

    // Dedent for ELSE
    const strippedForKeyword = getStrippedContent(trimmed);
    if (/^ELSE\b/i.test(strippedForKeyword) && !trimmed.startsWith(')')) {
      indent = Math.max(0, indent - 1);
    }

    const processed = config.uppercaseKeywords ? uppercaseKeywordsInLine(trimmed) : trimmed;
    formattedLines.push(' '.repeat(indent * config.indentSize) + processed);

    // If line ends with ( — indent next line
    if (trimmed.endsWith('(')) {
      indent++;
    }

    i++;
  }

  // Build the result
  let result = '';
  let addedHeader = false;

  if (existingHeader) {
    result = headerPart.trim() + '\n\n';
  } else if (config.addHeaderBlock) {
    const formulaName = extractFormulaName(code);
    result = generateHeaderBlock(formulaName, config) + '\n\n';
    addedHeader = true;
  }

  const cleaned = formattedLines
    .map((l) => l.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  result += cleaned + '\n';

  const stats = computeStats(code, result, config, existingHeader, addedHeader);

  return { formatted: result, warnings, stats };
}

function extractFormulaName(code: string): string {
  const nameMatch = code.match(/Formula\s+Name\s*[:=]\s*(\S+)/i);
  if (nameMatch) return nameMatch[1];
  const aliasMatch = code.match(/ALIAS\s+\w+\s+AS\s+'([^']+)'/i);
  if (aliasMatch) return aliasMatch[1];
  return 'FORMULA_NAME';
}

export function extractFormulaNameFromCode(code: string): string {
  return extractFormulaName(code);
}

// ─── Simple line diff ────────────────────────────────────────────────────────
export type DiffLineType = 'same' | 'added' | 'removed' | 'modified';

export interface DiffLine {
  type: DiffLineType;
  leftNum?: number;
  rightNum?: number;
  leftText?: string;
  rightText?: string;
}

export function computeDiff(original: string, formatted: string): DiffLine[] {
  const origLines = original.split('\n');
  const fmtLines = formatted.split('\n');
  const result: DiffLine[] = [];

  // Simple LCS-based diff
  const m = origLines.length;
  const n = fmtLines.length;

  // Build LCS table
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (origLines[i - 1].trim() === fmtLines[j - 1].trim()) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find diff
  const diff: Array<{ type: 'same' | 'removed' | 'added'; origIdx?: number; fmtIdx?: number }> = [];
  let oi = m, fi = n;
  while (oi > 0 || fi > 0) {
    if (oi > 0 && fi > 0 && origLines[oi - 1].trim() === fmtLines[fi - 1].trim()) {
      diff.unshift({ type: 'same', origIdx: oi - 1, fmtIdx: fi - 1 });
      oi--;
      fi--;
    } else if (fi > 0 && (oi === 0 || dp[oi][fi - 1] >= dp[oi - 1][fi])) {
      diff.unshift({ type: 'added', fmtIdx: fi - 1 });
      fi--;
    } else {
      diff.unshift({ type: 'removed', origIdx: oi - 1 });
      oi--;
    }
  }

  // Convert to DiffLine array, merging adjacent removed+added as modified
  let idx = 0;
  while (idx < diff.length) {
    const d = diff[idx];
    if (d.type === 'same') {
      result.push({
        type: 'same',
        leftNum: d.origIdx! + 1,
        rightNum: d.fmtIdx! + 1,
        leftText: origLines[d.origIdx!],
        rightText: fmtLines[d.fmtIdx!],
      });
      idx++;
    } else if (d.type === 'removed' && idx + 1 < diff.length && diff[idx + 1].type === 'added') {
      result.push({
        type: 'modified',
        leftNum: d.origIdx! + 1,
        rightNum: diff[idx + 1].fmtIdx! + 1,
        leftText: origLines[d.origIdx!],
        rightText: fmtLines[diff[idx + 1].fmtIdx!],
      });
      idx += 2;
    } else if (d.type === 'removed') {
      result.push({
        type: 'removed',
        leftNum: d.origIdx! + 1,
        leftText: origLines[d.origIdx!],
      });
      idx++;
    } else {
      result.push({
        type: 'added',
        rightNum: d.fmtIdx! + 1,
        rightText: fmtLines[d.fmtIdx!],
      });
      idx++;
    }
  }

  return result;
}
