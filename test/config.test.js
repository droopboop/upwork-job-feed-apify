import test from "node:test";
import assert from "node:assert/strict";

import { normalizeCursor, readRuntimeConfig, resolveInitialCursor } from "../src/config.js";

test("normalizeCursor trims value and returns null for empty strings", () => {
    assert.equal(normalizeCursor("  abc123  "), "abc123");
    assert.equal(normalizeCursor(""), null);
    assert.equal(normalizeCursor("   "), null);
    assert.equal(normalizeCursor(null), null);
});

test("readRuntimeConfig validates required fields", () => {
    const config = readRuntimeConfig(
        {
            searchLink: "https://www.upwork.com/nx/search/jobs/?q=python"
        },
        {
            PRIVATE_API_BASE_URL: "https://api.example.com",
            PRIVATE_API_PATH: "private/path",
            PRIVATE_API_KEY: "secret"
        }
    );

    assert.equal(config.requestUrl, "https://api.example.com/private/path");
    assert.equal(config.authMode, "authorization");
    assert.equal(config.runMode, "once");
    assert.equal(config.maxPollingCycles, 1);
});

test("readRuntimeConfig supports full endpoint from env", () => {
    const config = readRuntimeConfig(
        {
            searchLink: "https://www.upwork.com/nx/search/jobs/?q=python"
        },
        {
            PRIVATE_API_ENDPOINT: "https://api.example.com/hidden/route",
            PRIVATE_API_KEY: "secret"
        }
    );

    assert.equal(config.requestUrl, "https://api.example.com/hidden/route");
});

test("readRuntimeConfig rejects unsupported input fields", () => {
    assert.throws(
        () =>
            readRuntimeConfig(
                {
                    searchLink: "https://www.upwork.com/nx/search/jobs/?q=python",
                    runMode: "polling"
                },
                {
                    PRIVATE_API_BASE_URL: "https://api.example.com",
                    PRIVATE_API_PATH: "private/path",
                    PRIVATE_API_KEY: "secret"
                }
            ),
        /Unsupported input field/
    );
});

test("readRuntimeConfig reads runtime behavior from env only", () => {
    const config = readRuntimeConfig(
        {
            searchLink: "https://www.upwork.com/nx/search/jobs/?q=python"
        },
        {
            PRIVATE_API_BASE_URL: "https://api.example.com",
            PRIVATE_API_PATH: "private/path",
            PRIVATE_API_KEY: "secret",
            PRIVATE_RUN_MODE: "polling",
            PRIVATE_MAX_POLLING_CYCLES: "3",
            PRIVATE_POLLING_INTERVAL_SECONDS: "15",
            PRIVATE_USE_PERSISTENT_CURSOR: "false"
        }
    );

    assert.equal(config.runMode, "polling");
    assert.equal(config.maxPollingCycles, 3);
    assert.equal(config.pollingIntervalSeconds, 15);
    assert.equal(config.usePersistentCursor, false);
});

test("resolveInitialCursor uses input cursor when field is present", () => {
    const cursor = resolveInitialCursor(
        {
            hasCursorField: true,
            inputCursor: null,
            usePersistentCursor: true
        },
        "from-state"
    );

    assert.equal(cursor, null);
});

test("resolveInitialCursor can read stored cursor if input cursor is missing", () => {
    const cursor = resolveInitialCursor(
        {
            hasCursorField: false,
            inputCursor: null,
            usePersistentCursor: true
        },
        "stored-cursor"
    );

    assert.equal(cursor, "stored-cursor");
});
