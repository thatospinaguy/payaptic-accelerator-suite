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
];

const ALL_KEYWORDS = new Set([
  ...CONTROL_FLOW,
  ...DECLARATIONS,
  ...LOGICAL_OPS,
  ...TYPE_KEYWORDS,
  ...FUNCTION_KEYWORDS,
]);

// ─── Token types ─────────────────────────────────────────────────────────────
type TokenType =
  | 'COMMENT'
  | 'STRING'
  | 'KEYWORD'
  | 'IDENTIFIER'
  | 'OPERATOR'
  | 'PAREN_OPEN'
  | 'PAREN_CLOSE'
  | 'COMMA'
  | 'NEWLINE'
  | 'WHITESPACE'
  | 'OTHER';

interface Token {
  type: TokenType;
  value: string;
  original: string; // preserve original casing
}

// ─── Tokenizer ───────────────────────────────────────────────────────────────
function tokenize(code: string): { tokens: Token[]; warnings: Warning[] } {
  const tokens: Token[] = [];
  const warnings: Warning[] = [];
  let i = 0;
  let lineNum = 1;

  while (i < code.length) {
    // Block comment /* ... */
    if (code[i] === '/' && code[i + 1] === '*') {
      const start = i;
      i += 2;
      while (i < code.length && !(code[i] === '*' && code[i + 1] === '/')) {
        if (code[i] === '\n') lineNum++;
        i++;
      }
      if (i >= code.length) {
        warnings.push({
          rowIndex: -1,
          id: 'UNCLOSED_COMMENT',
          message: `Unclosed block comment detected starting near line ${lineNum}.`,
        });
        tokens.push({ type: 'COMMENT', value: code.slice(start), original: code.slice(start) });
      } else {
        i += 2; // skip */
        tokens.push({ type: 'COMMENT', value: code.slice(start, i), original: code.slice(start, i) });
      }
      continue;
    }

    // String literal 'single quotes'
    if (code[i] === "'") {
      const start = i;
      const startLine = lineNum;
      i++;
      while (i < code.length && code[i] !== "'") {
        if (code[i] === '\n') lineNum++;
        i++;
      }
      if (i >= code.length) {
        warnings.push({
          rowIndex: -1,
          id: 'UNCLOSED_STRING',
          message: `Unclosed string literal detected near line ${startLine}.`,
        });
        tokens.push({ type: 'STRING', value: code.slice(start), original: code.slice(start) });
      } else {
        i++; // skip closing quote
        tokens.push({ type: 'STRING', value: code.slice(start, i), original: code.slice(start, i) });
      }
      continue;
    }

    // Newline
    if (code[i] === '\n') {
      tokens.push({ type: 'NEWLINE', value: '\n', original: '\n' });
      lineNum++;
      i++;
      continue;
    }

    // Whitespace (not newline)
    if (/[ \t\r]/.test(code[i])) {
      const start = i;
      while (i < code.length && /[ \t\r]/.test(code[i])) i++;
      tokens.push({ type: 'WHITESPACE', value: code.slice(start, i), original: code.slice(start, i) });
      continue;
    }

    // Parentheses
    if (code[i] === '(') {
      tokens.push({ type: 'PAREN_OPEN', value: '(', original: '(' });
      i++;
      continue;
    }
    if (code[i] === ')') {
      tokens.push({ type: 'PAREN_CLOSE', value: ')', original: ')' });
      i++;
      continue;
    }

    // Comma
    if (code[i] === ',') {
      tokens.push({ type: 'COMMA', value: ',', original: ',' });
      i++;
      continue;
    }

    // Operators: ||, >=, <=, <>, =, <, >, +, -, *, /
    if (code[i] === '|' && code[i + 1] === '|') {
      tokens.push({ type: 'OPERATOR', value: '||', original: '||' });
      i += 2;
      continue;
    }
    if (code[i] === '>' && code[i + 1] === '=') {
      tokens.push({ type: 'OPERATOR', value: '>=', original: '>=' });
      i += 2;
      continue;
    }
    if (code[i] === '<' && code[i + 1] === '>') {
      tokens.push({ type: 'OPERATOR', value: '<>', original: '<>' });
      i += 2;
      continue;
    }
    if (code[i] === '<' && code[i + 1] === '=') {
      tokens.push({ type: 'OPERATOR', value: '<=', original: '<=' });
      i += 2;
      continue;
    }
    if ('=<>'.includes(code[i])) {
      tokens.push({ type: 'OPERATOR', value: code[i], original: code[i] });
      i++;
      continue;
    }
    if ('+-*/'.includes(code[i]) && !(code[i] === '/' && code[i + 1] === '*')) {
      tokens.push({ type: 'OPERATOR', value: code[i], original: code[i] });
      i++;
      continue;
    }

    // Word (identifier or keyword)
    if (/[a-zA-Z_$]/.test(code[i])) {
      const start = i;
      while (i < code.length && /[a-zA-Z0-9_$]/.test(code[i])) i++;
      const word = code.slice(start, i);
      const upper = word.toUpperCase();
      if (ALL_KEYWORDS.has(upper)) {
        tokens.push({ type: 'KEYWORD', value: upper, original: word });
      } else {
        tokens.push({ type: 'IDENTIFIER', value: word, original: word });
      }
      continue;
    }

    // Number
    if (/[0-9]/.test(code[i])) {
      const start = i;
      while (i < code.length && /[0-9.]/.test(code[i])) i++;
      tokens.push({ type: 'OTHER', value: code.slice(start, i), original: code.slice(start, i) });
      continue;
    }

    // Anything else
    tokens.push({ type: 'OTHER', value: code[i], original: code[i] });
    i++;
  }

  return { tokens, warnings };
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
  // Find all leading block comments (possibly separated by whitespace/newlines)
  let i = 0;
  let lastCommentEnd = 0;

  while (i < code.length) {
    // Skip whitespace/newlines
    while (i < code.length && /[\s]/.test(code[i])) i++;

    if (code[i] === '/' && code[i + 1] === '*') {
      // Found a comment block
      i += 2;
      while (i < code.length && !(code[i] === '*' && code[i + 1] === '/')) i++;
      if (i < code.length) i += 2; // skip */
      lastCommentEnd = i;
    } else {
      break;
    }
  }

  if (lastCommentEnd === 0) return { header: '', body: code };

  const header = code.slice(0, lastCommentEnd);
  const body = code.slice(lastCommentEnd);
  return { header, body };
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

// ─── Line-based formatter ────────────────────────────────────────────────────
// We format by working on cleaned-up lines, applying indentation and keyword
// uppercasing while preserving strings and comments.

function uppercaseKeywordsInLine(line: string): string {
  // Tokenize the line carefully, preserving strings and comments
  let result = '';
  let i = 0;

  while (i < line.length) {
    // String literal
    if (line[i] === "'") {
      const start = i;
      i++;
      while (i < line.length && line[i] !== "'") i++;
      if (i < line.length) i++;
      result += line.slice(start, i);
      continue;
    }

    // Block comment start (might be partial on this line)
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

      // Don't uppercase l_ prefixed variables, or variables like LOG_EE_ID, l_anything, dummy, flsa_split_preference
      if (/^l_/i.test(word) || /^dummy$/i.test(word) || /^flsa_split_preference$/i.test(word)) {
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

function isInsideComment(lines: string[], lineIndex: number): boolean {
  // Check if lineIndex is inside a multi-line block comment
  let inComment = false;
  for (let i = 0; i <= lineIndex; i++) {
    const line = lines[i];
    let j = 0;
    while (j < line.length) {
      if (inComment) {
        if (line[j] === '*' && line[j + 1] === '/') {
          inComment = false;
          j += 2;
          continue;
        }
        j++;
      } else {
        if (line[j] === "'" ) {
          j++;
          while (j < line.length && line[j] !== "'") j++;
          if (j < line.length) j++;
          continue;
        }
        if (line[j] === '/' && line[j + 1] === '*') {
          inComment = true;
          j += 2;
          continue;
        }
        j++;
      }
    }
  }
  return inComment;
}

function getStrippedContent(line: string): string {
  // Return line content with strings replaced by placeholders (for keyword detection)
  let result = '';
  let i = 0;
  while (i < line.length) {
    if (line[i] === "'") {
      result += "'___'";
      i++;
      while (i < line.length && line[i] !== "'") i++;
      if (i < line.length) i++;
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
  // Collect all lines that make up this CALL_FORMULA block
  let parenDepth = 0;
  let collected = '';
  let consumed = 0;

  for (let i = startIdx; i < lines.length; i++) {
    collected += (i === startIdx ? '' : ' ') + lines[i].trim();
    consumed++;
    parenDepth += countChar(lines[i], '(') - countChar(lines[i], ')');
    if (parenDepth <= 0) break;
  }

  // Parse the CALL_FORMULA call
  // Pattern: [prefix]CALL_FORMULA('name', param1, param2, ...)
  const match = collected.match(/^(.*?)CALL_FORMULA\s*\(\s*(.+)$/i);
  if (!match) return { formatted: [collected], consumed };

  const prefix = match[1]; // e.g., empty, or "l_dummy = "
  const rest = match[2];

  // Remove trailing )
  const lastParen = rest.lastIndexOf(')');
  if (lastParen === -1) return { formatted: [collected], consumed };
  const paramsStr = rest.slice(0, lastParen);

  // Split by commas, but respect parentheses and strings
  const params = splitByComma(paramsStr);
  if (params.length === 0) return { formatted: [collected], consumed };

  const indent = ' '.repeat(baseIndent * indentSize);
  const paramIndent = indent + ' '.repeat(indentSize);

  // If it's a short, inline call (e.g., 3 or fewer params, all short), keep on one line
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

  // If the last line doesn't end with ), add it
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
      if (str[i] === "'") inStr = false;
      continue;
    }
    if (str[i] === "'") {
      inStr = true;
      current += str[i];
      continue;
    }
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

// ─── Main format function ────────────────────────────────────────────────────
export function formatFormula(
  code: string,
  config: FormatterConfig
): { formatted: string; warnings: Warning[] } {
  if (!code.trim()) {
    return {
      formatted: '',
      warnings: [{ rowIndex: -1, id: 'EMPTY_INPUT', message: 'No formula code provided. Paste code or upload a file.' }],
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

  // Tokenize for unclosed comment/string warnings
  const tokenResult = tokenize(code);
  warnings.push(...tokenResult.warnings);

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
  let inInputsAre = false; // track INPUTS ARE continuation lines
  let i = 0;

  while (i < rawLines.length) {
    let line = rawLines[i];
    const trimmed = line.trim();

    // Skip empty lines but don't accumulate more than one blank line
    if (trimmed === '') {
      // Add at most one blank line
      if (formattedLines.length > 0 && formattedLines[formattedLines.length - 1].trim() !== '') {
        formattedLines.push('');
      }
      i++;
      continue;
    }

    // Handle block comments that span multiple lines
    if (inBlockComment) {
      formattedLines.push(' '.repeat(indent * config.indentSize) + trimmed);
      if (trimmed.includes('*/')) {
        inBlockComment = false;
      }
      i++;
      continue;
    }

    // Block comment on this line
    if (trimmed.startsWith('/*')) {
      // Check if comment closes on same line
      if (trimmed.includes('*/')) {
        formattedLines.push(' '.repeat(indent * config.indentSize) + trimmed);
      } else {
        inBlockComment = true;
        formattedLines.push(' '.repeat(indent * config.indentSize) + trimmed);
      }
      i++;
      continue;
    }

    // PAY_INTERNAL_LOG_WRITE — keep on single line
    if (isLogWriteLine(trimmed)) {
      const processed = config.uppercaseKeywords ? uppercaseKeywordsInLine(trimmed) : trimmed;
      formattedLines.push(' '.repeat(indent * config.indentSize) + processed);
      i++;
      continue;
    }

    // RETURN statement — keep on single line
    if (isReturnStatement(trimmed)) {
      const processed = config.uppercaseKeywords ? uppercaseKeywordsInLine(trimmed) : trimmed;
      formattedLines.push(' '.repeat(indent * config.indentSize) + processed);
      i++;
      continue;
    }

    // INPUTS ARE continuation lines — indent continuations
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

    // CALL_FORMULA handling
    if (isCallFormulaStart(trimmed)) {
      // Collect the full CALL_FORMULA block
      const remainingLines = rawLines.slice(i);
      const { formatted, consumed } = formatCallFormula(remainingLines, 0, config.indentSize, indent);
      for (const fl of formatted) {
        const processed = config.uppercaseKeywords ? uppercaseKeywordsInLine(fl) : fl;
        formattedLines.push(processed);
      }
      i += consumed;
      continue;
    }

    // CHANGE_CONTEXTS handling
    if (isChangeContextsStart(trimmed) && !isLogWriteLine(trimmed)) {
      const processed = config.uppercaseKeywords ? uppercaseKeywordsInLine(trimmed) : trimmed;
      formattedLines.push(' '.repeat(indent * config.indentSize) + processed);

      // Count parens on this line to see if we need to increase indent
      const opens = countChar(trimmed, '(');
      const closes = countChar(trimmed, ')');

      // If more opens than closes, the block body is indented
      if (opens > closes) {
        indent += (opens - closes);
      }
      i++;
      continue;
    }

    // Closing paren on its own line
    if (trimmed === ')' || trimmed === ') )' || /^\)+$/.test(trimmed)) {
      const parenCount = (trimmed.match(/\)/g) || []).length;
      indent = Math.max(0, indent - parenCount);
      const processed = config.uppercaseKeywords ? uppercaseKeywordsInLine(trimmed) : trimmed;
      formattedLines.push(' '.repeat(indent * config.indentSize) + processed);
      i++;
      continue;
    }

    // Lines that start with ) and have more content like ) ELSE (
    if (trimmed.startsWith(')')) {
      indent = Math.max(0, indent - 1);
    }

    // Dedent for ELSE
    const strippedForKeyword = getStrippedContent(trimmed);
    if (/^ELSE\b/i.test(strippedForKeyword) && !trimmed.startsWith(')')) {
      indent = Math.max(0, indent - 1);
    }

    // Apply keyword uppercasing
    const processed = config.uppercaseKeywords ? uppercaseKeywordsInLine(trimmed) : trimmed;
    formattedLines.push(' '.repeat(indent * config.indentSize) + processed);

    // Indent after IF (that doesn't have THEN on same line opening a paren block), ELSE, opening paren at end
    const upperTrimmed = strippedForKeyword.toUpperCase();

    // If line ends with ( — indent next line
    if (trimmed.endsWith('(')) {
      indent++;
    }
    // ELSE without ( on same line: do NOT bump indent here.
    // The ( on the next line will handle it. This prevents double-indent
    // when ELSE and ( are on separate lines.

    i++;
  }

  // Build the result
  let result = '';

  if (existingHeader) {
    result = headerPart.trim() + '\n\n';
  } else if (config.addHeaderBlock) {
    // Try to extract formula name from the code
    const formulaName = extractFormulaName(code);
    result = generateHeaderBlock(formulaName, config) + '\n\n';
  }

  // Clean up: trim trailing whitespace, collapse multiple blank lines
  const cleaned = formattedLines
    .map((l) => l.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  result += cleaned + '\n';

  return { formatted: result, warnings };
}

function extractFormulaName(code: string): string {
  // Try to find formula name from header comments
  const nameMatch = code.match(/Formula\s+Name\s*[:=]\s*(\S+)/i);
  if (nameMatch) return nameMatch[1];

  // Try to find from ALIAS or DEFAULT patterns
  const aliasMatch = code.match(/ALIAS\s+\w+\s+AS\s+'([^']+)'/i);
  if (aliasMatch) return aliasMatch[1];

  return 'FORMULA_NAME';
}

export function extractFormulaNameFromCode(code: string): string {
  return extractFormulaName(code);
}
