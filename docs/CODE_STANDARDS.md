# Code Standards

## Design Principles

- Prefer small, composable modules with explicit boundaries.
- Separate transport concerns from business logic.
- Fail closed: invalid or unsigned input is rejected by default.
- Make side effects explicit (network, disk, queue).

## Naming and Structure

- Use clear domain names (`job`, `ingestion`, `normalization`, `delivery`).
- Avoid generic folders like `utils` unless shared by multiple domains.
- Keep files focused; split once a file becomes hard to scan.

## Data Handling

- Validate all external input at boundaries.
- Use typed schemas for request, response, and event payloads.
- Normalize provider-specific fields before internal use.
- Treat all provider payloads as untrusted data.

## Error Handling

- Return deterministic machine-readable error codes.
- Never leak stack traces or internal topology to external callers.
- Include correlation IDs for traceability.

## Logging

- Structured logs only (key-value).
- Redact secrets, tokens, emails, and free-form user text.
- Log intent and outcomes, not raw payload dumps.

## Testing

- Unit tests for domain logic.
- Contract tests for Actor -> API integration.
- Regression tests before refactors.
- Security tests for auth, signature, replay, and rate limits.

## Dependency Policy

- Add dependencies only with clear justification.
- Pin versions and review changelogs for security updates.
- Remove unused dependencies quickly.
