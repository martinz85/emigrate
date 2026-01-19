/**
 * AI Factory with Fallback Logic
 *
 * Creates AI adapters based on database configuration.
 * Handles automatic fallback when primary provider fails.
 */

import { createAdminClient } from '@/lib/supabase/server'
import { decryptApiKey, isEncryptionConfigured } from './encryption'
import { ClaudeAdapter, OpenAIAdapter, GeminiAdapter, GroqAdapter } from './adapters'
import type {
  AIAdapter,
  AIProvider,
  AIProviderConfig,
  AISettings,
  AIModel,
} from './types'

// Cache for provider configs (1 minute TTL)
let configCache: { data: AIProviderConfig[]; cachedAt: number } | null = null
const CONFIG_CACHE_TTL = 60 * 1000

// Cache for model costs
let modelCostCache: Map<string, { input: number; output: number }> | null = null

/**
 * Get AI adapter with automatic fallback
 *
 * Tries providers in priority order until one succeeds.
 * Returns the first working adapter.
 */
export async function getAIAdapter(): Promise<AIAdapter> {
  const configs = await getActiveProviders()

  if (configs.length === 0) {
    throw new Error('No AI providers configured')
  }

  const errors: string[] = []

  for (const config of configs) {
    try {
      const adapter = await createAdapter(config)

      // Health check
      const isHealthy = await adapter.healthCheck()
      if (isHealthy) {
        console.log(`[AI] Using provider: ${config.provider} (${config.model})`)
        return adapter
      } else {
        errors.push(`${config.provider}: Health check failed`)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      errors.push(`${config.provider}: ${message}`)
      console.warn(`[AI] Provider ${config.provider} failed:`, message)
    }
  }

  throw new Error(`All AI providers failed: ${errors.join('; ')}`)
}

/**
 * Get a specific AI adapter (no fallback)
 */
export async function getSpecificAdapter(
  provider: AIProvider,
  model?: string
): Promise<AIAdapter> {
  const configs = await getActiveProviders()
  const config = configs.find(
    (c) => c.provider === provider && (!model || c.model === model)
  )

  if (!config) {
    throw new Error(`Provider ${provider} not configured`)
  }

  return createAdapter(config)
}

/**
 * Create an adapter instance from config
 */
async function createAdapter(config: AIProviderConfig): Promise<AIAdapter> {
  // Get API key (from config or environment fallback)
  const apiKey = config.apiKey || getEnvApiKey(config.provider)

  if (!apiKey) {
    throw new Error(`No API key for ${config.provider}`)
  }

  // Get model costs from catalog
  const costs = await getModelCosts(config.model)

  switch (config.provider) {
    case 'claude':
      return new ClaudeAdapter(
        apiKey,
        config.model,
        config.settings,
        costs?.input ?? 0.003,
        costs?.output ?? 0.015
      )

    case 'openai':
      return new OpenAIAdapter(
        apiKey,
        config.model,
        config.settings,
        costs?.input ?? 0.005,
        costs?.output ?? 0.015
      )

    case 'gemini':
      return new GeminiAdapter(
        apiKey,
        config.model,
        config.settings,
        costs?.input ?? 0.00125,
        costs?.output ?? 0.005
      )

    case 'groq':
      return new GroqAdapter(
        apiKey,
        config.model,
        config.settings,
        costs?.input ?? 0.00059,  // Llama 3.1 70B
        costs?.output ?? 0.00079
      )

    default:
      throw new Error(`Unknown provider: ${config.provider}`)
  }
}

/**
 * Load active providers from database
 */
async function getActiveProviders(): Promise<AIProviderConfig[]> {
  // Check cache
  if (configCache && Date.now() - configCache.cachedAt < CONFIG_CACHE_TTL) {
    return configCache.data
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('ai_provider_config')
    .select('*')
    .eq('is_active', true)
    .order('priority', { ascending: true })

  if (error) {
    console.error('[AI] Failed to load provider configs:', error)
    // Return fallback from environment
    return getEnvFallbackConfig()
  }

  const configs: AIProviderConfig[] = (data || []).map((row) => ({
    id: row.id,
    provider: row.provider as AIProvider,
    model: row.model,
    apiKey: row.api_key_encrypted ? decryptApiKeyIfConfigured(row.api_key_encrypted) : '',
    isActive: row.is_active,
    priority: row.priority,
    settings: (row.settings as AISettings) || {},
  }))

  // Update cache
  configCache = { data: configs, cachedAt: Date.now() }

  return configs
}

/**
 * Decrypt API key if encryption is configured
 */
function decryptApiKeyIfConfigured(encrypted: string): string {
  if (!isEncryptionConfigured()) {
    // If no encryption configured, assume it's stored in plain text (dev mode)
    return encrypted
  }

  try {
    return decryptApiKey(encrypted)
  } catch {
    console.warn('[AI] Failed to decrypt API key, using as-is')
    return encrypted
  }
}

/**
 * Get API key from environment variables (fallback)
 */
function getEnvApiKey(provider: AIProvider): string | undefined {
  switch (provider) {
    case 'claude':
      return process.env.ANTHROPIC_API_KEY
    case 'openai':
      return process.env.OPENAI_API_KEY
    case 'gemini':
      return process.env.GOOGLE_AI_API_KEY
    case 'groq':
      return process.env.GROQ_API_KEY
    default:
      return undefined
  }
}

/**
 * Fallback config from environment variables
 */
function getEnvFallbackConfig(): AIProviderConfig[] {
  const configs: AIProviderConfig[] = []

  if (process.env.ANTHROPIC_API_KEY) {
    configs.push({
      id: 'env_claude',
      provider: 'claude',
      model: 'claude-3-5-sonnet-20241022',
      apiKey: process.env.ANTHROPIC_API_KEY,
      isActive: true,
      priority: 0,
      settings: { maxTokens: 4096, temperature: 0.7 },
    })
  }

  if (process.env.OPENAI_API_KEY) {
    configs.push({
      id: 'env_openai',
      provider: 'openai',
      model: 'gpt-4o',
      apiKey: process.env.OPENAI_API_KEY,
      isActive: true,
      priority: 1,
      settings: { maxTokens: 4096, temperature: 0.7 },
    })
  }

  if (process.env.GOOGLE_AI_API_KEY) {
    configs.push({
      id: 'env_gemini',
      provider: 'gemini',
      model: 'gemini-1.5-pro',
      apiKey: process.env.GOOGLE_AI_API_KEY,
      isActive: true,
      priority: 2,
      settings: { maxTokens: 4096, temperature: 0.7 },
    })
  }

  if (process.env.GROQ_API_KEY) {
    configs.push({
      id: 'env_groq',
      provider: 'groq',
      model: 'llama-3.1-70b-versatile',
      apiKey: process.env.GROQ_API_KEY,
      isActive: true,
      priority: 3,
      settings: { maxTokens: 4096, temperature: 0.7 },
    })
  }

  return configs
}

/**
 * Get model costs from catalog
 */
async function getModelCosts(
  modelId: string
): Promise<{ input: number; output: number } | null> {
  // Check cache
  if (modelCostCache?.has(modelId)) {
    return modelCostCache.get(modelId)!
  }

  const supabase = createAdminClient()

  const { data } = await supabase
    .from('ai_model_catalog')
    .select('input_cost_per_1k, output_cost_per_1k')
    .eq('id', modelId)
    .single()

  if (!data) {
    return null
  }

  const costs = {
    input: Number(data.input_cost_per_1k),
    output: Number(data.output_cost_per_1k),
  }

  // Initialize cache if needed
  if (!modelCostCache) {
    modelCostCache = new Map()
  }
  modelCostCache.set(modelId, costs)

  return costs
}

/**
 * Clear provider config cache
 */
export function clearAIConfigCache(): void {
  configCache = null
  modelCostCache = null
}

/**
 * Get list of available models for a provider
 */
export async function getAvailableModels(
  provider?: AIProvider
): Promise<AIModel[]> {
  const supabase = createAdminClient()

  let query = supabase
    .from('ai_model_catalog')
    .select('*')
    .eq('is_available', true)
    .eq('is_deprecated', false)
    .order('provider')
    .order('is_latest', { ascending: false })

  if (provider) {
    query = query.eq('provider', provider)
  }

  const { data, error } = await query

  if (error) {
    console.error('[AI] Failed to load models:', error)
    return []
  }

  return (data || []).map((row) => ({
    id: row.id,
    provider: row.provider as AIProvider,
    name: row.name,
    description: row.description || undefined,
    inputCostPer1k: Number(row.input_cost_per_1k),
    outputCostPer1k: Number(row.output_cost_per_1k),
    maxTokens: row.max_tokens,
    contextWindow: row.context_window || undefined,
    isLatest: row.is_latest,
    isDeprecated: row.is_deprecated,
    isAvailable: row.is_available,
    releasedAt: row.released_at || undefined,
    capabilities: (row.capabilities as string[]) || [],
  }))
}

