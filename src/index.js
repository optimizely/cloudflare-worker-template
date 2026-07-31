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

import { parseCookie, stringifySetCookie } from "cookie";
import { getOptimizelyClient } from "./optimizely_helper";

/**
 * Cookie name used to store the Optimizely user ID for consistent user experience
 * across requests from the same browser session.
 * @type {string}
 */
const OPTIMIZELY_USER_ID_COOKIE_NAME = "optimizely_user_id";

/**
 * Cloudflare Worker export interface.
 * Handles incoming HTTP requests using the fetch handler pattern.
 * @see https://developers.cloudflare.com/workers/runtime-apis/handlers/fetch/
 */
export default {
	/**
	 * Main fetch handler for the Cloudflare Worker.
	 * @param {Request} request - The incoming HTTP request
	 * @param {Object} env - Environment bindings (secrets, KV namespaces, etc.)
	 * @param {ExecutionContext} ctx - Execution context for managing async operations
	 * @returns {Promise<Response>} HTTP response
	 */
	async fetch(request, env, ctx) {
		return handleRequest(request, env, ctx);
	},
};

/**
 * Handle incoming HTTP requests and perform Optimizely feature flag decisions.
 *
 * This function demonstrates:
 * - Retrieving or generating a user ID from cookies
 * - Creating an Optimizely user context
 * - Making single and batch flag decisions
 * - Setting cookies for user persistence
 *
 * @param {Request} request - The incoming HTTP request
 * @param {Object} env - Environment bindings containing OPTIMIZELY_SDK_KEY and optional configuration
 * @param {ExecutionContext} ctx - Cloudflare Worker execution context for managing async operations
 * @returns {Promise<Response>} HTTP response with decision results
 */
async function handleRequest(request, env, ctx) {
	const cookies = parseCookie(request.headers.get("Cookie") || "");

	// Fetch user Id from the cookie if available to make sure that a returning user from
	// same browser session always sees the same variation.
	const userId = cookies[OPTIMIZELY_USER_ID_COOKIE_NAME] || crypto.randomUUID();

	// Get the cached Optimizely client (refreshes datafile if needed)
	let optimizelyClient;
	try {
		optimizelyClient = await getOptimizelyClient(env, ctx);
	} catch (error) {
		console.error(
			"Failed to initialize Optimizely client, continuing without feature flags:",
			error,
		);
		// Continue without Optimizely - return normal response
		const headers = new Headers();
		headers.set("Content-Type", "text/plain");
		headers.set(
			"Set-Cookie",
			stringifySetCookie({
				name: OPTIMIZELY_USER_ID_COOKIE_NAME,
				value: userId,
			}),
		);
		return new Response(
			"Welcome to the Optimizely Starter template. Feature flags unavailable.",
			{ headers },
		);
	}

	let optimizelyUserContext;
	try {
		optimizelyUserContext = optimizelyClient.createUserContext(userId, {
			// Add optional user attributes here as key-value pairs for example
			// location: "New York City",
			// device: "mobile"
		});
	} catch (error) {
		console.error(
			"Failed to create Optimizely user context, continuing without feature flags:",
			error,
		);
		// Continue without Optimizely
		const headers = new Headers();
		headers.set("Content-Type", "text/plain");
		headers.set(
			"Set-Cookie",
			stringifySetCookie({
				name: OPTIMIZELY_USER_ID_COOKIE_NAME,
				value: userId,
			}),
		);
		return new Response(
			"Welcome to the Optimizely Starter template. Feature flags unavailable.",
			{ headers },
		);
	}

	// Decide for a single flag
	try {
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
	} catch (error) {
		console.error("Failed to decide for single flag, continuing:", error);
	}

	// Decide for all flags
	try {
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
	} catch (error) {
		console.error("Failed to decide for all flags, continuing:", error);
	}

	const headers = new Headers();
	headers.set("Content-Type", "text/plain");
	headers.set(
		"Set-Cookie",
		stringifySetCookie({
			name: OPTIMIZELY_USER_ID_COOKIE_NAME,
			value: userId,
		}),
	);
	return new Response(
		"Welcome to the Optimizely Starter template. Check logs for decision results.",
		{ headers },
	);
}
