import type { ExecutionContext } from '@cloudflare/workers-types/experimental'
import { getToken } from './credentials'

export interface Env {
  CLOUDFLARE_API_TOKEN: string
  CLOUDFLARE_ACCOUNT_ID: string
  CLOUDFLARE_PUBSUB_NAMESPACE: string
  CLOUDFLARE_PUBSUB_BROKER: string
}

const headers = {
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Origin': '*'
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    // Support CORS
    if (request.method.toLowerCase() === 'options') {
      return new Response('ok', {
        status: 200,
        headers
      })
    }
    // Check auth
    // if (false) {
    //   const status = 403
    //   return new Response(
    //     JSON.stringify({ success: false, result: {}, errors: { status } }),
    //     {
    //       status
    //     }
    //   )
    // }
    return getToken({
      apiToken: env.CLOUDFLARE_API_TOKEN,
      accountId: env.CLOUDFLARE_ACCOUNT_ID,
      namespace: env.CLOUDFLARE_PUBSUB_NAMESPACE,
      broker: env.CLOUDFLARE_PUBSUB_BROKER
    })
      .then(
        (token) =>
          new Response(
            JSON.stringify({ success: true, result: { token }, errors: false }),
            { status: 200, headers }
          )
      )
      .catch(
        (errors) =>
          new Response(JSON.stringify({ success: false, result: {}, errors }), {
            status: 500,
            headers
          })
      )
  }
}
