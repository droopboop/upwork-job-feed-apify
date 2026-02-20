const VALID_AUTH_MODES = new Set(["authorization", "x-api-key", "both"]);
const VALID_RUN_MODES = new Set(["once", "polling"]);
const ALLOWED_INPUT_KEYS = new Set(["searchLink", "cursor"]);

const DEFAULT_POLLING_INTERVAL_SECONDS = 60;
const DEFAULT_MAX_POLLING_CYCLES = 1;
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_STATE_KEY = "POLL_STATE";
const DEFAULT_OUTPUT_KEY = "OUTPUT";
const DEFAULT_AUTH_MODE = "authorization";

function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasOwnKey(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
}

function asNonEmptyString(value) {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function ensureTrailingSlash(value) {
    return value.endsWith("/") ? value : `${value}/`;
}

function parseBoolean(value, fieldName) {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (normalized === "true") return true;
        if (normalized === "false") return false;
    }
    throw new Error(`"${fieldName}" must be a boolean.`);
}

function parsePositiveInteger(value, fieldName, fallback, min = 1) {
    if (value === undefined || value === null || value === "") return fallback;
    const parsed = Number.parseInt(String(value), 10);
    if (!Number.isInteger(parsed) || parsed < min) {
        throw new Error(`"${fieldName}" must be an integer >= ${min}.`);
    }
    return parsed;
}

function validateInputKeys(input) {
    const unknownKeys = Object.keys(input).filter((key) => !ALLOWED_INPUT_KEYS.has(key));
    if (unknownKeys.length > 0) {
        throw new Error(
            `Unsupported input field(s): ${unknownKeys.join(", ")}. Allowed fields: searchLink, cursor.`
        );
    }
}

function resolveRequestUrlFromEnv(env) {
    const fullEndpoint =
        asNonEmptyString(env.PRIVATE_API_ENDPOINT) ?? asNonEmptyString(env.API_ENDPOINT_URL);

    if (fullEndpoint) {
        try {
            return new URL(fullEndpoint).toString();
        } catch {
            throw new Error('Environment variable "PRIVATE_API_ENDPOINT" must be a valid URL.');
        }
    }

    const baseUrlRaw =
        asNonEmptyString(env.PRIVATE_API_BASE_URL) ?? asNonEmptyString(env.API_BASE_URL);
    const endpointPathRaw =
        asNonEmptyString(env.PRIVATE_API_PATH) ?? asNonEmptyString(env.API_PATH);

    if (!baseUrlRaw || !endpointPathRaw) {
        throw new Error(
            [
                "API endpoint is not configured.",
                'Provide "PRIVATE_API_ENDPOINT" (full URL),',
                'or provide both "PRIVATE_API_BASE_URL" and "PRIVATE_API_PATH".'
            ].join(" ")
        );
    }

    let baseUrl;
    try {
        baseUrl = new URL(baseUrlRaw);
    } catch {
        throw new Error('Environment variable "PRIVATE_API_BASE_URL" must be a valid URL.');
    }

    const normalizedEndpointPath = endpointPathRaw.replace(/^\/+/, "");
    if (!normalizedEndpointPath) {
        throw new Error('Environment variable "PRIVATE_API_PATH" must not be empty.');
    }

    return new URL(normalizedEndpointPath, ensureTrailingSlash(baseUrl.toString())).toString();
}

export function normalizeCursor(value) {
    if (value === undefined || value === null) return null;
    if (typeof value !== "string") {
        throw new Error('"cursor" must be a string or null.');
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export function resolveInitialCursor(
    { hasCursorField, inputCursor, usePersistentCursor },
    storedCursor
) {
    if (hasCursorField) return inputCursor;
    if (!usePersistentCursor) return null;
    return normalizeCursor(storedCursor);
}

export function readRuntimeConfig(input, env = process.env) {
    if (!isObject(input)) {
        throw new Error("Actor input must be a JSON object.");
    }
    validateInputKeys(input);

    const requestUrl = resolveRequestUrlFromEnv(env);

    const apiKey = asNonEmptyString(env.PRIVATE_API_KEY) ?? asNonEmptyString(env.API_KEY);
    if (!apiKey) {
        throw new Error('Environment variable "PRIVATE_API_KEY" (or "API_KEY") is required.');
    }

    const searchLink = asNonEmptyString(input.searchLink);
    if (!searchLink) {
        throw new Error('"searchLink" is required.');
    }

    const rawAuthMode =
        asNonEmptyString(env.PRIVATE_API_AUTH_MODE)?.toLowerCase() ??
        asNonEmptyString(env.API_AUTH_MODE)?.toLowerCase() ??
        DEFAULT_AUTH_MODE;
    if (!VALID_AUTH_MODES.has(rawAuthMode)) {
        throw new Error(
            'Environment variable "PRIVATE_API_AUTH_MODE" must be one of: authorization, x-api-key, both.'
        );
    }

    const rawRunMode =
        asNonEmptyString(env.PRIVATE_RUN_MODE)?.toLowerCase() ??
        asNonEmptyString(env.RUN_MODE)?.toLowerCase() ??
        "once";
    if (!VALID_RUN_MODES.has(rawRunMode)) {
        throw new Error('Environment variable "PRIVATE_RUN_MODE" must be one of: once, polling.');
    }

    const pollingIntervalSeconds = parsePositiveInteger(
        env.PRIVATE_POLLING_INTERVAL_SECONDS ?? env.POLLING_INTERVAL_SECONDS,
        "PRIVATE_POLLING_INTERVAL_SECONDS",
        DEFAULT_POLLING_INTERVAL_SECONDS,
        1
    );

    const requestedMaxCycles = parsePositiveInteger(
        env.PRIVATE_MAX_POLLING_CYCLES ?? env.MAX_POLLING_CYCLES,
        "PRIVATE_MAX_POLLING_CYCLES",
        DEFAULT_MAX_POLLING_CYCLES,
        1
    );
    const maxPollingCycles = rawRunMode === "once" ? 1 : requestedMaxCycles;

    const timeoutMs = parsePositiveInteger(
        env.PRIVATE_API_TIMEOUT_MS ?? env.API_TIMEOUT_MS,
        "PRIVATE_API_TIMEOUT_MS",
        DEFAULT_TIMEOUT_MS,
        1000
    );

    const usePersistentCursorRaw =
        asNonEmptyString(env.PRIVATE_USE_PERSISTENT_CURSOR) ??
        asNonEmptyString(env.USE_PERSISTENT_CURSOR);
    const usePersistentCursor =
        usePersistentCursorRaw === null
            ? true
            : parseBoolean(usePersistentCursorRaw, "PRIVATE_USE_PERSISTENT_CURSOR");

    const stateKey =
        asNonEmptyString(env.PRIVATE_STATE_KEY) ??
        asNonEmptyString(env.STATE_KEY) ??
        DEFAULT_STATE_KEY;
    const outputKey =
        asNonEmptyString(env.PRIVATE_OUTPUT_KEY) ??
        asNonEmptyString(env.OUTPUT_KEY) ??
        DEFAULT_OUTPUT_KEY;

    const hasCursorField = hasOwnKey(input, "cursor");
    const inputCursor = hasCursorField ? normalizeCursor(input.cursor) : null;

    return {
        requestUrl,
        apiKey,
        authMode: rawAuthMode,
        searchLink,
        hasCursorField,
        inputCursor,
        runMode: rawRunMode,
        pollingIntervalSeconds,
        maxPollingCycles,
        timeoutMs,
        usePersistentCursor,
        stateKey,
        outputKey
    };
}
