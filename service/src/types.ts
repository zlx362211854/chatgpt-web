import type { FetchFn, openai } from 'chatgpt'

export interface ChatContext {
  conversationId?: string
  parentMessageId?: string
}

export interface ChatGPTAPIOptions {
  apiKey: string
  debug?: boolean
  completionParams?: Partial<openai.CompletionParams>
}

export interface ChatGPTUnofficialProxyAPIOptions {
  accessToken: string
  apiReverseProxyUrl?: string
  model?: string
  debug?: boolean
  headers?: Record<string, string>
  fetch?: FetchFn
}

export interface ModelConfig {
  apiModel?: ApiModel
  reverseProxy?: strings
  timeoutMs?: number
  socksProxy?: string
  url?: string
}

export type ApiModel = 'ChatGPTAPI' | 'ChatGPTUnofficialProxyAPI' | undefined
