# Optimizely Full Stack Feature Flags and Experimentation

[Optimizely Full Stack](https://docs.developers.optimizely.com/full-stack/docs) is a feature flagging and experimentation platform for websites, mobile apps, chatbots, APIs, smart devices, and anything else with a network connection.

You can deploy code behind feature flags, experiment with A/B tests, and roll out or roll back features immediately. All of this functionality is available with minimal performance impact via easy-to-use, open source SDKs.

# Optimizely Worker Template
The Optimizely worker template for Cloudflare worker embeds and extends our [Javascript SDK](https://docs.developers.optimizely.com/full-stack/v4.0/docs/javascript-node) to provide a starting point for you to implement experimentation and feature flagging for your experiences at the edge. For a guide to getting started with our platform more generally, this can be combined with the steps outlined in our [Javascript Quickstart here](https://docs.developers.optimizely.com/full-stack/v4.0/docs/javascript-node). 

### Caching with cloudflare
This template uses Cloudflare cache API to provide performant caching for the [Optimizely Datafile](https://docs.developers.optimizely.com/full-stack/v4.0/docs/manage-config-datafile).

### Identity Management
Out of the box, Optimizely's Full Stack SDKs require a user-provided identifier to be passed in at runtime to drive experiment and feature flag decisions. This example generates a unique id, stores it in a cookie and reuses it to make the decisions sticky. Another common approach would be to use an existing unique identifier available within your application.

### Bucketing
For more information on how Optimizely Full Stack SDKs bucket visitors, see [here](https://docs.developers.optimizely.com/full-stack/v4.0/docs/how-bucketing-works) 

## Steps to Run

Prerequisite: Install [Wrangler CLI](https://developers.cloudflare.com/workers/cli-wrangler).

1. To generate a project using this template.

   ```
   wrangler generate projectname https://github.com/optimizely/cloudflare-worker-template
   ```

2. Add `account_id` in `wrangler.toml`. If you dont know the account id, just do `wrangler dev` and the CLI will prompt you with the account id and the instructions to add it.

3. Install packages.
    ```
    npm install
    ```

4. Update your optimizely `sdkKey`, `flagKey` and `userId` in `src/index.js`.

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
