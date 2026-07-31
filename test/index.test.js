import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import workerExport from "../src/index.js";

// Mock the optimizely_helper module
vi.mock("../src/optimizely_helper.js", () => ({
	getOptimizelyClient: vi.fn(),
}));

// Mock cookie module
vi.mock("cookie", () => ({
	parseCookie: vi.fn(),
	stringifySetCookie: vi.fn(),
}));

describe("index.js - Cloudflare Worker", () => {
	let mockOptimizelyClient;
	let mockUserContext;
	let mockDecision;
	let getOptimizelyClient;
	let cookie;

	beforeEach(async () => {
		vi.clearAllMocks();

		// Import mocked modules
		const optimizelyHelper = await import("../src/optimizely_helper.js");
		const cookieModule = await import("cookie");

		getOptimizelyClient = optimizelyHelper.getOptimizelyClient;
		cookie = {
			parse: cookieModule.parseCookie,
			serialize: cookieModule.stringifySetCookie,
		};

		// Set up mock decision
		mockDecision = {
			enabled: true,
			flagKey: "test-flag",
			userContext: {
				getUserId: vi.fn(() => "test-user-123"),
			},
		};

		// Set up mock user context
		mockUserContext = {
			decide: vi.fn(() => mockDecision),
			decideAll: vi.fn(() => ({
				"test-flag": mockDecision,
				"another-flag": {
					enabled: false,
					flagKey: "another-flag",
					userContext: {
						getUserId: vi.fn(() => "test-user-123"),
					},
				},
			})),
		};

		// Set up mock Optimizely client
		mockOptimizelyClient = {
			createUserContext: vi.fn(() => mockUserContext),
		};

		getOptimizelyClient.mockResolvedValue(mockOptimizelyClient);
		cookie.serialize.mockReturnValue(
			"optimizely_user_id=test-user-123; Path=/",
		);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("default export", () => {
		it("should have fetch method that delegates to handleRequest", async () => {
			expect(workerExport).toHaveProperty("fetch");
			expect(typeof workerExport.fetch).toBe("function");

			const mockRequest = new Request("https://example.com");
			const mockEnv = { OPTIMIZELY_SDK_KEY: "test-key" };
			const mockCtx = {};

			cookie.parse.mockReturnValue({});

			const response = await workerExport.fetch(mockRequest, mockEnv, mockCtx);

			expect(response).toBeInstanceOf(Response);
			expect(getOptimizelyClient).toHaveBeenCalledWith(mockEnv, mockCtx);
		});
	});

	describe("handleRequest", () => {
		let mockRequest;
		let mockEnv;
		let mockCtx;

		beforeEach(() => {
			mockEnv = { OPTIMIZELY_SDK_KEY: "test-key" };
			mockCtx = {};
		});

		it("should handle request with no cookies and generate new user ID", async () => {
			mockRequest = new Request("https://example.com");
			cookie.parse.mockReturnValue({});

			const response = await workerExport.fetch(mockRequest, mockEnv, mockCtx);

			expect(cookie.parse).toHaveBeenCalledWith("");
			expect(mockOptimizelyClient.createUserContext).toHaveBeenCalledWith(
				"test-uuid-123",
				{},
			);
			expect(response.status).toBe(200);
			expect(response.headers.get("Content-Type")).toBe("text/plain");
		});

		it("should handle request with existing user ID cookie", async () => {
			mockRequest = new Request("https://example.com", {
				headers: { Cookie: "optimizely_user_id=existing-user-456" },
			});
			cookie.parse.mockReturnValue({ optimizely_user_id: "existing-user-456" });

			const response = await workerExport.fetch(mockRequest, mockEnv, mockCtx);

			expect(cookie.parse).toHaveBeenCalledWith(
				"optimizely_user_id=existing-user-456",
			);
			expect(mockOptimizelyClient.createUserContext).toHaveBeenCalledWith(
				"existing-user-456",
				{},
			);
			expect(response.status).toBe(200);
		});

		it("should handle multiple cookies correctly", async () => {
			mockRequest = new Request("https://example.com", {
				headers: {
					Cookie:
						"other_cookie=value; optimizely_user_id=user-789; another=test",
				},
			});
			cookie.parse.mockReturnValue({
				other_cookie: "value",
				optimizely_user_id: "user-789",
				another: "test",
			});

			const response = await workerExport.fetch(mockRequest, mockEnv, mockCtx);

			expect(mockOptimizelyClient.createUserContext).toHaveBeenCalledWith(
				"user-789",
				{},
			);
			expect(response.status).toBe(200);
		});

		it("should call decide for single flag and log results", async () => {
			mockRequest = new Request("https://example.com");
			cookie.parse.mockReturnValue({});

			await workerExport.fetch(mockRequest, mockEnv, mockCtx);

			expect(mockUserContext.decide).toHaveBeenCalledWith("YOUR_FLAG_HERE");
			expect(global.console.info).toHaveBeenCalledWith(
				'The Flag "test-flag" was Enabled for the user "test-user-123"',
			);
		});

		it("should handle disabled flag decision", async () => {
			mockDecision.enabled = false;
			mockRequest = new Request("https://example.com");
			cookie.parse.mockReturnValue({});

			await workerExport.fetch(mockRequest, mockEnv, mockCtx);

			expect(global.console.info).toHaveBeenCalledWith(
				'The Flag "test-flag" was Not Enabled for the user "test-user-123"',
			);
		});

		it("should call decideAll and log all flag results", async () => {
			mockRequest = new Request("https://example.com");
			cookie.parse.mockReturnValue({});

			await workerExport.fetch(mockRequest, mockEnv, mockCtx);

			expect(mockUserContext.decideAll).toHaveBeenCalled();
			expect(global.console.info).toHaveBeenCalledWith(
				'The Flag "test-flag" was Enabled for the user "test-user-123"',
			);
			expect(global.console.info).toHaveBeenCalledWith(
				'The Flag "another-flag" was Not Enabled for the user "test-user-123"',
			);
		});

		it("should set response headers correctly", async () => {
			mockRequest = new Request("https://example.com");
			cookie.parse.mockReturnValue({});

			const response = await workerExport.fetch(mockRequest, mockEnv, mockCtx);

			expect(response.headers.get("Content-Type")).toBe("text/plain");
			expect(cookie.serialize).toHaveBeenCalledWith({
				name: "optimizely_user_id",
				value: "test-uuid-123",
			});
			expect(response.headers.get("Set-Cookie")).toBe(
				"optimizely_user_id=test-user-123; Path=/",
			);
		});

		it("should return correct response body", async () => {
			mockRequest = new Request("https://example.com");
			cookie.parse.mockReturnValue({});

			const response = await workerExport.fetch(mockRequest, mockEnv, mockCtx);
			const responseText = await response.text();

			expect(responseText).toBe(
				"Welcome to the Optimizely Starter template. Check logs for decision results.",
			);
		});

		it("should handle Optimizely client errors gracefully", async () => {
			mockRequest = new Request("https://example.com");
			cookie.parse.mockReturnValue({});
			getOptimizelyClient.mockRejectedValue(new Error("SDK Key missing"));

			const consoleErrorSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			const response = await workerExport.fetch(mockRequest, mockEnv, mockCtx);
			expect(response.status).toBe(200);
			expect(response.headers.get("Content-Type")).toBe("text/plain");
			const text = await response.text();
			expect(text).toContain("Feature flags unavailable");
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				"Failed to initialize Optimizely client, continuing without feature flags:",
				expect.any(Error),
			);

			consoleErrorSpy.mockRestore();
		});

		it("should handle decision errors gracefully", async () => {
			mockRequest = new Request("https://example.com");
			cookie.parse.mockReturnValue({});
			mockUserContext.decide.mockImplementation(() => {
				throw new Error("Decision error");
			});

			const consoleErrorSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			const response = await workerExport.fetch(mockRequest, mockEnv, mockCtx);
			expect(response.status).toBe(200);
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				"Failed to decide for single flag, continuing:",
				expect.any(Error),
			);

			consoleErrorSpy.mockRestore();
		});

		it("should handle decideAll errors gracefully", async () => {
			mockRequest = new Request("https://example.com");
			cookie.parse.mockReturnValue({});
			mockUserContext.decideAll.mockImplementation(() => {
				throw new Error("DecideAll error");
			});

			const consoleErrorSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			const response = await workerExport.fetch(mockRequest, mockEnv, mockCtx);
			expect(response.status).toBe(200);
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				"Failed to decide for all flags, continuing:",
				expect.any(Error),
			);

			consoleErrorSpy.mockRestore();
		});
		it("should preserve user ID when setting cookie for existing user", async () => {
			mockRequest = new Request("https://example.com", {
				headers: { Cookie: "optimizely_user_id=preserved-user-id" },
			});
			cookie.parse.mockReturnValue({ optimizely_user_id: "preserved-user-id" });

			await workerExport.fetch(mockRequest, mockEnv, mockCtx);

			expect(cookie.serialize).toHaveBeenCalledWith({
				name: "optimizely_user_id",
				value: "preserved-user-id",
			});
			expect(mockOptimizelyClient.createUserContext).toHaveBeenCalledWith(
				"preserved-user-id",
				{},
			);
		});
	});
});
