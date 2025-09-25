/**
 * Copyright 2025 Optimizely
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

/**
 * CloudflareRequestHandler implements a request handler using the Fetch API
 * available in Cloudflare Workers. It supports making HTTP requests with
 * customizable methods, headers, and bodies, and handles response parsing
 * based on content type.
 */
export class CloudflareRequestHandler {
	/**
	 * Create a new CloudflareRequestHandler instance.
	 * @param {Object} ctx - Optional Cloudflare Worker execution context with waitUntil method
	 */
	constructor(ctx = null) {
		this.ctx = ctx;
	}

	/**
	 * Make a fetch request inside Cloudflare Workers.
	 * @param {string} url - The request URL
	 * @param {Record<string,string>} headers - Plain object of headers
	 * @param {string} method - HTTP method (will be normalized to uppercase)
	 * @param {any} data - Request body. Objects will be JSON.stringified unless already FormData/ArrayBuffer/Blob.
	 * @returns {{responsePromise: Promise<{status:number,ok:boolean,body:any,headers:Object}>, abort: ()=>void}}
	 */
	makeRequest(url, headers = {}, method = "GET", data) {
		const controller = new AbortController();
		method = (method || "GET").toUpperCase();
		headers = new Headers(headers || {});

		const requestOptions = {
			method,
			headers,
			signal: controller.signal,
		};

		if (data !== undefined) {
			if (typeof data === "object") {
				try {
					requestOptions.body = JSON.stringify(data);
					if (!headers.has("Content-Type")) {
						headers.set("Content-Type", "application/json");
					}
				} catch {
					throw new TypeError("Failed to stringify request body");
				}
			} else {
				// Assume string
				requestOptions.body = data;
			}
		}

		const responsePromise = fetch(url, requestOptions)
			.then(async (response) => {
				const contentType = response.headers.get("content-type") || "";
				let body;
				try {
					if (contentType.includes("application/json")) {
						body = await response.json();
					} else {
						body = await response.text();
					}
				} catch {
					// If parsing fails, fallback to text
					try {
						body = await response.text();
					} catch {
						body = null;
					}
				}

				return {
					status: response.status,
					ok: response.ok,
					body,
					headers:
						response.headers && typeof response.headers.entries === "function"
							? Object.fromEntries(response.headers.entries())
							: {},
				};
			})
			.catch((error) => {
				if (error && error.name === "AbortError") {
					// Preserve original error as cause where supported is not available in Workers, so set a message
					const abortError = new Error("Request aborted");
					abortError.name = "AbortError";
					throw abortError;
				}
				throw error;
			});

		if (this.ctx && typeof this.ctx.waitUntil === "function") {
			this.ctx.waitUntil(responsePromise);
		}

		return {
			responsePromise,
			abort: () => {
				controller.abort();
			},
		};
	}
}
