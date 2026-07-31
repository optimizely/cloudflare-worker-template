# Optimizely Cloudflare Workers Starter Kit

This repository houses the Cloudflare Workers Starter Kit which provides a quickstart for users who would like to use Optimizely Feature Experimentation and Optimizely Full Stack (legacy) with Cloudflare Workers.

Optimizely Feature Experimentation is an A/B testing and feature management tool for product development teams that enables you to experiment at every step. Using Optimizely Feature Experimentation allows for every feature on your roadmap to be an opportunity to discover hidden insights. Learn more at [Optimizely.com](https://www.optimizely.com/products/experiment/feature-experimentation/), or see the [developer documentation](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs/welcome).

Optimizely Rollouts is [free feature flags](https://www.optimizely.com/free-feature-flagging/) for development teams. You can easily roll out and roll back features in any application without code deploys, mitigating risk for every feature on your roadmap.

## Quick Start

Get up and running in under 2 minutes:

```bash
# 1. Clone the template (replace vX.Y.Z with the latest release tag from https://github.com/optimizely/cloudflare-worker-template/releases)
git clone --branch vX.Y.Z --depth 1 https://github.com/optimizely/cloudflare-worker-template.git my-project
cd my-project

# 2. Install dependencies
npm install

# 3. Set your Optimizely SDK key (get it from Settings > Environments in your Optimizely dashboard)
cp .env.example .env
# Edit .env and add your SDK key

# 4. Start local development server
npm run dev

# 5. Visit http://localhost:8787 to see your worker in action!
```

For detailed setup instructions, see the [Get Started](#get-started) section below.

## Features

- **Modern ES Modules**: Uses ES module syntax for better tree-shaking and modern JavaScript features
- **Optimizely SDK v6**: Latest version of the Optimizely JavaScript SDK
- **Cloudflare Cache Integration**: Automatic datafile caching using Cloudflare's edge cache
- **Development Tools**: Integrated Biome for linting/formatting, Miniflare for local development
- **Cookie-based User Persistence**: Automatic user ID generation and persistence

## Get Started

Refer to the [Optimizely Cloudflare Workers Starter Kit documentation](https://docs.developers.optimizely.com/feature-experimentation/docs/cloudflare-workers) for detailed instructions about using this starter kit.

### Prerequisites

**System Requirements:**
- Node.js 22.x or higher (required by `cookie` and `miniflare`)
- npm 9.x or higher

**Accounts & Tools:**

1. **Optimizely Account**: If you don't have an account, [register for a free account](https://www.optimizely.com/products/feature-experimentation/).

2. **Cloudflare Account with Workers**: Visit the [Cloudflare Workers product page](https://workers.cloudflare.com/) to sign up.

3. **Wrangler CLI**: Install via npm:
   ```bash
   npm install -g wrangler
   ```
   Or see the [Cloudflare Wrangler CLI documentation](https://developers.cloudflare.com/workers/cli-wrangler) for other installation methods.

### Install the Starter Kit

1. Clone a specific tagged version of this template to create your project.

   ```bash
   # Clone the template (replace vX.Y.Z with the latest release tag from https://github.com/optimizely/cloudflare-worker-template/releases)
   git clone --branch vX.Y.Z --depth 1 https://github.com/optimizely/cloudflare-worker-template.git my-project
   cd my-project
   ```

   > **Note**: Replace `my-project` with your desired project name and `vX.Y.Z` with your desired [release version](https://github.com/optimizely/cloudflare-worker-template/releases).

2. Install node packages.

   ```bash
   npm install
   ```

3. **Configure your Optimizely SDK Key**:

   First, get your SDK key from the Optimizely dashboard:
   - Log into your [Optimizely account](https://app.optimizely.com/)
   - Navigate to **Settings → Environments**
   - Copy your SDK key from the desired environment (it looks like: `AbCdEf12345GhIjKlMnOp`)

   Then set your SDK key using one of these methods:

   **Option A: Using Wrangler Secrets (Recommended for production)**

   ```
   wrangler secret put OPTIMIZELY_SDK_KEY
   ```

   **Option B: Using wrangler.jsonc for development**

   Edit `wrangler.jsonc` and replace `YOUR_SDK_KEY` with your actual SDK key:

   ```jsonc
   {
     "vars": {
       "OPTIMIZELY_SDK_KEY": "YOUR_SDK_KEY",
       "OPTIMIZELY_DATAFILE_CACHE_TTL_SECONDS": "300"  // Optional: cache TTL in seconds (default: 300)
     }
   }
   ```

   **Option C: Using .env file for local development**

   ```bash
   cp .env.example .env
   # Edit .env and add your SDK key
   ```

   ```env
   OPTIMIZELY_SDK_KEY=your_sdk_key
   OPTIMIZELY_DATAFILE_CACHE_TTL_SECONDS=300  # Optional: cache TTL in seconds (default: 300)
   ```

4. **Configure Cloudflare Account ID** (required for deployment):

   Add your `account_id` to `wrangler.jsonc`:

   ```bash
   # Find your account ID
   wrangler whoami
   ```

   Then edit `wrangler.jsonc`:
   ```jsonc
   {
     "name": "optimizely-cloudflare-worker",
     "account_id": "your_account_id_here",  // Add this line
     // ... rest of config
   }
   ```

   > **Note**: You can skip this step for local development. The CLI will prompt you when needed.

## Project Structure

```
├── src/
│   ├── index.js                    # Main worker entry point
│   ├── optimizely_helper.js        # Optimizely SDK integration utilities
│   └── request_handler.js          # Cloudflare-specific HTTP request handler
├── test/
│   ├── index.test.js               # Tests for main worker
│   ├── optimizely_helper.test.js   # Tests for Optimizely helper functions
│   ├── request_handler.test.js     # Tests for request handler
│   ├── setup.js                    # Test environment setup
│   └── test-utils.js               # Shared test utilities and mocks
├── .env.example                    # Environment variable template
├── biome.jsonc                     # Biome configuration for linting/formatting
├── package.json                    # Node.js dependencies and scripts
├── vitest.config.js                # Vitest testing framework configuration
└── wrangler.jsonc                  # Cloudflare Workers configuration
```

## Use the Cloudflare Workers Starter Kit

The Optimizely starter kit for Cloudflare Workers embeds and extends our [Javascript SDK](https://docs.developers.optimizely.com/feature-experimentation/docs/javascript-sdk). For a guide to getting started with our platform more generally, you can reference our [Javascript Quickstart developer documentation](https://docs.developers.optimizely.com/feature-experimentation/docs/javascript-sdk-quickstart).

> Note: This starter kit makes use of the "Universal" version of our Javascript SDK which explicitly excludes the datafile manager and event processor features for better performance. The datafile is fetched and cached using Cloudflare's cache API, and event dispatching is handled through the provided platform-specific `getOptimizelyClient()` helper.

### Development

This template includes modern development tools for a better developer experience:

- **Biome**: Fast formatter and linter for JavaScript
- **Miniflare**: Local development server that simulates Cloudflare Workers
- **Vitest**: Fast unit testing framework

Available development commands:

```bash
npm run dev          # Start local development server
npm run format       # Format code with Biome
npm run lint         # Lint code with Biome
npm run test         # Run tests with Vitest
npm run build        # Build and validate (dry-run deploy)
```

### Initialization

Sample code is included in `src/index.js` that shows examples of initializing and using the Optimizely JavaScript (Node) SDK interface for performing common functions such as creating user context, adding a notification listener, and making decisions based on the created user context.

Additional platform-specific code is included in `src/optimizely_helper.js` which provides workarounds for otherwise common features of the Optimizely SDK, including:

- **Datafile Caching**: Automatic fetching and caching of the Optimizely datafile using Cloudflare's cache API
- **Client Management**: Efficient client initialization and datafile updates
- **Event Dispatching**: Optional event dispatching to Optimizely's logging backend

1. **Configure your feature flags**: Update the `YOUR_FLAG_HERE` placeholder in `src/index.js` with your actual flag keys from the Optimizely dashboard.

2. Test and debug the worker locally.

   ```
   npm run dev
   ```

### Publishing

3. Deploy the worker on Cloudflare.

   ```
   wrangler deploy
   ```

4. Optionally, tail the logs for debugging when accessing worker deployed on Cloudflare.
   ```
   wrangler tail -f pretty
   ```

## Additional Resources and Concepts

### Caching with Cloudflare

This template uses Cloudflare's cache API to provide performant caching for the [Optimizely Datafile](https://docs.developers.optimizely.com/feature-experimentation/docs/manage-config-datafile). The datafile is automatically fetched from Optimizely's CDN and cached for 5 minutes by default (configurable via the `OPTIMIZELY_DATAFILE_CACHE_TTL_SECONDS` environment variable), with Cloudflare edge caching providing additional performance benefits.

**Cache Configuration:**
- **Default TTL**: 5 minutes (300 seconds)
- **Configurable via**: `OPTIMIZELY_DATAFILE_CACHE_TTL_SECONDS` environment variable
- **Example values**: `300` (5 minutes), `600` (10 minutes), `1800` (30 minutes)
- **Behavior**: If the datafile fetch fails, the cached datafile will continue to be used (stale-while-revalidate pattern)

### Identity Management

Out of the box, Optimizely's Feature Experimentation SDKs require a user-provided identifier to be passed in at runtime to drive experiment and feature flag decisions. This example generates a unique ID using `crypto.randomUUID()`, stores it in a cookie, and reuses it to make the decisions sticky. Alternatively, you can use an existing unique identifier available within your application and pass it in as the value for the `OPTIMIZELY_USER_ID` cookie.

### Bucketing

For more information on how Optimizely Feature Experimentation SDKs assign users to feature flags and experiments, see [the documentation on how bucketing works](https://docs.developers.optimizely.com/feature-experimentation/docs/how-bucketing-works-feature-experimentation).

### Cloudflare Workers

For more information about Cloudflare Workers, you may visit the following resources:

- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare Workers tutorials](https://developers.cloudflare.com/workers/tutorials)
- [Cloudflare Workers with Optimizely documentation](https://docs.developers.optimizely.com/feature-experimentation/docs/cloudflare-workers)

## Troubleshooting

### Common Issues

**Problem: "OPTIMIZELY_SDK_KEY environment variable is required" error**

**Solution:** Ensure you've set your SDK key using one of the methods in step 3:
- Check that your `.env` file exists and contains `OPTIMIZELY_SDK_KEY=your_key`
- Or verify `wrangler.jsonc` has the SDK key in the `vars` section
- For production deployments, run: `wrangler secret put OPTIMIZELY_SDK_KEY`

---

**Problem: "Failed to fetch datafile" error**

**Solution:** This usually means:
- Your SDK key is incorrect or doesn't match an active Optimizely project
- Network connectivity issues (check your internet connection)
- The Optimizely CDN is temporarily unavailable (the worker will use cached data if available)

---

**Problem: "Account ID not found" when deploying**

**Solution:**
```bash
# Find your account ID
wrangler whoami

# Add it to wrangler.jsonc under "account_id"
```

---

**Problem: Local dev server won't start**

**Solution:**
- Ensure you're using Node.js 22+ (`node --version`)
- Check if port 8787 is already in use
- Try `npm run dev -- --port 8788` to use a different port

---

**Problem: Feature flags not working as expected**

**Solution:**
- Verify your flag key matches exactly (case-sensitive)
- Check that the flag is enabled in your Optimizely project
- Ensure the environment SDK key matches the environment where the flag is configured
- Check browser console/worker logs for decision details

---

**Need more help?**
- Check the [Optimizely Developer Docs](https://docs.developers.optimizely.com/feature-experimentation/docs/cloudflare-workers)
- Visit the [Optimizely Community](https://community.optimizely.com/)
- Open an issue on [GitHub](https://github.com/optimizely/cloudflare-worker-template/issues)

## SDK Development

### Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md).

### Other Optimizely SDKs

- Agent - https://github.com/optimizely/agent
- Android - https://github.com/optimizely/android-sdk

- C# - https://github.com/optimizely/csharp-sdk

- Flutter - https://github.com/optimizely/optimizely-flutter-sdk

- Go - https://github.com/optimizely/go-sdk

- Java - https://github.com/optimizely/java-sdk

- JavaScript - https://github.com/optimizely/javascript-sdk

- PHP - https://github.com/optimizely/php-sdk

- Python - https://github.com/optimizely/python-sdk

- React - https://github.com/optimizely/react-sdk

- Ruby - https://github.com/optimizely/ruby-sdk

- Swift - https://github.com/optimizely/swift-sdk

### Other Optimizely Edge Starter Kits

- Akamai EdgeWorkers - https://github.com/optimizely/akamai-edgeworker-starter-kit

- AWS Lambda@Edge - https://github.com/optimizely/aws-lambda-at-edge-starter-kit

- Fastly Compute@Edge - https://github.com/optimizely/fastly-compute-starter-kit

- Vercel Functions - https://github.com/optimizely/vercel-examples/tree/main/edge-functions/feature-flag-optimizely
