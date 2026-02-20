import { normalizeCursor } from "./config.js";

export class ApiRequestError extends Error {
    constructor(message, statusCode, responseBody) {
        super(message);
        this.name = "ApiRequestError";
        this.statusCode = statusCode;
        this.responseBody = responseBody;
    }
}

function tryParseJson(rawText) {
    try {
        return JSON.parse(rawText);
    } catch {
        return null;
    }
}

function getErrorMessage(statusCode, payload) {
    if (payload && typeof payload === "object") {
        if (typeof payload.detail === "string" && payload.detail.trim())
            return payload.detail.trim();
        if (typeof payload.message === "string" && payload.message.trim())
            return payload.message.trim();
        if (typeof payload.error === "string" && payload.error.trim()) return payload.error.trim();
    }
    return `Upstream API request failed with status ${statusCode}.`;
}

function normalizeApiResponse(payload) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        throw new Error("Upstream response must be an object.");
    }

    if (!Array.isArray(payload.results)) {
        throw new Error('Upstream response field "results" must be an array.');
    }

    let nextCursor = null;
    if (payload.next_cursor !== undefined) {
        nextCursor = normalizeCursor(payload.next_cursor);
    }

    return {
        results: payload.results,
        nextCursor,
        raw: payload
    };
}

export function buildAuthHeaders(apiKey, authMode) {
    if (!apiKey || typeof apiKey !== "string") {
        throw new Error("API key must be a non-empty string.");
    }

    if (authMode === "authorization") {
        return { Authorization: `Api-Key ${apiKey}` };
    }
    if (authMode === "x-api-key") {
        return { "X-API-KEY": apiKey };
    }
    if (authMode === "both") {
        return {
            Authorization: `Api-Key ${apiKey}`,
            "X-API-KEY": apiKey
        };
    }

    throw new Error(`Unsupported auth mode: ${authMode}`);
}

export async function requestJobs({
    requestUrl,
    apiKey,
    authMode,
    searchLink,
    cursor,
    timeoutMs,
    fetchImpl = fetch
}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const requestBody = { search_link: searchLink };
    const normalizedCursor = normalizeCursor(cursor);
    if (normalizedCursor) requestBody.cursor = normalizedCursor;

    try {
        const response = await fetchImpl(requestUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...buildAuthHeaders(apiKey, authMode)
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
        });

        const responseText = await response.text();
        const parsedBody = tryParseJson(responseText);

        if (!response.ok) {
            const message = getErrorMessage(response.status, parsedBody);
            throw new ApiRequestError(message, response.status, parsedBody);
        }

        return normalizeApiResponse(parsedBody);
    } catch (error) {
        if (error?.name === "AbortError") {
            throw new Error(`Upstream API request timed out after ${timeoutMs}ms.`);
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}
