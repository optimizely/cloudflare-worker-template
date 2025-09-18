import { vi } from "vitest";

/**
 * Creates a mock Request object for testing
 * @param {string} url - The request URL
 * @param {Object} options - Request options
 * @returns {Request} Mock request object
 */
export function createMockRequest(url = "https://example.com", options = {}) {
	return new Request(url, {
		method: "GET",
		...options,
	});
}

/**
 * Creates a mock environment object for Cloudflare Workers
 * @param {Object} overrides - Environment variable overrides
 * @returns {Object} Mock environment object
 */
export function createMockEnv(overrides = {}) {
	return {
		OPTIMIZELY_SDK_KEY: "test-sdk-key",
		...overrides,
	};
}

/**
 * Creates a mock execution context for Cloudflare Workers
 * @param {Object} overrides - Context overrides
 * @returns {Object} Mock context object
 */
export function createMockCtx(overrides = {}) {
	return {
		waitUntil: vi.fn(),
		passThroughOnException: vi.fn(),
		...overrides,
	};
}

/**
 * Creates a mock Optimizely client with configurable behavior
 * @param {Object} options - Configuration options
 * @returns {Object} Mock Optimizely client
 */
export function createMockOptimizelyClient(options = {}) {
	const mockDecision = {
		enabled: options.enabled ?? true,
		flagKey: options.flagKey ?? "test-flag",
		userContext: {
			getUserId: vi.fn(() => options.userId ?? "test-user-123"),
		},
		variationKey: options.variationKey ?? "control",
		variables: options.variables ?? {},
		ruleKey: options.ruleKey ?? null,
		reasons: options.reasons ?? [],
	};

	const mockUserContext = {
		decide: vi.fn(() => mockDecision),
		decideAll: vi.fn(() => ({
			[mockDecision.flagKey]: mockDecision,
		})),
		trackEvent: vi.fn(),
		setForcedDecision: vi.fn(),
		getForcedDecision: vi.fn(),
		removeForcedDecision: vi.fn(),
		removeAllForcedDecisions: vi.fn(),
		getUserId: vi.fn(() => options.userId ?? "test-user-123"),
		getAttributes: vi.fn(() => options.attributes ?? {}),
		setAttributes: vi.fn(),
	};

	return {
		createUserContext: vi.fn(() => mockUserContext),
		setDatafile: vi.fn(),
		getDatafile: vi.fn(() => '{"version": "4"}'),
		isValid: vi.fn(() => true),
		close: vi.fn(),
		activate: vi.fn(),
		getEnabledFeatures: vi.fn(() => []),
		getFeatureVariable: vi.fn(),
		getFeatureVariableBoolean: vi.fn(),
		getFeatureVariableDouble: vi.fn(),
		getFeatureVariableInteger: vi.fn(),
		getFeatureVariableString: vi.fn(),
		getAllFeatureVariables: vi.fn(() => ({})),
		isFeatureEnabled: vi.fn(() => options.enabled ?? true),
		track: vi.fn(),
		// Expose mocks for testing
		_mockUserContext: mockUserContext,
		_mockDecision: mockDecision,
	};
}

/**
 * Creates a mock Response object with configurable properties
 * @param {string} body - Response body
 * @param {Object} options - Response options
 * @returns {Response} Mock response object
 */
export function createMockResponse(body = "OK", options = {}) {
	return new Response(body, {
		status: 200,
		statusText: "OK",
		headers: new Headers(),
		...options,
	});
}

/**
 * Creates a mock fetch function that returns predefined responses
 * @param {Array} responses - Array of responses to return in sequence
 * @returns {Function} Mock fetch function
 */
export function createMockFetch(responses = []) {
	const mockFetch = vi.fn();

	responses.forEach((response) => {
		mockFetch.mockResolvedValueOnce(response);
	});

	// Default response for any additional calls
	if (responses.length === 0) {
		mockFetch.mockResolvedValue(createMockResponse());
	}

	return mockFetch;
}

/**
 * Creates a mock cookie object with parse and serialize methods
 * @param {Object} parsedCookies - Object to return from parse
 * @param {string} serializedCookie - String to return from serialize
 * @returns {Object} Mock cookie object
 */
export function createMockCookie(
	parsedCookies = {},
	serializedCookie = "test=cookie",
) {
	return {
		parse: vi.fn(() => parsedCookies),
		serialize: vi.fn(() => serializedCookie),
	};
}

/**
 * Sets up common test environment with mocked globals
 */
export function setupTestEnvironment() {
	// Mock crypto.randomUUID
	global.crypto = {
		randomUUID: vi.fn(() => "test-uuid-123"),
	};

	// Mock console methods
	global.console = {
		...console,
		info: vi.fn(),
		log: vi.fn(),
		error: vi.fn(),
		warn: vi.fn(),
	};

	// Mock Date.now for time-based tests
	const originalDateNow = Date.now;
	const mockDateNow = vi.fn(() => 1000000000000);
	Date.now = mockDateNow;

	return {
		restoreGlobals: () => {
			Date.now = originalDateNow;
		},
		setCurrentTime: (time) => {
			mockDateNow.mockReturnValue(time);
		},
	};
}

/**
 * Assertion helpers for testing responses
 */
export const responseAssertions = {
	/**
	 * Asserts that a response has the expected properties
	 * @param {Response} response - Response to test
	 * @param {Object} expected - Expected properties
	 */
	assertResponse(response, expected = {}) {
		if (expected.status) {
			expect(response.status).toBe(expected.status);
		}
		if (expected.statusText) {
			expect(response.statusText).toBe(expected.statusText);
		}
		if (expected.headers) {
			Object.entries(expected.headers).forEach(([key, value]) => {
				expect(response.headers.get(key)).toBe(value);
			});
		}
	},

	/**
	 * Asserts that a response body matches expected text
	 * @param {Response} response - Response to test
	 * @param {string} expectedText - Expected body text
	 */
	async assertResponseText(response, expectedText) {
		const text = await response.text();
		expect(text).toBe(expectedText);
	},
};
