// Hardcoded-string scanner for Angular templates.
// Detects literal user-facing text that bypasses the translate pipe.

import { readFileSync, globSync } from 'node:fs';
import { resolve, relative } from 'node:path';

const MIN_LEN = 2;

const IGNORE_PATTERNS = [
  /^\s*$/,
  /^[{}()\[\]<>\/\\.,:;|=+\-*#@!?&%$^~`'"]+$/,
  /^&\w+;$/,
  /^\d+(\.\d+)?$/,
  /^(true|false|null|undefined)$/i,
  /^#[0-9a-fA-F]{3,8}$/,
  /^rgb/i,
  /^(px|em|rem|%|vh|vw|ms|s)$/,
  /^[\w.-]+@[\w.-]+$/,
  /^https?:\/\//,
  /^assets\//,
  /^\//,
  /^{{.*}}$/s,
  /^[A-Z_][A-Z_0-9]*$/,
  /^\s*\|/,
  /translate/,
  /^(ltr|rtl|auto)$/,
  /^(button|submit|reset|text|password|email|number|checkbox|radio|hidden|file|date|time|url|tel|search|range|color)$/i,
  /^(row|column|start|end|center|flex-start|flex-end|space-between|space-around|stretch|baseline|wrap|nowrap|inherit|initial|none|block|inline|grid|absolute|relative|fixed|sticky)$/i,
  /^(click|change|input|submit|blur|focus|keydown|keyup|keypress|mouseenter|mouseleave|scroll)$/i,
];

const NON_TEXT_ELEMENTS = new Set([
  'script', 'style', 'mat-icon', 'svg', 'path', 'circle', 'rect',
  'line', 'polygon', 'polyline', 'ellipse', 'defs', 'clipPath',
  'linearGradient', 'stop', 'radialGradient', 'pattern', 'mask',
  'symbol', 'use', 'animate', 'metadata',
]);

function shouldIgnore(text) {
  if (text.length < MIN_LEN) return true;
  return IGNORE_PATTERNS.some(re => re.test(text));
}

function hasWord(text) {
  return /[a-zA-Z؀-ۿ]/.test(text);
}

function isInsideElement(content, matchIndex, tagNames) {
  const before = content.substring(0, matchIndex);
  const lastOpen = before.lastIndexOf('<');
  if (lastOpen === -1) return false;
  const tagMatch = before.substring(lastOpen).match(/^<([\w-]+)/);
  return tagMatch && tagNames.has(tagMatch[1]);
}

export function scanTemplate(content) {
  const findings = [];
  const lines = content.split('\n');
  let offset = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    if (line.includes('| translate') || line.includes('| async')) {
      offset += line.length + 1;
      continue;
    }
    if (/^\s*<!--/.test(line)) {
      offset += line.length + 1;
      continue;
    }

    for (const m of line.matchAll(/>([^<{}>]+)</g)) {
      const text = m[1].trim();
      if (!shouldIgnore(text) && hasWord(text)) {
        if (isInsideElement(content, offset + m.index, NON_TEXT_ELEMENTS)) continue;
        findings.push({ line: lineNum, text, type: 'text-content' });
      }
    }

    for (const m of line.matchAll(/(?<!\[)\b(placeholder|title|aria-label|alt|matTooltip)\s*=\s*"([^"]*?)"/g)) {
      const val = m[2].trim();
      if (!shouldIgnore(val) && hasWord(val) && !val.includes('{{')) {
        findings.push({ line: lineNum, text: val, type: `attr:${m[1]}` });
      }
    }

    offset += line.length + 1;
  }
  return findings;
}

export function scanFiles(sourceGlobs, cwd) {
  const results = [];
  for (const pattern of sourceGlobs) {
    for (const file of globSync(pattern, { cwd })) {
      const absPath = resolve(cwd, file);
      const content = readFileSync(absPath, 'utf-8');
      const findings = scanTemplate(content);
      if (findings.length > 0) {
        results.push({ file: relative(cwd, absPath), findings });
      }
    }
  }
  return results;
}
