/**
 * Claude (Anthropic) AI Adapter
 */

import type {
  AIAdapter,
  AIProvider,
  AIRequest,
  AIResponse,
  AIUsage,
  AISettings,
} from '../types'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'

interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ClaudeResponse {
  id: string
  type: 'message'
  role: 'assistant'
  content: Array<{ type: 'text'; text: string }>
  model: string
  stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence'
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

export class ClaudeAdapter implements AIAdapter {
  readonly provider: AIProvider = 'claude'
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
    inputCostPer1k = 0.003,
    outputCostPer1k = 0.015
  ) {
    this.apiKey = apiKey
    this.model = model
    this.settings = settings
    this.inputCostPer1k = inputCostPer1k
    this.outputCostPer1k = outputCostPer1k
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    const messages: ClaudeMessage[] = request.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }))

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: request.maxTokens || this.settings.maxTokens || 4096,
        temperature: request.temperature ?? this.settings.temperature ?? 0.7,
        system: request.system,
        messages,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Claude API error (${response.status}): ${error}`)
    }

    const data: ClaudeResponse = await response.json()

    // Extract text content
    const content = data.content
      .filter((c) => c.type === 'text')
      .map((c) => c.text)
      .join('')

    // Calculate usage
    const inputTokens = data.usage.input_tokens
    const outputTokens = data.usage.output_tokens
    const costUsd = this.calculateCost(inputTokens, outputTokens)

    this.lastUsage = {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      costUsd,
    }

    return {
      content,
      usage: this.lastUsage,
      model: data.model,
      provider: this.provider,
      requestId: data.id,
      finishReason: data.stop_reason === 'max_tokens' ? 'length' : 'stop',
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Simple API call to verify key
      const response = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': ANTHROPIC_VERSION,
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hi' }],
        }),
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

