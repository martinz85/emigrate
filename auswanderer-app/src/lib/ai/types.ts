/**
 * AI Provider Types & Interfaces
 *
 * Supports: Claude, OpenAI, Gemini, Groq
 */

// ============================================
// PROVIDER TYPES
// ============================================

export type AIProvider = 'claude' | 'openai' | 'gemini' | 'groq'

export interface AIProviderConfig {
  id: string // 'primary', 'fallback_1', 'fallback_2'
  provider: AIProvider
  model: string
  apiKey: string // Decrypted
  isActive: boolean
  priority: number
  settings: AISettings
}

export interface AISettings {
  maxTokens?: number
  temperature?: number
  topP?: number
  topK?: number
  stopSequences?: string[]
}

// ============================================
// MODEL TYPES
// ============================================

export interface AIModel {
  id: string
  provider: AIProvider
  name: string
  description?: string
  inputCostPer1k: number
  outputCostPer1k: number
  maxTokens: number
  contextWindow?: number
  isLatest: boolean
  isDeprecated: boolean
  isAvailable: boolean
  releasedAt?: string
  capabilities: AICapability[]
}

export type AICapability = 'chat' | 'vision' | 'function_calling' | 'streaming'

// ============================================
// REQUEST/RESPONSE TYPES
// ============================================

export interface AIRequest {
  system: string
  messages: AIMessage[]
  maxTokens?: number
  temperature?: number
}

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AIResponse {
  content: string
  usage: AIUsage
  model: string
  provider: AIProvider
  requestId?: string
  finishReason?: 'stop' | 'length' | 'error'
}

export interface AIUsage {
  inputTokens: number
  outputTokens: number
  totalTokens: number
  costUsd: number
}

// ============================================
// ADAPTER INTERFACE
// ============================================

export interface AIAdapter {
  readonly provider: AIProvider
  readonly model: string

  /**
   * Send a chat completion request
   */
  chat(request: AIRequest): Promise<AIResponse>

  /**
   * Health check - verify API key and connectivity
   */
  healthCheck(): Promise<boolean>

  /**
   * Get current usage stats from last request
   */
  getLastUsage(): AIUsage | null

  /**
   * Calculate cost for given token counts
   */
  calculateCost(inputTokens: number, outputTokens: number): number
}

// ============================================
// ANALYSIS TYPES (from existing code)
// ============================================

export interface AnalysisRequest {
  criteriaRatings: Record<string, number>
  preAnalysis?: {
    countriesOfInterest: string[]
    specialWishes: string
  }
  userProfile?: {
    budget?: string
    profession?: string
    familyStatus?: string
    citizenship?: string
    languages?: string[]
    climatePref?: string
    naturePref?: string
  }
  /** Question weights from database (question_key -> weight) */
  questionWeights?: Record<string, number>
}

export interface CountryScore {
  rank: number
  country: string
  countryCode: string
  score: number
  maxScore: number
  percentage: number
  criteriaScores: Record<string, {
    score: number
    symbol: '++' | 'o' | '--'
    explanation: string
  }>
  strengths: string[]
  considerations: string[]
}

export interface AnalysisResult {
  success: boolean
  rankings: CountryScore[]
  recommendation: {
    topCountry: string
    summary: string
    nextSteps: string[]
    alternative?: {
      country: string
      condition: string
      reason: string
    }
  }
  _usage?: AIUsage
  _provider?: AIProvider
  _model?: string
}

// ============================================
// MODEL UPDATE TYPES
// ============================================

export type ModelUpdateType = 'new_model' | 'price_change' | 'deprecated' | 'capability_change'

export interface ModelUpdate {
  id: string
  updateType: ModelUpdateType
  provider: AIProvider
  modelId: string
  currentData: Partial<AIModel> | null
  suggestedData: Partial<AIModel>
  changeSummary: string
  sourceUrl?: string
  confidence: number
  status: 'pending' | 'applied' | 'dismissed' | 'invalid'
  checkedAt: string
  appliedAt?: string
  appliedBy?: string
}

// ============================================
// CATALOG CHECK TYPES
// ============================================

export interface CatalogCheck {
  id: string
  checkedAt: string
  triggerType: 'cron' | 'manual'
  triggeredBy?: string
  status: 'running' | 'completed' | 'failed'
  modelsChecked: number
  updatesFound: number
  aiModelUsed?: string
  aiInputTokens?: number
  aiOutputTokens?: number
  aiCostUsd?: number
  durationMs?: number
  errorMessage?: string
  completedAt?: string
}

