import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'miniflare',
    environmentOptions: {
      modules: true,
      globals: {
        crypto: {
          randomUUID: () => 'test-uuid-123'
        }
      }
    },
    setupFiles: ['./test/setup.js']
  }
});