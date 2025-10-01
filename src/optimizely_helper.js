/**
 * Copyright 2021-2022, 2025 Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
	createEventDispatcher,
	createForwardingEventProcessor,
	createInstance,
	createStaticProjectConfigManager,
} from "@optimizely/optimizely-sdk/universal";
import { CloudflareRequestHandler } from "./request_handler";

const CLOUDFLARE_CLIENT_ENGINE = "javascript-sdk/cloudflare";

// Default datafile cache TTL in seconds. Can be overridden via environment variable
// OPTIMIZELY_DATAFILE_CACHE_TTL_SECONDS (e.g., "300" for 5 minutes, v0 was "600" for 10 minutes)
const DEFAULT_DATAFILE_CACHE_TTL_SECONDS = 300; // 5 minutes

// Module-scope variables for datafile caching
let cachedDatafile = null;
let lastDatafileUpdate = 0;

/**
 * Get the datafile cache TTL in seconds from environment variables.
 *
 * Reads OPTIMIZELY_DATAFILE_CACHE_TTL_SECONDS and returns it as an integer.
 * Falls back to DEFAULT_DATAFILE_CACHE_TTL_SECONDS if not set or invalid.
 *
 * @param {Object} env - Environment variables object
 * @returns {number} TTL in seconds
 */
function getDatafileCacheTTL(env) {
	const envValue = env?.OPTIMIZELY_DATAFILE_CACHE_TTL_SECONDS;

	if (envValue === undefined || envValue === null) {
		return DEFAULT_DATAFILE_CACHE_TTL_SECONDS;
	}

	const parsedValue = Number.parseInt(envValue, 10);
	if (Number.isNaN(parsedValue) || parsedValue < 0) {
		console.warn(
			`Invalid OPTIMIZELY_DATAFILE_CACHE_TTL_SECONDS value: "${envValue}". ` +
				`Using default: ${DEFAULT_DATAFILE_CACHE_TTL_SECONDS} seconds.`,
		);
		return DEFAULT_DATAFILE_CACHE_TTL_SECONDS;
	}

	return parsedValue;
}

export async function getDatafile(sdkKey) {
	// Datafile fetching doesn't need context since it's not dispatching events
	const requestHandler = new CloudflareRequestHandler();
	const url = `https://cdn.optimizely.com/datafiles/${sdkKey}.json`;
	const { responsePromise } = requestHandler.makeRequest(url, {}, "GET");
	const response = await responsePromise;
	return response.body;
}

export async function getOptimizelyClient(env, ctx) {
	const now = Date.now();

	const sdkKey = env.OPTIMIZELY_SDK_KEY;
	if (!sdkKey) {
		throw new Error(
			"OPTIMIZELY_SDK_KEY environment variable is required. " +
				"Set it in wrangler.jsonc or use: wrangler secret put OPTIMIZELY_SDK_KEY",
		);
	}

	// Get cache TTL from environment (defaults to 5 minutes)
	const cacheTTLSeconds = getDatafileCacheTTL(env);

	// Check if we need to refresh the cached datafile
	const isDatafileStale = now - lastDatafileUpdate > cacheTTLSeconds * 1000;
	if (!cachedDatafile || isDatafileStale) {
		try {
			cachedDatafile = await getDatafile(sdkKey);
			lastDatafileUpdate = now;
		} catch (error) {
			// If fetch fails and we have a cached datafile, continue with stale data
			if (cachedDatafile) {
				console.error(
					"Failed to fetch fresh datafile, using cached version:",
					error,
				);
			} else {
				// No cached datafile available - this is a critical error
				console.error(
					"Failed to fetch datafile and no cached version available:",
					error,
				);
				throw new Error(
					`Unable to initialize Optimizely: Failed to fetch datafile for SDK key ${sdkKey}. ${error.message}`,
				);
			}
		}
	}

	// Create a new client instance for each request with the request-specific context
	// Use the same request handler instance for both event dispatching and any SDK requests
	const contextualRequestHandler = new CloudflareRequestHandler(ctx);

	const projectConfigManager = createStaticProjectConfigManager({
		datafile: cachedDatafile,
	});

	const eventDispatcher = createEventDispatcher(contextualRequestHandler);
	const eventProcessor = createForwardingEventProcessor({
		eventDispatcher,
	});

	// https://docs.developers.optimizely.com/feature-experimentation/docs/initialize-the-javascript-sdk
	const optimizelyClient = createInstance({
		projectConfigManager,
		eventProcessor,
		requestHandler: contextualRequestHandler,
		clientEngine: CLOUDFLARE_CLIENT_ENGINE,
		disposable: true, // Enable auto-disposal for edge environment
	});

	return optimizelyClient;
}
