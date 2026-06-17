# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-06-18

### Added

- `pseudo` command: generate pseudo-localized JSON from a base locale file, preserving interpolation and ICU tokens.
- `check` command: cross-locale key parity checking, empty value detection, and optional zombie key scanning.
- `scan` command: detect hardcoded user-facing strings in Angular templates that bypass the translate pipe.
- Unit tests for all three modules.
- Example locale files and sample template for smoke testing.
- CI workflow with GitHub Actions.
