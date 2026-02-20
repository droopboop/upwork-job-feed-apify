# Security and Privacy Policy

## Security Baseline
- Default deny at every trust boundary.
- Least privilege for tokens, roles, and network paths.
- Defense in depth: network + auth + crypto + monitoring.

## Threat Model (Minimum)
Assets:
- API credentials and signing secrets.
- Job data and enrichment metadata.
- Internal topology and endpoint structure.

Adversaries:
- Internet scanners and bot traffic.
- Credential leaks from CI, logs, or developer machines.
- Replay and tampering attempts.

## Secret Management
- Never commit secrets to git.
- Use secret managers or environment injection at runtime.
- Rotate secrets on schedule and after any suspected leak.
- Separate secrets per environment (`dev`, `stage`, `prod`).

## Network Controls
- Prefer private connectivity (VPN, private link, tunnel).
- If public ingress is unavoidable, enforce:
  - mTLS or strong signed auth (`HMAC` with timestamp and nonce).
  - IP allowlist where feasible.
  - WAF and rate limiting.
  - Strict TLS and modern ciphers.

## Data Privacy
- Collect only fields required for downstream automation.
- Remove or hash sensitive fields not required for processing.
- Define retention windows and automated deletion.
- Encrypt data in transit and at rest.

## Logging and Observability
- Redact secrets and personal data before logs.
- Use correlation IDs instead of raw payload snapshots.
- Alert on auth failures, replay attempts, and unusual traffic rates.

## Incident Rules
- Treat any secret exposure as a security incident.
- Revoke and rotate compromised credentials immediately.
- Preserve audit trails and timeline.
- Follow `docs/OPERATIONS_RUNBOOK.md` for response steps.
