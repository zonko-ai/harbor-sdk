export type AiGatewayRole = "system" | "user" | "assistant"

export interface AiGatewayMessage {
  readonly role: AiGatewayRole
  readonly content: string
}

export interface CloudflareAiGatewayConfig {
  readonly accountId: string
  readonly gateway: string
  readonly token: string
  readonly model: string
  readonly fetch?: typeof fetch | undefined
}

export interface GenerateAgentReplyInput {
  readonly messages: readonly AiGatewayMessage[]
  readonly temperature?: number | undefined
  readonly maxTokens?: number | undefined
}

export interface GenerateAgentReplyResult {
  readonly text: string
  readonly model: string
  readonly provider: "cloudflare_ai_gateway"
  readonly gateway: string
}

interface ChatCompletionChoice {
  readonly message?: {
    readonly content?: string | null | undefined
  } | undefined
}

interface ChatCompletionResponse {
  readonly choices?: readonly ChatCompletionChoice[] | undefined
  readonly error?: {
    readonly message?: string | undefined
  } | undefined
}

export function createCloudflareAiGateway(config: CloudflareAiGatewayConfig) {
  const endpoint = `https://gateway.ai.cloudflare.com/v1/${encodeURIComponent(config.accountId)}/${encodeURIComponent(config.gateway)}/compat/chat/completions`
  return {
    generateAgentReply: async (input: GenerateAgentReplyInput): Promise<GenerateAgentReplyResult> => {
      const completionLimitKey = config.model.includes("gpt-5") ? "max_completion_tokens" : "max_tokens"
      const response = await (config.fetch ?? fetch)(endpoint, {
        method: "POST",
        headers: {
          "cf-aig-authorization": `Bearer ${config.token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: config.model,
          messages: input.messages,
          temperature: input.temperature ?? 0.2,
          [completionLimitKey]: input.maxTokens ?? 700,
        }),
      })
      const body = await response.json().catch(() => null) as ChatCompletionResponse | null
      const text = body?.choices?.[0]?.message?.content?.trim()
      if (!response.ok || !text) {
        throw new Error(body?.error?.message ?? `Cloudflare AI Gateway request failed with HTTP ${response.status}`)
      }
      return {
        text,
        model: config.model,
        provider: "cloudflare_ai_gateway",
        gateway: config.gateway,
      }
    },
  }
}
