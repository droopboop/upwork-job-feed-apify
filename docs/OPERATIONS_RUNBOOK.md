# Operations Runbook

## Daily Checks

- Ingestion success rate and latency.
- Auth and signature failure rate.
- Retry queue and dead-letter queue volume.
- Unexpected traffic sources.

## Key Rotation

- Rotate API keys and signing secrets on a fixed cadence.
- Support dual-key window for zero-downtime rotation.
- Remove old keys immediately after cutover.

## Incident Severity

- `Sev-1`: active compromise, data leak, unauthorized writes.
- `Sev-2`: sustained ingestion failure or severe integrity risk.
- `Sev-3`: degraded performance without data integrity loss.

## Immediate Incident Actions

1. Pause external ingestion through the approved emergency control.
2. Revoke exposed credentials.
3. Snapshot logs and metrics for forensics.
4. Restore service with rotated credentials and validated controls.
5. Publish timeline and remediation actions.

## Recovery Checklist

- Replay safe backlog with idempotency guarantees.
- Verify data integrity after recovery.
- Confirm monitoring and alerting are functional.
- Open follow-up tasks for root-cause fixes.

## Deployment Checklist

- Secrets sourced from runtime manager, not files in repo.
- Auth, replay, and rate-limit checks enabled.
- Logging redaction verified.
- Rollback plan documented.
