import test from "node:test";
import assert from "node:assert/strict";

import { ApiRequestError, buildAuthHeaders, requestJobs } from "../src/httpClient.js";

test("buildAuthHeaders builds Authorization header", () => {
    assert.deepEqual(buildAuthHeaders("abc", "authorization"), {
        Authorization: "Api-Key abc"
    });
});

test("buildAuthHeaders builds X-API-KEY header", () => {
    assert.deepEqual(buildAuthHeaders("abc", "x-api-key"), {
        "X-API-KEY": "abc"
    });
});

test("requestJobs omits cursor if it is empty", async () => {
    let capturedBody = null;

    const fakeFetch = async (_url, init) => {
        capturedBody = JSON.parse(init.body);
        return new Response(JSON.stringify({ results: [], next_cursor: null }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    };

    const response = await requestJobs({
        requestUrl: "https://api.example.com/private/jobs/feed",
        apiKey: "key",
        authMode: "authorization",
        searchLink: "https://www.upwork.com/nx/search/jobs/?q=python",
        cursor: "   ",
        timeoutMs: 1000,
        fetchImpl: fakeFetch
    });

    assert.deepEqual(capturedBody, {
        search_link: "https://www.upwork.com/nx/search/jobs/?q=python"
    });
    assert.equal(response.nextCursor, null);
});

test("requestJobs includes cursor when provided", async () => {
    let capturedBody = null;

    const fakeFetch = async (_url, init) => {
        capturedBody = JSON.parse(init.body);
        return new Response(JSON.stringify({ results: [], next_cursor: "next-1" }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    };

    const response = await requestJobs({
        requestUrl: "https://api.example.com/private/jobs/feed",
        apiKey: "key",
        authMode: "x-api-key",
        searchLink: "https://www.upwork.com/nx/search/jobs/?q=python",
        cursor: "cursor-1",
        timeoutMs: 1000,
        fetchImpl: fakeFetch
    });

    assert.deepEqual(capturedBody, {
        search_link: "https://www.upwork.com/nx/search/jobs/?q=python",
        cursor: "cursor-1"
    });
    assert.equal(response.nextCursor, "next-1");
});

test("requestJobs throws ApiRequestError on non-2xx", async () => {
    const fakeFetch = async () =>
        new Response(JSON.stringify({ detail: "Invalid cursor." }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });

    await assert.rejects(
        () =>
            requestJobs({
                requestUrl: "https://api.example.com/private/jobs/feed",
                apiKey: "key",
                authMode: "authorization",
                searchLink: "https://www.upwork.com/nx/search/jobs/?q=python",
                cursor: "bad-cursor",
                timeoutMs: 1000,
                fetchImpl: fakeFetch
            }),
        (error) => {
            assert.ok(error instanceof ApiRequestError);
            assert.equal(error.statusCode, 400);
            return true;
        }
    );
});
