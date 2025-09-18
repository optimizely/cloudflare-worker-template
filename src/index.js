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
import cookie from "cookie";
import { dispatchEvent, getDatafile } from "./optimizely_helper";

const CLOUDFLARE_CLIENT_ENGINE = "javascript-sdk/cloudflare";
const OPTIMIZELY_USER_ID_COOKIE_NAME = "optimizely_user_id";

export default {
	async fetch(request, env, ctx) {
		return handleRequest(request, env, ctx);
	},
};

async function handleRequest(request, env, ctx) {
	const cookies = cookie.parse(request.headers.get("Cookie") || "");

	// Fetch user Id from the cookie if available to make sure that a returning user from same browser session always sees the same variation.
	const userId = cookies[OPTIMIZELY_USER_ID_COOKIE_NAME] || crypto.randomUUID();

	// fetch datafile from optimizely CDN and cache it with cloudflare for the given number of seconds
	const datafile = await getDatafile("YOUR_SDK_KEY_HERE", 600);

	const optimizelyClient = createInstance({
		datafile,

		// keep the LOG_LEVEL to ERROR in production. Setting LOG_LEVEL to INFO or DEBUG can adversely impact performance.
		logLevel: LogLevel.Error,

		clientEngine: CLOUDFLARE_CLIENT_ENGINE,

		/***
		 * Optional event dispatcher. Please uncomment the following line if you want to dispatch an impression event to optimizely logx backend.
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

	const optimizelyUserContext = optimizelyClient.createUserContext(userId, {
		/* YOUR_OPTIONAL_ATTRIBUTES_HERE */
	});

	// --- Using Optimizely Config
	const optimizelyConfig = optimizelyClient.getOptimizelyConfig();

	// --- For a single flag --- //
	const decision = optimizelyUserContext.decide("YOUR_FLAG_HERE");
	if (decision.enabled) {
		console.info(
			`The Flag "${
				decision.flagKey
			}" was Enabled for the user "${decision.userContext.getUserId()}"`,
		);
	} else {
		console.info(
			`The Flag "${
				decision.flagKey
			}" was Not Enabled for the user "${decision.userContext.getUserId()}"`,
		);
	}

	// --- For all flags --- //
	const allDecisions = optimizelyUserContext.decideAll();
	Object.entries(allDecisions).forEach(([flagKey, decision]) => {
		if (decision.enabled) {
			console.info(
				`The Flag "${
					decision.flagKey
				}" was Enabled for the user "${decision.userContext.getUserId()}"`,
			);
		} else {
			console.info(
				`The Flag "${
					decision.flagKey
				}" was Not Enabled for the user "${decision.userContext.getUserId()}"`,
			);
		}
	});

	const headers = new Headers();
	headers.set("Content-Type", "text/plain");
	headers.set(
		"Set-Cookie",
		cookie.serialize(OPTIMIZELY_USER_ID_COOKIE_NAME, userId),
	);
	return new Response(
		"Welcome to the Optimizely Starter template. Check logs for decision results.",
		{ headers },
	);
}
