/**
 * Google Gemini AI Adapter
 */

import type {
  AIAdapter,
  AIProvider,
  AIRequest,
  AIResponse,
  AIUsage,
  AISettings,
} from '../types'

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

interface GeminiContent {
  role: 'user' | 'model'
  parts: Array<{ text: string }>
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>
      role: 'model'
    }
    finishReason: 'STOP' | 'MAX_TOKENS' | 'SAFETY' | 'OTHER'
  }>
  usageMetadata: {
    promptTokenCount: number
    candidatesTokenCount: number
    totalTokenCount: number
  }
}

export class GeminiAdapter implements AIAdapter {
  readonly provider: AIProvider = 'gemini'
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
    inputCostPer1k = 0.00125,
    outputCostPer1k = 0.005
  ) {
    this.apiKey = apiKey
    this.model = model
    this.settings = settings
    this.inputCostPer1k = inputCostPer1k
    this.outputCostPer1k = outputCostPer1k
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    // Gemini uses systemInstruction separately
    const contents: GeminiContent[] = request.messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const url = `${GEMINI_API_BASE}/${this.model}:generateContent?key=${this.apiKey}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: request.system }],
        },
        contents,
        generationConfig: {
          maxOutputTokens: request.maxTokens || this.settings.maxTokens || 4096,
          temperature: request.temperature ?? this.settings.temperature ?? 0.7,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Gemini API error (${response.status}): ${error}`)
    }

    const data: GeminiResponse = await response.json()

    // Extract content from first candidate
    const content = data.candidates[0]?.content?.parts
      ?.map((p) => p.text)
      .join('') || ''

    // Calculate usage
    const inputTokens = data.usageMetadata?.promptTokenCount || 0
    const outputTokens = data.usageMetadata?.candidatesTokenCount || 0
    const costUsd = this.calculateCost(inputTokens, outputTokens)

    this.lastUsage = {
      inputTokens,
      outputTokens,
      totalTokens: data.usageMetadata?.totalTokenCount || inputTokens + outputTokens,
      costUsd,
    }

    const finishReason = data.candidates[0]?.finishReason
    
    return {
      content,
      usage: this.lastUsage,
      model: this.model,
      provider: this.provider,
      finishReason: finishReason === 'MAX_TOKENS' ? 'length' : 'stop',
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const url = `${GEMINI_API_BASE}/${this.model}:generateContent?key=${this.apiKey}`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: 'Hi' }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 10,
          },
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

