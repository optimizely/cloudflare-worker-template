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

import { createInstance, LogLevel } from "@optimizely/optimizely-sdk/universal";

const CLOUDFLARE_CLIENT_ENGINE = "javascript-sdk/cloudflare";

// Module-scope variables for client caching
let optimizelyClient = null;
let lastDatafileUpdate = 0;
const DATAFILE_CACHE_TTL = 600 * 1000; // 10 minutes in ms

export async function getDatafile(sdkKey, ttl) {
	const datafileResponse = await fetch(
		`https://cdn.optimizely.com/datafiles/${sdkKey}.json`,
		{ cf: { cacheTtl: ttl } },
	);
	return await datafileResponse.text();
}

export function dispatchEvent({ url, params }) {
	const eventRequest = new Request(url, {
		method: "POST",
		body: JSON.stringify(params),
	});

	return fetch(eventRequest);
}

export async function getOptimizelyClient(ctx) {
	const now = Date.now();
	
	// Initialize client or refresh datafile if cache expired
	if (!optimizelyClient || (now - lastDatafileUpdate) > DATAFILE_CACHE_TTL) {
		const datafile = await getDatafile("YOUR_SDK_KEY_HERE", 600);
		
		if (!optimizelyClient) {
			// Create client for the first time
			optimizelyClient = createInstance({
				datafile,
				logLevel: LogLevel.Error,
				clientEngine: CLOUDFLARE_CLIENT_ENGINE,
				
				/***
				 * Optional event dispatcher. Please uncomment the following lines if you want to dispatch an impression event to optimizely logx backend.
				 * When enabled, an event is dispatched asynchronously. It does not impact the response time for a particular worker but it will
				 * add to the total compute time of the worker and can impact cloudflare billing.
				 */
				
				/* eventDispatcher: {
					dispatchEvent: optimizelyEvent => {
						// Tell cloudflare to wait for this promise to fulfill.
						ctx.waitUntil(dispatchEvent(optimizelyEvent));
					}
				}, */
				
				/* Add other Optimizely SDK initialization options here if needed */
			});
		} else {
			// Update existing client with new datafile
			optimizelyClient.setDatafile(datafile);
		}
		
		lastDatafileUpdate = now;
	}
	
	return optimizelyClient;
}
