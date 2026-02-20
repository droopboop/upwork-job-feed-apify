# Upwork Job Feed Apify Bridge

Privacy-first shell around an Apify Actor that extracts Upwork jobs and sends them to a private API for integrations and workflow automation.

## Status
This repository currently defines project rules, security baselines, and operating standards before implementation.

## Goals
- Keep API details and data contracts private.
- Keep secrets out of source control and logs.
- Provide predictable, testable integration behavior.
- Make operations recoverable and auditable.

## High-Level Architecture
1. Apify Actor collects and pre-filters Upwork jobs.
2. Actor sends events to a single ingestion boundary.
3. Internal API validates, verifies signature, and normalizes data.
4. Downstream systems consume normalized jobs.

## Privacy Reality Check
- Endpoint names can be obscured, but obscurity is not security.
- If traffic goes over the public internet, assume endpoints can be discovered.
- Real privacy comes from private networking, strong auth, encryption, and minimal external surface.

See `docs/API_PRIVACY.md` and `docs/SECURITY_PRIVACY.md`.

## Documentation Index
- `CONTRIBUTING.md`
- `docs/CODE_STANDARDS.md`
- `docs/REFACTORING.md`
- `docs/SECURITY_PRIVACY.md`
- `docs/API_PRIVACY.md`
- `docs/TESTING.md`
- `docs/OPERATIONS_RUNBOOK.md`
- `AGENTS.md`
