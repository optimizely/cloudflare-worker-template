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

import cookie from "cookie";
import { getOptimizelyClient } from "./optimizely_helper";

const OPTIMIZELY_USER_ID_COOKIE_NAME = "optimizely_user_id";

// Cloudflare Worker entry point
export default {
	async fetch(request, env, ctx) {
		return handleRequest(request, env, ctx);
	},
};

async function handleRequest(request, env, ctx) {
	const cookies = cookie.parse(request.headers.get("Cookie") || "");

	// Fetch user Id from the cookie if available to make sure that a returning user from 
  // same browser session always sees the same variation.
	const userId = cookies[OPTIMIZELY_USER_ID_COOKIE_NAME] || crypto.randomUUID();

	// Get the cached Optimizely client (refreshes datafile if needed)
	const optimizelyClient = await getOptimizelyClient(env, ctx);

	const optimizelyUserContext = optimizelyClient.createUserContext(userId, {
		// Add optional user attributes here as key-value pairs for example
		// location: "New York City",
		// device: "mobile"
	});

	// Decide for a single flag
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

	// Decide for all flags
	const allDecisions = optimizelyUserContext.decideAll();
	Object.entries(allDecisions).forEach(([_flagKey, decision]) => {
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
