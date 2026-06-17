# Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository and create a feature branch.
2. Make your changes — keep them focused and minimal.
3. Add or update tests for any new functionality.
4. Run `npm test` and ensure all tests pass.
5. Open a pull request with a clear description of the change.

## Development

```bash
npm test                # Run unit tests
npm run pseudo:example  # Generate pseudo.json from examples/en.json
npm run check:example   # Run parity check on example locales
npm run scan:example    # Scan example templates for hardcoded strings
```

## Commit style

Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `chore:`, `test:`.
