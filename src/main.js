import { Actor } from "apify";

import "./env.js";
import { readRuntimeConfig, resolveInitialCursor } from "./config.js";
import { ApiRequestError, requestJobs } from "./httpClient.js";

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function readStoredCursor(stateValue) {
    if (!stateValue || typeof stateValue !== "object") return null;
    if (typeof stateValue.nextCursor === "string") {
        const trimmed = stateValue.nextCursor.trim();
        return trimmed.length > 0 ? trimmed : null;
    }
    if (typeof stateValue.next_cursor === "string") {
        const trimmed = stateValue.next_cursor.trim();
        return trimmed.length > 0 ? trimmed : null;
    }
    return null;
}

function buildOutput({
    searchLink,
    runMode,
    cycles,
    totalResults,
    nextCursor,
    stateKey,
    outputKey
}) {
    return {
        runMode,
        searchLink,
        totalCycles: cycles.length,
        totalResults,
        nextCursor,
        stateKey,
        outputKey,
        cycles
    };
}

await Actor.init();

try {
    const input = (await Actor.getInput()) ?? {};
    const config = readRuntimeConfig(input, process.env);

    const existingState = config.usePersistentCursor ? await Actor.getValue(config.stateKey) : null;
    const storedCursor = readStoredCursor(existingState);
    let cursor = resolveInitialCursor(config, storedCursor);

    Actor.log.info("Starting job feed actor.", {
        runMode: config.runMode,
        maxPollingCycles: config.maxPollingCycles,
        pollingIntervalSeconds: config.pollingIntervalSeconds,
        usePersistentCursor: config.usePersistentCursor,
        hasInputCursor: config.hasCursorField,
        hasStoredCursor: Boolean(storedCursor)
    });

    const cycles = [];
    let totalResults = 0;

    for (let cycle = 1; cycle <= config.maxPollingCycles; cycle += 1) {
        const pollStartedAt = new Date().toISOString();
        const response = await requestJobs({
            requestUrl: config.requestUrl,
            apiKey: config.apiKey,
            authMode: config.authMode,
            searchLink: config.searchLink,
            cursor,
            timeoutMs: config.timeoutMs
        });

        if (response.results.length > 0) {
            await Actor.pushData(response.results);
        }

        totalResults += response.results.length;
        const cycleSummary = {
            cycle,
            pollStartedAt,
            requestCursor: cursor,
            receivedItems: response.results.length,
            nextCursor: response.nextCursor
        };
        cycles.push(cycleSummary);

        cursor = response.nextCursor;

        if (config.usePersistentCursor) {
            await Actor.setValue(config.stateKey, {
                nextCursor: cursor,
                updatedAt: new Date().toISOString(),
                searchLink: config.searchLink
            });
        }

        const isLastCycle = cycle >= config.maxPollingCycles;
        if (config.runMode === "polling" && !isLastCycle) {
            await sleep(config.pollingIntervalSeconds * 1000);
        }
    }

    const output = buildOutput({
        searchLink: config.searchLink,
        runMode: config.runMode,
        cycles,
        totalResults,
        nextCursor: cursor,
        stateKey: config.stateKey,
        outputKey: config.outputKey
    });

    await Actor.setValue(config.outputKey, output);

    Actor.log.info("Actor finished successfully.", {
        totalCycles: output.totalCycles,
        totalResults: output.totalResults,
        hasNextCursor: Boolean(output.nextCursor)
    });
} catch (error) {
    if (error instanceof ApiRequestError) {
        Actor.log.error("External API request failed.", {
            statusCode: error.statusCode,
            message: error.message
        });
    } else {
        Actor.log.exception(error, "Actor execution failed.");
    }
    throw error;
} finally {
    await Actor.exit();
}
