# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.0.1] - July 31, 2026

### Changed

- Updated `@optimizely/optimizely-sdk` from `6.1.0` to `6.5.0`.
- Updated `cookie` package from `1.0.2` to `2.0.1`. Migrated to the v2 API: `parse` → `parseCookie`, `serialize(name, value)` → `stringifySetCookie({ name, value })`.
- Updated `@biomejs/biome` from `2.2.4` to `2.5.6`, and bumped the `biome.jsonc` schema version to match.
- Updated `miniflare` from `4.20250917.0` to `4.20260730.0`.
- Updated `vitest` from `3.2.4` to `4.1.10`.
- Set minimum Node.js version to `22` via `engines` (required by `cookie@2` and `miniflare@4.20260730.0`); updated README requirements accordingly.

### Added

- `.gitattributes` normalizing line endings to LF across platforms, preventing CRLF churn from `biome --write` on Windows checkouts.

## [1.0.0] - October 10, 2025

### Changed

- Updated `@optimizely/optimizely-sdk` to version `6.1.0` with ES modules support.
- Migrated from addEventListener pattern to modern Cloudflare Workers fetch handler export syntax.
- Replaced `uuid` package with native `crypto.randomUUID()` for user ID generation.
- Replaced Webpack build with native ES modules.
- Migrated configuration from `wrangler.toml` to `wrangler.jsonc`.
- Refactored request handler to return standardized response format: `{statusCode: number, body: string, headers: Object}`.
- Implemented graceful degradation: worker continues to function even if Optimizely initialization fails.
- Enhanced error handling with try-catch blocks around all Optimizely operations - errors are logged but don't break the worker.
- Added comprehensive JSDoc documentation throughout the codebase.
- Improved datafile caching with module-scope cache and configurable TTL via `OPTIMIZELY_DATAFILE_CACHE_TTL_SECONDS` environment variable (default: 300 seconds).
- Updated `cookie` package from `0.4.2` to `1.0.2`.
- Migrated from Prettier to Biome for code formatting and linting.

### Added

- New `CloudflareRequestHandler` class implementing custom request handler for Cloudflare Workers environment.
- New `getOptimizelyClient` helper function for centralized client management with smart caching.
- New `getDatafile` helper function for fetching datafiles from Optimizely CDN.
- Comprehensive unit test suite using Vitest and vitest-environment-miniflare.
- Test files: `index.test.js`, `optimizely_helper.test.js`, `request_handler.test.js`.
- Test utilities and setup files for easier testing.
- `biome.jsonc` configuration for code quality tools.
- `vitest.config.js` for test configuration.

### Removed

- Removed `uuid` package dependency (replaced with native Web Crypto API).
- Removed Webpack build configuration (`webpack.config.js`).
- Removed old `wrangler.toml` (replaced with `wrangler.jsonc`).
- Removed Prettier in favor of Biome.

### Fixed

- Response body is now always returned as a string for consistent interface with Optimizely SDK expectations.
- Worker no longer returns 500 errors on Optimizely failures; continues with degraded functionality.
- Improved AbortError handling in request handler with proper error wrapping.

## [0.2.0] - April 4, 2022

### Added

- Added cookie based user id memorization to support sticky [bucketing](https://docs.developers.optimizely.com/full-stack/v4.0/docs/how-bucketing-works).

### Changed

- Updated `@optimizely/optimizely-sdk` version to `4.9.1`.

## [0.1.0] - November 18, 2021

### Added

- First version of Cloudflare worker template with datafile caching and event dispatcher.
