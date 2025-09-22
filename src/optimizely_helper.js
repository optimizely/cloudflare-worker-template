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
	createForwardingEventProcessor,
	createInstance,
	createStaticProjectConfigManager,
} from "@optimizely/optimizely-sdk/universal";
import { CloudflareRequestHandler } from "./request_handler";

const CLOUDFLARE_CLIENT_ENGINE = "javascript-sdk/cloudflare";
// https://developers.cloudflare.com/workers/examples/cache-using-fetch/
const DATAFILE_CACHE_TTL_SECONDS = 5 * 60; // 5 minutes

// Module-scope variables for client caching
let optimizelyClient = null;
let lastDatafileUpdate = 0;

let requestHandler = new CloudflareRequestHandler();

export async function getDatafile(sdkKey) {
	// Use the CloudflareRequestHandler so requests can be aborted/managed in tests
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

	const isDatafileStale =
		now - lastDatafileUpdate > DATAFILE_CACHE_TTL_SECONDS * 1000;
	if (optimizelyClient && !isDatafileStale) {
		return optimizelyClient;
	}

	// Update the global request handler with the current context
	if (ctx) {
		requestHandler = new CloudflareRequestHandler(ctx);
	}

	const datafile = await getDatafile(sdkKey);
	const projectConfigManager = createStaticProjectConfigManager({
		datafile,
	});

	const eventDispatcher = {
		dispatchEvent: (event) => {
			const url = "https://logx.optimizely.com/v1/events";
			const { responsePromise } = requestHandler.makeRequest(
				url,
				{},
				"POST",
				event,
			);
			return responsePromise;
		},
	};
	const eventProcessor = createForwardingEventProcessor({
		eventDispatcher,
	});

	// https://docs.developers.optimizely.com/feature-experimentation/docs/initialize-the-javascript-sdk
	optimizelyClient = createInstance({
		projectConfigManager,
		eventProcessor,
		requestHandler,
		clientEngine: CLOUDFLARE_CLIENT_ENGINE,
		disposable: true, // Enable auto-disposal for edge environment
	});

	lastDatafileUpdate = now;
	return optimizelyClient;
}
