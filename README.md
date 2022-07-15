# Optimizely Full Stack Feature Flags and Experimentation

[Optimizely Full Stack](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs) is a feature flagging and experimentation platform for websites, mobile apps, chatbots, APIs, smart devices, and anything else with a network connection.

You can deploy code behind feature flags, experiment with A/B tests, and roll out or roll back features immediately. All of this functionality is available with minimal performance impact via easy-to-use, open source SDKs.

--- 

## Optimizely + Cloudflare Worker Template

> Starter Kit for running Optimizely Full Stack feature flags and experiments on Fastly's Compute@Edge offering.


The Optimizely worker template for Cloudflare worker embeds and extends our [JavaScript SDK](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs/javascript-node-sdk) to provide a starting point for you to implement experimentation and feature flagging for your experiences at the edge. For a guide to getting started with our platform more generally, this can be combined with the steps outlined in our [JavaScript Quickstart](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs/javascript-node-quickstart). 

### Caching with cloudflare
This template uses Cloudflare cache API to provide performant caching for the [Optimizely Datafile](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs/manage-config-datafile).

### Identity Management
Out of the box, Optimizely's Full Stack SDKs require a user-provided identifier to be passed in at runtime to drive experiment and feature flag decisions. This example generates a unique id, stores it in a cookie and reuses it to make the decisions sticky. Alternatively, you can use an existing unique identifier available within your application and pass it in as the value for the `OPTIMIZELY_USER_ID` cookie.

### Bucketing
For more information on how Optimizely Full Stack SDKs assign users to feature flags and experiments, see [the documentation on how bucketing works](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs/how-bucketing-works). 

## How to use

### Prerequisites

In order to use this template, you will need to:

   - Install the [Wrangler CLI](https://developers.cloudflare.com/workers/cli-wrangler).
   - Have an Optimizely account. If you do not have an account, you can [register for a free account](https://www.optimizely.com/products/intelligence/full-stack-experimentation/).

### Get started

1. To generate a project using this template.

   ```
   wrangler generate projectname https://github.com/optimizely/cloudflare-worker-template
   ```

2. Add `account_id` in `wrangler.toml`. If you dont know the account ID, just do `wrangler dev` and the CLI will prompt you with the account ID and the instructions to add it.

3. Install node packages.
    ```
    npm install
    ```

4. Update your Optimizely `sdkKey`, `flagKey` and `userId` in `src/index.js`. Your SDK keys can be found in the Optimizely application under **Settings**.

5. To test and debug the worker locally.

   ```
   wrangler dev
   ```

6. To deploy the worker on cloudflare.

   ```
   wrangler publish
   ```

7. To optionally tail the logs for debugging when accessing worker deployed on cloudflare.
   ```
   wrangler tail -f pretty
   ```

## Contributing
Please see [CONTRIBUTING](CONTRIBUTING.md).

## Additional resources

- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare Workers tutorials](https://developers.cloudflare.com/workers/tutorials)
- [Cloudflare Workers with Optimizely documentation](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs/cloudflare)