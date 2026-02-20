# Testing Strategy

## Goals
- Catch regressions early.
- Protect security boundaries.
- Keep integration behavior stable across releases.

## Test Layers
- Unit tests: normalization, filtering, mapping, and validation logic.
- Contract tests: Actor request envelope and API response contract.
- Integration tests: end-to-end flow from Actor payload to internal write.
- Security tests: signature verification, replay prevention, and auth failures.

## Mandatory Cases
- Reject malformed payloads.
- Reject invalid signature, expired timestamp, and reused nonce.
- Preserve idempotency for repeated requests.
- Ensure redaction in logs for sensitive fields.

## Test Data Rules
- Never use production secrets or personal data.
- Prefer synthetic fixtures with deterministic values.
- Keep fixtures versioned with contract changes.

## CI Expectations
- Fail fast on lint, type checks, and tests.
- Block release on failing security-sensitive tests.
- Store test reports and coverage artifacts.
