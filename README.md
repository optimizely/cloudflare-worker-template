# Optimizely Cloudflare Workers Starter Kit

This repository houses the Cloudflare Workers Starter Kit which provides a quickstart for users who would like to use Optimizely Feature Experimentation and Optimizely Full Stack (legacy) with Cloudflare Workers.

Optimizely Feature Experimentation is an A/B testing and feature management tool for product development teams that enables you to experiment at every step. Using Optimizely Feature Experimentation allows for every feature on your roadmap to be an opportunity to discover hidden insights. Learn more at [Optimizely.com](https://www.optimizely.com/products/experiment/feature-experimentation/), or see the [developer documentation](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs/welcome).

Optimizely Rollouts is [free feature flags](https://www.optimizely.com/free-feature-flagging/) for development teams. You can easily roll out and roll back features in any application without code deploys, mitigating risk for every feature on your roadmap.

## Features

- **Modern ES Modules**: Uses ES module syntax for better tree-shaking and modern JavaScript features
- **Optimizely SDK v6**: Latest version of the Optimizely JavaScript SDK
- **Cloudflare Cache Integration**: Automatic datafile caching using Cloudflare's edge cache
- **Development Tools**: Integrated Biome for linting/formatting, Miniflare for local development
- **Cookie-based User Persistence**: Automatic user ID generation and persistence

## Get Started

Refer to the [Optimizely Cloudflare Workers Starter Kit documentation](https://docs.developers.optimizely.com/feature-experimentation/docs/cloudflare-workers) for detailed instructions about using this starter kit.

### Prerequisites

1. You will need an **Optimizely Account**. If you do not have an account, you can [register for a free account](https://www.optimizely.com/products/feature-experimentation/).

2. You will need to have a **Cloudflare Account with Workers**. For more information, visit the official [Cloudflare Workers product page here](https://workers.cloudflare.com/).

3. You will need to have **Wrangler CLI** installed. If you do not have it, you can install it by visiting the [Cloudflare Wrangler CLI page here](https://developers.cloudflare.com/workers/cli-wrangler).

### Install the Starter Kit

1. Generate a project using this sample template.

   ```
   wrangler generate projectname https://github.com/optimizely/cloudflare-worker-template
   ```

2. Add `account_id` in `wrangler.jsonc`. If you do not know the account ID, run `wrangler dev` and the CLI will prompt you with the account ID and the instructions to add it.

3. Install node packages.
   ```
   npm install
   ```

4. **Configure your Optimizely SDK Key**:
   
   Copy the example environment file:
   ```
   cp .env.example .env
   ```
   
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
       "OPTIMIZELY_SDK_KEY": "YOUR_SDK_KEY"
     }
   }
   ```
   
   **Option C: Using .env file for local development**
   ```
   OPTIMIZELY_SDK_KEY=your_sdk_key
   ```
   
   > **Note**: Your SDK keys can be found in the Optimizely application under **Settings > Environments**.

5. **Set up your account ID** (if deploying): Add `account_id` in `wrangler.jsonc`. If you don't know the account ID, run `wrangler whoami` or `wrangler dev` and the CLI will prompt you with instructions.

## Project Structure

```
├── src/
│   ├── index.js              # Main worker entry point
│   └── optimizely_helper.js  # Optimizely SDK integration utilities
├── wrangler.jsonc            # Cloudflare Workers configuration
├── package.json              # Node.js dependencies and scripts
├── .env.example             # Environment variable template
├── .biome.jsonc             # Biome configuration for linting/formatting
└── README.md                # This file
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

This template uses Cloudflare's cache API to provide performant caching for the [Optimizely Datafile](https://docs.developers.optimizely.com/feature-experimentation/docs/manage-config-datafile). The datafile is automatically fetched from Optimizely's CDN and cached for 10 minutes, with Cloudflare edge caching providing additional performance benefits.

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
