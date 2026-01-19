/**
 * OpenAI GPT Adapter
 */

import type {
  AIAdapter,
  AIProvider,
  AIRequest,
  AIResponse,
  AIUsage,
  AISettings,
} from '../types'

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'
const API_TIMEOUT_MS = 60000 // 60 seconds timeout for AI API calls

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenAIResponse {
  id: string
  object: 'chat.completion'
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: 'assistant'
      content: string
    }
    finish_reason: 'stop' | 'length' | 'content_filter'
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class OpenAIAdapter implements AIAdapter {
  readonly provider: AIProvider = 'openai'
  readonly model: string

  private apiKey: string
  private settings: AISettings
  private lastUsage: AIUsage | null = null
  private inputCostPer1k: number
  private outputCostPer1k: number

  constructor(
    apiKey: string,
    model: string,
    settings: AISettings = {},
    inputCostPer1k = 0.005,
    outputCostPer1k = 0.015
  ) {
    this.apiKey = apiKey
    this.model = model
    this.settings = settings
    this.inputCostPer1k = inputCostPer1k
    this.outputCostPer1k = outputCostPer1k
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    // OpenAI uses system message as first message
    const messages: OpenAIMessage[] = [
      { role: 'system', content: request.system },
      ...request.messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ]

    // Create abort controller for timeout
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS)

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: request.maxTokens || this.settings.maxTokens || 4096,
          temperature: request.temperature ?? this.settings.temperature ?? 0.7,
          messages,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`OpenAI API error (${response.status}): ${error}`)
      }

      const data: OpenAIResponse = await response.json()

      // Extract content from first choice
      const content = data.choices[0]?.message?.content || ''

      // Calculate usage
      const inputTokens = data.usage.prompt_tokens
      const outputTokens = data.usage.completion_tokens
      const costUsd = this.calculateCost(inputTokens, outputTokens)

      this.lastUsage = {
        inputTokens,
        outputTokens,
        totalTokens: data.usage.total_tokens,
        costUsd,
      }

      return {
        content,
        usage: this.lastUsage,
        model: data.model,
        provider: this.provider,
        requestId: data.id,
        finishReason: data.choices[0]?.finish_reason === 'length' ? 'length' : 'stop',
      }
    } catch (error) {
      clearTimeout(timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`OpenAI API timeout after ${API_TIMEOUT_MS / 1000}s`)
      }
      throw error
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Use Models API endpoint (free, no token cost)
      // https://platform.openai.com/docs/api-reference/models/list
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      })

      return response.ok
    } catch {
      return false
    }
  }

  getLastUsage(): AIUsage | null {
    return this.lastUsage
  }

  calculateCost(inputTokens: number, outputTokens: number): number {
    const inputCost = (inputTokens / 1000) * this.inputCostPer1k
    const outputCost = (outputTokens / 1000) * this.outputCostPer1k
    return inputCost + outputCost
  }
}

