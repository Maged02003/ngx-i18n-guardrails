// Locale parity checker.
// Reports: missing keys across locales, empty values, and optionally
// unreferenced (zombie) keys if source globs are provided.

import { readFileSync, globSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { flatKeys, getVal } from './utils.mjs';

export function loadLocales(files) {
  const locales = new Map();
  for (const f of files) {
    const raw = JSON.parse(readFileSync(f, 'utf-8'));
    locales.set(basename(f, '.json'), { raw, keys: new Set(flatKeys(raw)) });
  }
  return locales;
}

export function checkParity(locales) {
  const allKeys = new Set();
  for (const { keys } of locales.values()) keys.forEach(k => allKeys.add(k));

  const errors = [];
  const warnings = [];

  for (const key of [...allKeys].sort()) {
    const present = [...locales.entries()].filter(([, v]) => v.keys.has(key)).map(([n]) => n);
    const missing = [...locales.entries()].filter(([, v]) => !v.keys.has(key)).map(([n]) => n);
    if (missing.length > 0) {
      errors.push({ type: 'missing', key, missing, present });
    }
  }

  for (const [name, { raw, keys }] of locales) {
    for (const key of keys) {
      const val = getVal(raw, key);
      if (typeof val === 'string' && val.trim() === '') {
        warnings.push({ type: 'empty', key, locale: name });
      }
    }
  }

  return { errors, warnings, totalKeys: allKeys.size };
}

export function collectSourceKeys(sourceGlobs, cwd) {
  const keys = new Set();
  const pipeRe = /['"`]([a-zA-Z][\w.]+)['"`]\s*\|\s*translate/g;
  const instantRe = /\.(?:instant|get|stream)\(\s*['"`]([a-zA-Z][\w.]+)['"`]/g;

  for (const pattern of sourceGlobs) {
    for (const file of globSync(pattern, { cwd })) {
      const content = readFileSync(resolve(cwd, file), 'utf-8');
      for (const re of [pipeRe, instantRe]) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(content)) !== null) {
          keys.add(m[1]);
        }
      }
    }
  }
  return keys;
}

export function findZombies(locales, sourceKeys) {
  const allLocaleKeys = new Set();
  for (const { keys } of locales.values()) keys.forEach(k => allLocaleKeys.add(k));

  return [...allLocaleKeys].filter(k => !sourceKeys.has(k)).sort();
}
