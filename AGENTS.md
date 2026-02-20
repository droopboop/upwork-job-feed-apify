# AGENTS Guidance

This repository is privacy-first. Any AI or automation agent must follow these rules.

## Mandatory Inputs

Before proposing or making changes, read:

- `README.md`
- `CONTRIBUTING.md`
- `docs/CODE_STANDARDS.md`
- `docs/REFACTORING.md`
- `docs/SECURITY_PRIVACY.md`
- `docs/API_PRIVACY.md`
- `docs/TESTING.md`
- `docs/OPERATIONS_RUNBOOK.md`

## Non-Negotiable Rules

- Do not expose secrets in code, docs, tests, examples, or logs.
- Do not introduce new public endpoints without explicit justification.
- Treat external payloads as untrusted and validate at boundaries.
- Keep changes small, testable, and reversible.
- Update documentation when behavior or policy changes.
