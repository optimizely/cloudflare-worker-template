// Test setup file
import { vi } from "vitest";

// Mock fetch globally
global.fetch = vi.fn();

// Mock crypto.randomUUID for Node.js environment
if (!global.crypto) {
	global.crypto = {};
}
global.crypto.randomUUID = vi.fn(() => "test-uuid-123");

// Mock console methods
global.console = {
	...console,
	info: vi.fn(),
	log: vi.fn(),
	error: vi.fn(),
	warn: vi.fn(),
};

// Mock Request and Response for Node.js environment
if (typeof global.Request === "undefined") {
	global.Request = class MockRequest {
		constructor(url, options = {}) {
			this.url = url;
			this.method = options.method || "GET";
			this.headers = new Map();

			if (options.headers) {
				if (options.headers instanceof Map) {
					this.headers = new Map(options.headers);
				} else if (typeof options.headers === "object") {
					Object.entries(options.headers).forEach(([key, value]) => {
						this.headers.set(key.toLowerCase(), value);
					});
				}
			}
		}
	};
}

if (typeof global.Response === "undefined") {
	global.Response = class MockResponse {
		constructor(body, options = {}) {
			this.body = body;
			this.status = options.status || 200;
			this.statusText = options.statusText || "OK";
			this.headers = new Map();

			if (options.headers) {
				if (options.headers instanceof Map) {
					this.headers = new Map(options.headers);
				} else if (typeof options.headers === "object") {
					Object.entries(options.headers).forEach(([key, value]) => {
						this.headers.set(key.toLowerCase(), value);
					});
				}
			}
		}

		async text() {
			return String(this.body);
		}

		async json() {
			return JSON.parse(String(this.body));
		}
	};
}

if (typeof global.Headers === "undefined") {
	global.Headers = class MockHeaders extends Map {
		get(name) {
			return super.get(name.toLowerCase());
		}

		set(name, value) {
			return super.set(name.toLowerCase(), value);
		}

		has(name) {
			return super.has(name.toLowerCase());
		}

		delete(name) {
			return super.delete(name.toLowerCase());
		}
	};
}
