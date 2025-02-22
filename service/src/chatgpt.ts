import * as dotenv from 'dotenv'
import 'isomorphic-fetch'
import type { ChatMessage, SendMessageOptions } from 'chatgpt'
import { ChatGPTAPI, ChatGPTUnofficialProxyAPI } from 'chatgpt'
import { Configuration, OpenAIApi } from 'openai'
import { SocksProxyAgent } from 'socks-proxy-agent'
import fetch from 'node-fetch'
import { sendResponse } from './utils'
import type { ApiModel, ChatContext, ChatGPTAPIOptions, ChatGPTUnofficialProxyAPIOptions, ModelConfig } from './types'

dotenv.config()

const timeoutMs: number = !isNaN(+process.env.TIMEOUT_MS) ? +process.env.TIMEOUT_MS : 30 * 1000

let apiModel: ApiModel

if (!process.env.OPENAI_API_KEY && !process.env.OPENAI_ACCESS_TOKEN)
  throw new Error('Missing OPENAI_API_KEY or OPENAI_ACCESS_TOKEN environment variable')

let api: ChatGPTAPI | ChatGPTUnofficialProxyAPI
let openai: OpenAIApi
// To use ESM in CommonJS, you can use a dynamic import
(async () => {
  // More Info: https://github.com/transitive-bullshit/chatgpt-api

  if (process.env.OPENAI_API_KEY) {
    const options: ChatGPTAPIOptions = {
      apiKey: process.env.OPENAI_API_KEY,
      debug: false,
    }
    api = new ChatGPTAPI({ ...options })
    apiModel = 'ChatGPTAPI'
    openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }))
  }
  else {
    const options: ChatGPTUnofficialProxyAPIOptions = {
      accessToken: process.env.OPENAI_ACCESS_TOKEN,
      debug: false,
    }

    if (process.env.SOCKS_PROXY_HOST && process.env.SOCKS_PROXY_PORT) {
      const agent = new SocksProxyAgent({
        hostname: process.env.SOCKS_PROXY_HOST,
        port: process.env.SOCKS_PROXY_PORT,
      })
      options.fetch = (url, options) => {
        return fetch(url, { agent, ...options })
      }
    }

    if (process.env.API_REVERSE_PROXY)
      options.apiReverseProxyUrl = process.env.API_REVERSE_PROXY

    api = new ChatGPTUnofficialProxyAPI({
      accessToken: process.env.OPENAI_ACCESS_TOKEN,
      ...options,
    })
    apiModel = 'ChatGPTUnofficialProxyAPI'
  }
})()

async function chatReply(
  message: string,
  lastContext?: { conversationId?: string; parentMessageId?: string },
) {
  if (!message)
    return sendResponse({ type: 'Fail', message: 'Message is empty' })

  try {
    let options: SendMessageOptions = { timeoutMs }

    if (lastContext)
      options = { ...lastContext }

    const response = await api.sendMessage(message, { ...options })

    return sendResponse({ type: 'Success', data: response })
  }
  catch (error: any) {
    return sendResponse({ type: 'Fail', message: error.message })
  }
}

async function chatReplyProcess(
  message: string,
  lastContext?: { conversationId?: string; parentMessageId?: string },
  isDraw?: boolean,
  process?: (chat: ChatMessage) => void,
) {
  if (!message)
    return sendResponse({ type: 'Fail', message: 'Message is empty' })

  try {
    let options: SendMessageOptions = { timeoutMs }
    if (lastContext)
      options = { ...lastContext }
    if (isDraw) {
      const response = await openai.createImage({
        prompt: message,
        n: 1,
        size: '512x512',
      })
      return sendResponse({ type: 'Success', data: { url: response.data?.data?.[0]?.url } })
    }
    else {
      const response = await api.sendMessage(message, {
        ...options,
        onProgress: (partialResponse) => {
          process?.(partialResponse)
        },
      })
      return sendResponse({ type: 'Success', data: response })
    }
  }
  catch (error: any) {
    return sendResponse({ type: 'Fail', message: error.message })
  }
}

async function chatConfig() {
  return sendResponse({
    type: 'Success',
    data: {
      apiModel,
      reverseProxy: process.env.API_REVERSE_PROXY,
      timeoutMs,
      socksProxy: (process.env.SOCKS_PROXY_HOST && process.env.SOCKS_PROXY_PORT) ? (`${process.env.SOCKS_PROXY_HOST}:${process.env.SOCKS_PROXY_PORT}`) : '-',
    } as ModelConfig,
  })
}

export type { ChatContext, ChatMessage }

export { chatReply, chatReplyProcess, chatConfig }
