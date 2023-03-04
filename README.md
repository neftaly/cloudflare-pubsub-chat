# cloudflare-pubsub-browser

This monorepo provides a credential endpoint, an onpublish handler and an example browser client for Cloudflare PubSub.

## Deploying

1. Create a token: <https://dash.cloudflare.com/profile/api-tokens>
* workers write access
* pubsub write access

2. Create a `.dev.vars` file in the root of this repo with your token:
```
CLOUDFLARE_API_TOKEN=secret-CF-api-key
```

3. Update <./workers/get-broker-token/wrangler.toml> with your account ID, broker, and namespace.

4. Update <./workers/pubsub-onpublish-worker/wrangler.toml> with your account ID and the broker public keys
* To generate public keys, run `wrangler pubsub broker public-keys YOUR_BROKER --namespace=NAMESPACE_NAME`

5. Deploy the workers for the first time:
* `npm deploy -w workers/pubsub-onpublish-worker`
* `npm deploy -w workers/get-broker-token`

6. Update pubsub config to use the onpublish worker
* `wrangler pubsub broker update broker --namespace=NAMESPACE_NAME --on-publish-url='https://pubsub-onpublish-worker.WORKER_NAMESPACE.workers.dev`

7. Add `CLOUDFLARE_API_TOKEN` secret env var to cloudflare web config UI for the get-broker-token worker
* idk what the wrangler command is

8. Update client config with your broker, namespace, and the URL of your get-broker-token worker.
* <./apps/chat/src/client.js>

9. Run the client
* `npm run dev -w apps/pubsub-client`
