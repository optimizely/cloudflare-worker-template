import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@optimizely/optimizely-sdk/universal", () => ({
	createInstance: vi.fn(),
	createStaticProjectConfigManager: vi.fn(),
	createForwardingEventProcessor: vi.fn(),
	LogLevel: {
		Error: "ERROR",
	},
}));

let getDatafile;
let getOptimizelyClient;

describe("Optimizely Helper", () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		vi.resetModules();

		const mod = await import("../src/optimizely_helper.js");
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
			global.fetch = vi.fn().mockResolvedValue(mockResponse);

			const sdkKey = "test-sdk-key";
			const ttl = 600;

			const result = await getDatafile(sdkKey, ttl);

			expect(global.fetch).toHaveBeenCalledWith(
				`https://cdn.optimizely.com/datafiles/${sdkKey}.json`,
				expect.objectContaining({
					method: "GET",
					headers: expect.any(Headers),
					signal: expect.any(AbortSignal),
				}),
			);
			expect(result).toBe('{"version": "4", "experiments": []}');
		});

		it("should handle fetch errors", async () => {
			global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

			const sdkKey = "test-sdk-key";
			const ttl = 600;

			await expect(getDatafile(sdkKey, ttl)).rejects.toThrow("Network error");
		});
	});

	describe("getOptimizelyClient", () => {
		let mockCreateInstance;
		let mockCreateStaticProjectConfigManager;
		let mockCreateForwardingEventProcessor;
		let mockClient;
		let mockProjectConfigManager;
		let mockEventProcessor;

		beforeEach(async () => {
			const {
				createInstance,
				createStaticProjectConfigManager,
				createForwardingEventProcessor,
			} = await import("@optimizely/optimizely-sdk/universal");

			mockCreateInstance = createInstance;
			mockCreateStaticProjectConfigManager = createStaticProjectConfigManager;
			mockCreateForwardingEventProcessor = createForwardingEventProcessor;

			mockClient = {
				setDatafile: vi.fn(),
			};
			mockProjectConfigManager = {};
			mockEventProcessor = {};

			mockCreateInstance.mockReturnValue(mockClient);
			mockCreateStaticProjectConfigManager.mockReturnValue(
				mockProjectConfigManager,
			);
			mockCreateForwardingEventProcessor.mockReturnValue(mockEventProcessor);

			// Mock getDatafile by mocking the CloudflareRequestHandler response
			global.fetch = vi.fn().mockResolvedValue({
				status: 200,
				ok: true,
				headers: {
					get: () => "application/json",
					entries: () => [["content-type", "application/json"]],
				},
				json: vi.fn().mockResolvedValue('{"version": "4"}'),
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
				expect.objectContaining({
					method: "GET",
					headers: expect.any(Headers),
					signal: expect.any(AbortSignal),
				}),
			);
			expect(mockCreateStaticProjectConfigManager).toHaveBeenCalledWith({
				datafile: '{"version": "4"}',
			});
			expect(mockCreateForwardingEventProcessor).toHaveBeenCalledWith({
				eventDispatcher: expect.any(Object),
			});
			expect(mockCreateInstance).toHaveBeenCalledWith({
				projectConfigManager: mockProjectConfigManager,
				eventProcessor: mockEventProcessor,
				requestHandler: expect.any(Object),
				clientEngine: "javascript-sdk/cloudflare",
				disposable: true,
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
				await getOptimizelyClient(env, ctx);

				// Advance time beyond TTL (300 seconds = 300,000 ms)
				currentTime += 301000;

				// Mock new datafile response
				global.fetch = vi.fn().mockResolvedValue({
					status: 200,
					ok: true,
					headers: {
						get: () => "application/json",
						entries: () => [["content-type", "application/json"]],
					},
					json: vi.fn().mockResolvedValue('{"version": "5"}'),
				});

				// Second call after TTL expires - should create new client
				const client2 = await getOptimizelyClient(env, ctx);

				expect(client2).toBe(mockClient);
				expect(mockCreateStaticProjectConfigManager).toHaveBeenCalledTimes(2);
				expect(mockCreateInstance).toHaveBeenCalledTimes(2);
			} finally {
				Date.now = originalDateNow;
			}
		});
	});
});
