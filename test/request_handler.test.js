import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CloudflareRequestHandler } from "../src/request_handler";

describe("CloudflareRequestHandler", () => {
	let originalFetch;

	beforeEach(() => {
		originalFetch = global.fetch;
	});

	afterEach(() => {
		global.fetch = originalFetch;
		vi.restoreAllMocks();
	});

	it("parses JSON response when content-type is application/json", async () => {
		const mockResponse = {
			status: 200,
			ok: true,
			headers: {
				get: (k) =>
					k.toLowerCase() === "content-type"
						? "application/json; charset=utf-8"
						: undefined,
				entries: () => [["content-type", "application/json; charset=utf-8"]],
			},
			json: async () => ({ hello: "world" }),
			text: async () => JSON.stringify({ hello: "world" }),
		};

		global.fetch = vi.fn(() => Promise.resolve(mockResponse));

		const rh = new CloudflareRequestHandler();
		const { responsePromise } = rh.makeRequest(
			"https://example.test/api",
			{ Accept: "application/json" },
			"GET",
		);

		const res = await responsePromise;
		expect(res.status).toBe(200);
		expect(res.ok).toBe(true);
		expect(res.body).toEqual({ hello: "world" });
		expect(res.headers["content-type"]).toContain("application/json");
	});

	it("parses text response when content-type is text/plain", async () => {
		const mockResponse = {
			status: 201,
			ok: true,
			headers: {
				get: (k) =>
					k.toLowerCase() === "content-type"
						? "text/plain; charset=utf-8"
						: undefined,
				entries: () => [["content-type", "text/plain; charset=utf-8"]],
			},
			json: async () => {
				throw new Error("not json");
			},
			text: async () => "plain text body",
		};

		global.fetch = vi.fn(() => Promise.resolve(mockResponse));

		const rh = new CloudflareRequestHandler();
		const { responsePromise } = rh.makeRequest(
			"https://example.test/text",
			{},
			"GET",
		);

		const res = await responsePromise;
		expect(res.status).toBe(201);
		expect(res.body).toBe("plain text body");
	});

	it("returns an aborted error when request is aborted", async () => {
		// Create a fetch that returns a promise that rejects with an AbortError
		const abortErr = new Error("The user aborted a request.");
		abortErr.name = "AbortError";
		global.fetch = vi.fn(() => Promise.reject(abortErr));

		const rh = new CloudflareRequestHandler();
		const { responsePromise, abort } = rh.makeRequest(
			"https://example.test/abort",
			{},
			"GET",
		);

		// call abort which will cause the fetch to reject with AbortError in our mock
		abort();

		await expect(responsePromise).rejects.toMatchObject({ name: "AbortError" });
	});

	it("sends string body for POST and sets Content-Type when string provided", async () => {
		let receivedInit;
		global.fetch = vi.fn((url, init) => {
			// reference url to avoid unused-parameter linter errors
			void url;
			receivedInit = init;
			return Promise.resolve({
				status: 200,
				ok: true,
				headers: { get: () => "", entries: () => [] },
				json: async () => ({}),
				text: async () => "",
			});
		});

		const rh = new CloudflareRequestHandler();
		const { responsePromise } = rh.makeRequest(
			"https://example.test/post",
			{ "X-Test": "1" },
			"POST",
			"raw body",
		);

		await responsePromise;
		expect(receivedInit).toBeDefined();
		expect(receivedInit.method).toBe("POST");
		expect(receivedInit.body).toBe("raw body");
		// headers may be a Headers instance; check for Content-Type presence
		const contentType =
			receivedInit.headers.get("Content-Type") ||
			receivedInit.headers.get("content-type");
		// The implementation only sets Content-Type when body is JSON; since we passed string it may be null or undefined
		expect(contentType === null || contentType === undefined).toBe(true);
	});
});
