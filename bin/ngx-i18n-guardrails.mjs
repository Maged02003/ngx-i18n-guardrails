#!/usr/bin/env node
// ngx-i18n-guardrails CLI
// Subcommands: pseudo, check, scan

import { readFileSync, writeFileSync, globSync } from 'node:fs';
import { resolve } from 'node:path';
import { transformObj } from '../src/pseudo.mjs';
import { loadLocales, checkParity, collectSourceKeys, findZombies } from '../src/check.mjs';
import { scanFiles } from '../src/scan.mjs';

const args = process.argv.slice(2);
const command = args[0];

function flag(name) {
  const idx = args.indexOf(name);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

function printUsage() {
  console.log(`
  ngx-i18n-guardrails <command> [options]

  Commands:
    pseudo  --in <base.json> --out <pseudo.json>
            Generate a pseudo-localized JSON file from a base locale.

    check   --locales "<glob>" [--source "<glob>"]
            Check cross-locale key parity, empty values, and optionally zombie keys.

    scan    --source "<glob>"
            Scan Angular templates for hardcoded user-facing strings.

  Examples:
    npx ngx-i18n-guardrails pseudo --in src/assets/i18n/en.json --out src/assets/i18n/pseudo.json
    npx ngx-i18n-guardrails check --locales "src/assets/i18n/*.json"
    npx ngx-i18n-guardrails check --locales "src/assets/i18n/*.json" --source "src/app/**/*.{html,ts}"
    npx ngx-i18n-guardrails scan --source "src/app/**/*.html"
`);
}

if (!command || command === '--help' || command === '-h') {
  printUsage();
  process.exit(0);
}

const cwd = process.cwd();

if (command === 'pseudo') {
  const inFile = flag('--in');
  const outFile = flag('--out');
  if (!inFile || !outFile) {
    console.error('  Error: --in and --out are required.\n');
    printUsage();
    process.exit(1);
  }
  const base = JSON.parse(readFileSync(resolve(cwd, inFile), 'utf-8'));
  const pseudo = transformObj(base);
  writeFileSync(resolve(cwd, outFile), JSON.stringify(pseudo, null, 2) + '\n', 'utf-8');
  console.log(`  Generated ${outFile}`);
}

else if (command === 'check') {
  const localesGlob = flag('--locales');
  const sourceGlob = flag('--source');
  if (!localesGlob) {
    console.error('  Error: --locales is required.\n');
    printUsage();
    process.exit(1);
  }

  const localeFiles = globSync(localesGlob, { cwd }).map(f => resolve(cwd, f));
  if (localeFiles.length < 2) {
    console.error(`  Error: Need at least 2 locale files, found ${localeFiles.length}.\n`);
    process.exit(1);
  }

  const locales = loadLocales(localeFiles);
  const { errors, warnings, totalKeys } = checkParity(locales);

  console.log(`\n  Locales: ${[...locales.keys()].join(', ')}  (${totalKeys} unique keys)\n`);

  for (const e of errors) {
    console.log(`  ERROR   Missing key "${e.key}" in: ${e.missing.join(', ')}  (exists in: ${e.present.join(', ')})`);
  }
  for (const w of warnings) {
    console.log(`  WARN    Empty value for "${w.key}" in ${w.locale}.json`);
  }

  if (sourceGlob) {
    const sourceKeys = collectSourceKeys([sourceGlob], cwd);
    const zombies = findZombies(locales, sourceKeys);
    if (zombies.length > 0) {
      console.log(`\n  Zombie keys (${zombies.length} in locale files, not found in source):`);
      for (const z of zombies.slice(0, 20)) {
        console.log(`  WARN    "${z}"`);
      }
      if (zombies.length > 20) {
        console.log(`  ... and ${zombies.length - 20} more`);
      }
    }
  }

  console.log(`\n  Summary: ${errors.length} error(s), ${warnings.length} warning(s)\n`);
  process.exit(errors.length > 0 ? 1 : 0);
}

else if (command === 'scan') {
  const sourceGlob = flag('--source');
  if (!sourceGlob) {
    console.error('  Error: --source is required.\n');
    printUsage();
    process.exit(1);
  }

  const results = scanFiles([sourceGlob], cwd);
  let total = 0;

  for (const { file, findings } of results) {
    console.log(`\n  ${file}`);
    for (const f of findings) {
      console.log(`    WARN  L${f.line} [${f.type}] "${f.text}"`);
    }
    total += findings.length;
  }

  console.log(`\n  Total: ${total} hardcoded string(s) found\n`);
}

else {
  console.error(`  Unknown command: ${command}\n`);
  printUsage();
  process.exit(1);
}
