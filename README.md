# Optimizely Cloudflare Workers Starter Kit

This repository houses the Cloudflare Workers Starter Kit which provides a quickstart for users who would like to use Optimizely Feature Experimentation and Optimizely Full Stack (legacy) with Cloudflare Workers.

Optimizely Feature Experimentation is an A/B testing and feature management tool for product development teams that enables you to experiment at every step. Using Optimizely Feature Experimentation allows for every feature on your roadmap to be an opportunity to discover hidden insights. Learn more at [Optimizely.com](https://www.optimizely.com/products/experiment/feature-experimentation/), or see the [developer documentation](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs/welcome).

Optimizely Rollouts is [free feature flags](https://www.optimizely.com/free-feature-flagging/) for development teams. You can easily roll out and roll back features in any application without code deploys, mitigating risk for every feature on your roadmap.

## Get Started

Refer to the [Optimizely Cloudflare Workers Starter Kit documentation](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs/cloudflare-workers) for detailed instructions about using this starter kit.

### Prerequisites

1. You will need an **Optimizely Account**. If you do not have an account, you can [register for a free account](https://www.optimizely.com/products/intelligence/full-stack-experimentation/).

2. You will need to have a **Cloudflare Account with Workers**. For more information, visit the official [Cloudflare Workers product page here](https://workers.cloudflare.com/).

3. You will need to have **Wrangler CLI** installed. If you do not have it, you can install it by visiting the [Cloudflare Wrangler CLI page here](https://developers.cloudflare.com/workers/cli-wrangler).

### Install the Starter Kit

1. Generate a project using this sample template.

   ```
   wrangler generate projectname https://github.com/optimizely/cloudflare-worker-template
   ```

2. Add `account_id` in `wrangler.toml`. If you dont know the account ID, just do `wrangler dev` and the CLI will prompt you with the account ID and the instructions to add it.

3. Install node packages.
    ```
    npm install
    ```

## Use the Cloudflare Workers Starter Kit

The Optimizely starter kit for Cloudflare Workers embeds and extends our [Javascript (Node) SDK](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs/javascript-node-sdk). For a guide to getting started with our platform more generally, you can reference our [Javascript (Node) Quickstart developer documentation](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs/javascript-node-quickstart).

> Note: This starter kit in particular makes use of the "Lite" version of our Javascript SDK for Node.js which explicitly excludes the datafile manager and event processor features for better performance. As a result, it is expected that you will provide the datafile manually to the Optimizely SDK either through a local file reference or by using the provided platform-specific `getDatafile()` helper to load in your Optimizely project's datafile.

### Initialization

Sample code is included in `src/main.js` that shows examples of initializing and using the Optimizely JavaScript (Node) SDK interface for performing common functions such as creating user context, adding a notification listener, and making a decision based on the created user context.

Additional platform-specific code is included in `src/optimizely_helper.js` which provide workarounds for otherwise common features of the Optimizely SDK.

1. Update your Optimizely `sdkKey`, `flagKey` and `userId` in `src/index.js`. Your SDK keys can be found in the Optimizely application under **Settings**.


2. Test and debug the worker locally.

   ```
   wrangler dev
   ```

### Publishing

3. Deploy the worker on Cloudflare.

   ```
   wrangler publish
   ```

4. Optionally, tail the logs for debugging when accessing worker deployed on Cloudflare.
   ```
   wrangler tail -f pretty
   ```

## Additional Resources and Concepts

### Caching with Cloudflare

This template uses Cloudflare cache API to provide performant caching for the [Optimizely Datafile](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs/manage-config-datafile).

### Identity Management

Out of the box, Optimizely's Feature Experimentation SDKs require a user-provided identifier to be passed in at runtime to drive experiment and feature flag decisions. This example generates a unique ID, stores it in a cookie and reuses it to make the decisions sticky. Alternatively, you can use an existing unique identifier available within your application and pass it in as the value for the `OPTIMIZELY_USER_ID` cookie.

### Bucketing

For more information on how Optimizely Feature Experimentation SDKs assign users to feature flags and experiments, see [the documentation on how bucketing works](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs/how-bucketing-works). 

### Cloudflare Workers

For more information about Cloudflare Workers, you may visit the following resources:

- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare Workers tutorials](https://developers.cloudflare.com/workers/tutorials)
- [Cloudflare Workers with Optimizely documentation](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs/cloudflare-workers)

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