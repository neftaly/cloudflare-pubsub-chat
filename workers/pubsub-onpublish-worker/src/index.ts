import { isValidBrokerRequest, PubSubMessage } from '@cloudflare/pubsub'
import type { ExecutionContext } from '@cloudflare/workers-types/experimental'

export interface Env {
  BROKER_PUBLIC_KEYS: string
}

const transformMessages = (messages: [], env: Env, ctx: ExecutionContext) =>
  messages
    .filter(({ topic }: PubSubMessage) => topic.startsWith('session/'))
    .map((message: PubSubMessage) => {
      const { payload, clientId, payloadFormatIndicator } = message
      const payloadString =
        payloadFormatIndicator === 0
          ? new TextDecoder('utf-8').decode(
              new Uint8Array(payload as Uint8Array) // Is this a pubsub alpha bug?
            )
          : payload
      return {
        ...message,
        payload: `${clientId}\n${payloadString}`
      }
    })

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    if (await !isValidBrokerRequest(request, env.BROKER_PUBLIC_KEYS)) {
      return new Response('not a valid Broker request', { status: 403 })
    }
    const incomingMessages = (await request.json()) as []
    const outgoingMessages = transformMessages(incomingMessages, env, ctx)
    return new Response(JSON.stringify(outgoingMessages), { status: 200 })
  }
}
