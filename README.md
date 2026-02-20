# Upwork Job Feed Apify Bridge

Privacy-first Apify Actor that forwards cursor-based requests to an external jobs API.

## What This Actor Does

1. Reads Actor input (`searchLink`, optional `cursor`).
2. Sends `POST` request to external API with `search_link` and optional `cursor`.
3. Writes returned `results` to Apify Dataset.
4. Stores `next_cursor` in KV store for the next run (optional).
5. Supports single-run mode and interval polling mode.

## Current Request Contract

- Request body sent by Actor:
    - `search_link` (required)
    - `cursor` (optional; omitted when null/empty)
- Auth headers:
    - `Authorization: Api-Key <KEY>` (default)
    - `X-API-KEY: <KEY>`
    - or both

## Local Development

Requirements:

- Node.js `>= 20`

Install:

```bash
npm install
```

Run tests:

```bash
npm test
```

Run locally:

```bash
npm start
```

## Environment Configuration

Create `.env` for local runs (this file is ignored by git):

```dotenv
PRIVATE_API_BASE_URL=https://api.example.com
PRIVATE_API_PATH=private/path
PRIVATE_API_KEY=REDACTED

# Optional
PRIVATE_API_AUTH_MODE=authorization
PRIVATE_API_TIMEOUT_MS=30000
PRIVATE_RUN_MODE=once
PRIVATE_POLLING_INTERVAL_SECONDS=60
PRIVATE_MAX_POLLING_CYCLES=1
PRIVATE_USE_PERSISTENT_CURSOR=true
PRIVATE_STATE_KEY=POLL_STATE
PRIVATE_OUTPUT_KEY=OUTPUT
```

Alternative:

- You can set one full URL via `PRIVATE_API_ENDPOINT` instead of `PRIVATE_API_BASE_URL + PRIVATE_API_PATH`.

## Example Actor Input

```json
{
    "searchLink": "https://www.upwork.com/nx/search/jobs/?q=python",
    "cursor": null
}
```

Actor input accepts only two fields: `searchLink` and optional `cursor`.
Sensitive API details and runtime behavior are loaded from env.

## Output and State

- Dataset: each item from `results[]` is pushed as one record.
- KV store output (`OUTPUT` by default):
    - total cycles
    - total results
    - `nextCursor`
    - cycle summaries
- KV store state (`POLL_STATE` by default):
    - `nextCursor`
    - `updatedAt`
    - `searchLink`

## Security Notes

- Never commit real API keys.
- Keep base URL and endpoint paths in environment variables only.
- Prefer Apify Secrets / environment variables for credentials.
- Logs intentionally avoid key/token values.

## Governance Docs

- `CONTRIBUTING.md`
- `docs/CODE_STANDARDS.md`
- `docs/REFACTORING.md`
- `docs/SECURITY_PRIVACY.md`
- `docs/API_PRIVACY.md`
- `docs/TESTING.md`
- `docs/OPERATIONS_RUNBOOK.md`
- `AGENTS.md`
