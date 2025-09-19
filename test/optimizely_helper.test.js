import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
let dispatchEvent;
let getDatafile;
let getOptimizelyClient;

// Mock the Optimizely SDK
vi.mock("@optimizely/optimizely-sdk/universal", () => ({
	createInstance: vi.fn(),
	LogLevel: {
		Error: "ERROR",
	},
}));

describe("optimizely_helper", () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		vi.resetModules();

		const mod = await import("../src/optimizely_helper.js");
		dispatchEvent = mod.dispatchEvent;
		getDatafile = mod.getDatafile;
		getOptimizelyClient = mod.getOptimizelyClient;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("getDatafile", () => {
		it("should fetch datafile from Optimizely CDN with correct URL and TTL", async () => {
			const mockResponse = {
				text: vi.fn().mockResolvedValue('{"version": "4", "experiments": []}'),
			};
			global.fetch.mockResolvedValue(mockResponse);

			const sdkKey = "test-sdk-key";
			const ttl = 600;

			const result = await getDatafile(sdkKey, ttl);

			expect(global.fetch).toHaveBeenCalledWith(
				`https://cdn.optimizely.com/datafiles/${sdkKey}.json`,
				{ cf: { cacheTtl: ttl } },
			);
			expect(mockResponse.text).toHaveBeenCalled();
			expect(result).toBe('{"version": "4", "experiments": []}');
		});

		it("should handle fetch errors", async () => {
			global.fetch.mockRejectedValue(new Error("Network error"));

			const sdkKey = "test-sdk-key";
			const ttl = 600;

			await expect(getDatafile(sdkKey, ttl)).rejects.toThrow("Network error");
		});
	});

	describe("dispatchEvent", () => {
		it("should create and send POST request with correct parameters", async () => {
			const mockResponse = { ok: true };
			global.fetch.mockResolvedValue(mockResponse);

			const eventData = {
				url: "https://logx.optimizely.com/v1/events",
				params: {
					project_id: "12345",
					account_id: "67890",
					client_name: "javascript-sdk",
					visitors: [],
				},
			};

			const result = await dispatchEvent(eventData);

			expect(global.fetch).toHaveBeenCalledWith(expect.any(Request));

			const calledRequest = global.fetch.mock.calls[0][0];
			expect(calledRequest.url).toBe(eventData.url);
			expect(calledRequest.method).toBe("POST");
			expect(result).toBe(mockResponse);
		});

		it("should handle dispatch errors", async () => {
			global.fetch.mockRejectedValue(new Error("Dispatch failed"));

			const eventData = {
				url: "https://logx.optimizely.com/v1/events",
				params: { test: "data" },
			};

			await expect(dispatchEvent(eventData)).rejects.toThrow("Dispatch failed");
		});
	});

	describe("getOptimizelyClient", () => {
		let mockCreateInstance;
		let mockClient;

		beforeEach(async () => {
			const { createInstance } = await import(
				"@optimizely/optimizely-sdk/universal"
			);
			mockCreateInstance = createInstance;

			mockClient = {
				setDatafile: vi.fn(),
			};
			mockCreateInstance.mockReturnValue(mockClient);

			// Mock getDatafile
			global.fetch.mockResolvedValue({
				text: vi.fn().mockResolvedValue('{"version": "4"}'),
			});
		});

		it("should throw error when SDK key is missing", async () => {
			const env = {};
			const ctx = {};

			await expect(getOptimizelyClient(env, ctx)).rejects.toThrow(
				"OPTIMIZELY_SDK_KEY environment variable is required",
			);
		});

		it("should create new client when called for the first time", async () => {
			const env = { OPTIMIZELY_SDK_KEY: "test-key" };
			const ctx = {};

			const client = await getOptimizelyClient(env, ctx);

			expect(global.fetch).toHaveBeenCalledWith(
				"https://cdn.optimizely.com/datafiles/test-key.json",
				{ cf: { cacheTtl: 600 } },
			);
			expect(mockCreateInstance).toHaveBeenCalledWith({
				datafile: '{"version": "4"}',
				logLevel: "ERROR",
				clientEngine: "javascript-sdk/cloudflare",
			});
			expect(client).toBe(mockClient);
		});

		it("should return cached client when called within TTL", async () => {
			const env = { OPTIMIZELY_SDK_KEY: "test-key" };
			const ctx = {};

			// First call
			const client1 = await getOptimizelyClient(env, ctx);

			// Clear fetch mock to ensure it's not called again
			vi.clearAllMocks();

			// Second call within TTL
			const client2 = await getOptimizelyClient(env, ctx);

			expect(global.fetch).not.toHaveBeenCalled();
			expect(client1).toBe(client2);
		});

		it("should refresh datafile when cache TTL expires", async () => {
			const env = { OPTIMIZELY_SDK_KEY: "test-key" };
			const ctx = {};

			// Mock Date.now to simulate time progression
			const originalDateNow = Date.now;
			let currentTime = 1000000000000; // Start time
			Date.now = vi.fn(() => currentTime);

			try {
				// First call - should create client
				const client1 = await getOptimizelyClient(env, ctx);

				// Advance time beyond TTL (600 seconds = 600,000 ms)
				currentTime += 601000;

				// Mock new datafile response
				global.fetch.mockResolvedValue({
					text: vi.fn().mockResolvedValue('{"version": "5"}'),
				});

				// Second call after TTL expires - should return same client instance and call setDatafile
				const client2 = await getOptimizelyClient(env, ctx);

				expect(client1).toBe(client2);
				expect(mockClient.setDatafile).toHaveBeenCalledWith('{"version": "5"}');
			} finally {
				Date.now = originalDateNow;
			}
		});
	});
});
