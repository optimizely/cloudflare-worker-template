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
// https://developers.cloudflare.com/workers/examples/cache-using-fetch/
const DATAFILE_CACHE_TTL_SECONDS = 1 * 60; // 1 minute

// Module-scope variables for datafile caching
let cachedDatafile = null;
let lastDatafileUpdate = 0;

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

	// Check if we need to refresh the cached datafile
	const isDatafileStale =
		now - lastDatafileUpdate > DATAFILE_CACHE_TTL_SECONDS * 1000;
	if (!cachedDatafile || isDatafileStale) {
		try {
			cachedDatafile = await getDatafile(sdkKey);
			lastDatafileUpdate = now;
		} catch (error) {
			// If fetch fails and we have a cached datafile, continue with stale data
			// Otherwise, rethrow the error
			if (!cachedDatafile) {
				throw error;
			}
			// Log the error but continue with stale datafile
			console.error(
				"Failed to fetch fresh datafile, using cached version:",
				error,
			);
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
