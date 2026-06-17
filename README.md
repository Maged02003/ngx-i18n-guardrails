# ngx-i18n-guardrails

Zero-dependency CLI toolkit that catches i18n gaps in [ngx-translate](https://github.com/ngx-translate/core) projects before your users do.

[![CI](https://github.com/TODO/ngx-i18n-guardrails/actions/workflows/ci.yml/badge.svg)](https://github.com/TODO/ngx-i18n-guardrails/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## The problem

Bilingual and RTL applications break in subtle ways that unit tests don't catch:

- A key exists in English but is missing in Arabic — the UI silently shows the raw key.
- A translated label is 40% longer in German and truncates inside a fixed-width button.
- A developer hardcodes `"Save"` in a template instead of using the translate pipe.
- Nobody notices until a user reports it in production.

## What this tool does

Three subcommands, each targeting a different failure mode:

| Command | What it catches |
|---------|----------------|
| `pseudo` | Text expansion, truncation, and hardcoded strings — visually, in the browser |
| `check` | Missing keys, cross-locale parity gaps, and empty values |
| `scan` | Literal user-facing strings in Angular templates that bypass `translate` |

## Install

```bash
npm install --save-dev ngx-i18n-guardrails
```

Or run directly:

```bash
npx ngx-i18n-guardrails --help
```

## Usage

### `pseudo` — Generate a pseudo-localized locale

```bash
npx ngx-i18n-guardrails pseudo --in src/assets/i18n/en.json --out src/assets/i18n/pseudo.json
```

Transforms every English string: accents Latin letters, expands by ~40%, and wraps in brackets. Interpolation tokens (`{{name}}`) and ICU expressions (`{count, plural, ...}`) are preserved.

**Before:**
```
Save
Welcome, {{name}}!
```

**After:**
```
[ Šåṽé ›› ]
[ Ŵéĺçöɱé, {{name}}! ›››››››› ]
```

Register `pseudo` as an additional ngx-translate language in dev mode to see which strings are actually translated, which are hardcoded, and which will truncate when the text is longer.

### `check` — Cross-locale parity

```bash
npx ngx-i18n-guardrails check --locales "src/assets/i18n/*.json"
```

Reports:
- **Missing keys** (error): a key exists in one locale but not another.
- **Empty values** (warning): a key exists but has an empty string value.

Exits non-zero if any missing keys are found — ideal for CI gates.

Optionally scan source files to find zombie keys (keys in JSON that aren't referenced anywhere):

```bash
npx ngx-i18n-guardrails check --locales "src/assets/i18n/*.json" --source "src/app/**/*.{html,ts}"
```

### `scan` — Hardcoded string detection

```bash
npx ngx-i18n-guardrails scan --source "src/app/**/*.html"
```

Finds literal user-facing text in Angular templates that should use the `| translate` pipe. Filters out:
- Angular Material icon names (`<mat-icon>close</mat-icon>`)
- Angular binding attributes (`[placeholder]="..."`)
- Pure interpolation, HTML entities, CSS values, URLs, numbers
- SVG elements and non-text content

Reports as warnings (exit 0) — informational, not blocking.

## Add to your project

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "i18n:pseudo": "ngx-i18n-guardrails pseudo --in src/assets/i18n/en.json --out src/assets/i18n/pseudo.json",
    "i18n:check": "ngx-i18n-guardrails check --locales \"src/assets/i18n/*.json\"",
    "i18n:scan": "ngx-i18n-guardrails scan --source \"src/app/**/*.html\""
  }
}
```

## Why pseudo-localization?

Pseudo-localization is a testing technique where you replace real translations with accented, expanded text. It catches three categories of bugs at dev time without waiting for actual translations:

1. **Hardcoded strings** — untranslated text stands out immediately (no brackets/accents).
2. **Truncation** — the ~40% expansion mimics languages like German or Finnish that are naturally longer.
3. **Character encoding** — accented characters reveal rendering issues with non-ASCII text.

It's how Microsoft, Google, and Mozilla test their i18n pipelines. This tool brings the same technique to Angular projects using ngx-translate.

## Complementary to ngx-translate-lint

This tool is designed to work alongside [ngx-translate-lint](https://github.com/AdrianBanworworthy/ngx-translate-lint), not replace it. ngx-translate-lint excels at detecting keys referenced in templates that don't exist in locale files. This tool adds:

- **Cross-locale parity** (is every key in every locale file?).
- **Pseudo-localization** (visual dev-time testing).
- **Hardcoded string scanning** (text that bypasses translate entirely).

Use both together for comprehensive coverage.

## Requirements

- Node.js >= 20
- Works with any project that uses ngx-translate-style flat/nested JSON locale files.

<!-- TODO: Add a screenshot or GIF showing pseudo-localized UI -->

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
