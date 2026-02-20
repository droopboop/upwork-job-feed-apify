# API Privacy Strategy

## Short Answer

Complete invisibility of endpoints and schema is not realistic if an Actor sends traffic over the public internet.
Practical privacy is achievable by minimizing exposed surface and enforcing strong controls.

## Recommended Target Architecture

1. Expose one generic ingestion entrypoint only.
2. Keep all business endpoints private behind internal services.
3. Accept only signed, time-bound, idempotent requests.
4. Optionally encrypt request payloads at application layer.
5. Return minimal responses (acknowledgement only).

## Pattern A: Private Connectivity (Preferred)

Use private networking between the Actor runtime and your API boundary.

Result:

- Endpoint is not publicly routable.
- Internal service topology is fully hidden.
- Attack surface is smaller.

## Pattern B: Controlled Public Ingress (Fallback)

If private networking is unavailable:

- Put an API gateway in front of your service.
- Keep exactly one public route with generic naming.
- Require mTLS or `HMAC + nonce + timestamp`.
- Allowlist source ranges where possible.
- Enforce strict rate limits and anomaly detection.

## Schema Privacy Techniques

Use a versioned external envelope contract and keep internal schema private.
Do not publish internal field-level mappings in public documentation.

Guidelines:

- Internal schema is resolved only after verify/decrypt step.
- Keep contract names generic and avoid domain-revealing field names.
- Keep response payload minimal (`202 Accepted` + trace ID).

## What This Protects

- Makes reverse engineering difficult and expensive.
- Prevents unauthorized writes and replay attacks.
- Keeps internal data model and endpoint map private in practice.

## What This Does Not Protect

- Any truly public endpoint can still be discovered.
- Endpoint secrecy alone cannot replace authentication and cryptography.
