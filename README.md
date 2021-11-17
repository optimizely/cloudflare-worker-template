# Default Optimizely Worker Template.

This is the default optimizely starter template for cloudflare workers. This template provides an npm package with starter code and required dependencies.

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
