import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "miniflare",
		environmentOptions: {
			modules: true,
		},
		threads: false,
		setupFiles: ["./test/setup.js"],
	},
});
