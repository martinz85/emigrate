/**
 * AI Catalog Agent
 *
 * Periodically checks AI provider pricing pages for:
 * - New models
 * - Price changes
 * - Deprecated models
 *
 * Uses Claude 3.5 Sonnet to analyze the pricing pages.
 */

import { createAdminClient } from '@/lib/supabase/server'
import { getSpecificAdapter } from './factory'
import type { AIProvider, ModelUpdate, CatalogCheck, ModelUpdateType } from './types'
import type { Json } from '@/lib/supabase/database.types'

// Pricing page URLs
const PRICING_URLS: Partial<Record<AIProvider, string>> = {
  claude: 'https://www.anthropic.com/pricing',
  openai: 'https://openai.com/api/pricing',
  gemini: 'https://ai.google.dev/pricing',
  groq: 'https://groq.com/pricing',
}

const CATALOG_AGENT_PROMPT = `Du bist ein Preisanalyse-Agent für AI-APIs. Deine Aufgabe ist es, Änderungen in AI-Modell-Katalogen zu identifizieren.

Du erhältst:
1. Den aktuellen Modell-Katalog (was wir gespeichert haben)
2. Den Inhalt von Pricing-Pages der Provider

Finde:
1. **Neue Modelle**: Modelle die in den Pricing-Pages erwähnt werden, aber nicht in unserem Katalog sind
2. **Preisänderungen**: Modelle wo die Preise sich geändert haben
3. **Deprecated**: Modelle die nicht mehr auf den Pricing-Pages erscheinen

Antworte AUSSCHLIESSLICH im JSON-Format:
{
  "updates": [
    {
      "type": "new_model" | "price_change" | "deprecated",
      "provider": "claude" | "openai" | "gemini" | "groq",
      "modelId": "claude-3-5-sonnet-20250115",
      "suggestedData": {
        "name": "Claude 3.5 Sonnet (January 2025)",
        "inputCostPer1k": 0.003,
        "outputCostPer1k": 0.015,
        "maxTokens": 8192
      },
      "changeSummary": "Neues Modell claude-3-5-sonnet-20250115 gefunden",
      "confidence": 0.95
    }
  ],
  "summary": "2 neue Modelle gefunden, 1 Preisänderung"
}

Wichtig:
- Preise in USD pro 1.000 Tokens
- Nur sichere Änderungen mit hoher Confidence melden
- Bei Unsicherheit lieber weglassen`

/**
 * Get the configured catalog agent provider
 */
async function getCatalogAgentProvider(): Promise<AIProvider> {
  const supabase = createAdminClient()
  
  // Find provider marked as catalog agent
  const { data: agentConfig } = await supabase
    .from('ai_provider_config')
    .select('provider')
    .eq('is_catalog_agent', true)
    .single()
  
  if (agentConfig?.provider) {
    return agentConfig.provider as AIProvider
  }
  
  // Fallback: use first active provider with API key
  const { data: fallbackConfig } = await supabase
    .from('ai_provider_config')
    .select('provider')
    .eq('is_active', true)
    .not('api_key_encrypted', 'is', null)
    .order('priority')
    .limit(1)
    .single()
  
  return (fallbackConfig?.provider as AIProvider) || 'claude'
}

/**
 * Run the catalog check
 */
export async function runCatalogCheck(
  triggeredBy?: string,
  triggerType: 'cron' | 'manual' = 'manual'
): Promise<{ checkId: string; updatesFound: number }> {
  const supabase = createAdminClient()
  const startTime = Date.now()

  // Create check log entry
  const { data: checkLog, error: logError } = await supabase
    .from('ai_catalog_checks')
    .insert({
      trigger_type: triggerType,
      triggered_by: triggeredBy || null,
      status: 'running',
    })
    .select('id')
    .single()

  if (logError || !checkLog) {
    console.error('[Catalog] Failed to create check log:', logError)
    throw new Error('Failed to create check log')
  }

  const checkId = checkLog.id

  try {
    // 1. Load current catalog from DB
    const { data: currentCatalog } = await supabase
      .from('ai_model_catalog')
      .select('*')
      .order('provider')

    // 2. Fetch pricing pages (simplified - in production would use proper scraping)
    const pricingContent = await fetchPricingPages()

    // 3. Get configured catalog agent provider and use it
    const catalogProvider = await getCatalogAgentProvider()
    console.log(`[Catalog] Using ${catalogProvider} as catalog agent`)
    
    const adapter = await getSpecificAdapter(catalogProvider)

    const response = await adapter.chat({
      system: CATALOG_AGENT_PROMPT,
      messages: [
        {
          role: 'user',
          content: `## Aktueller Katalog (was wir gespeichert haben):
${JSON.stringify(currentCatalog, null, 2)}

## Anthropic Pricing Page:
${pricingContent.claude}

## OpenAI Pricing Page:
${pricingContent.openai}

## Google AI Pricing Page:
${pricingContent.gemini}

Analysiere die Unterschiede und gib mir die Updates als JSON.`,
        },
      ],
      maxTokens: 4096,
    })

    // 4. Parse response
    const updates = parseAgentResponse(response.content)

    // 5. Store updates in DB
    for (const update of updates) {
      await supabase.from('ai_model_updates').insert({
        update_type: update.type,
        provider: update.provider,
        model_id: update.modelId,
        current_data: getCurrentModelData(currentCatalog, update.modelId) as unknown as Json,
        suggested_data: update.suggestedData as unknown as Json,
        change_summary: update.changeSummary,
        confidence: update.confidence,
        status: 'pending',
      })
    }

    // 6. Update check log
    const durationMs = Date.now() - startTime
    const usage = adapter.getLastUsage()

    await supabase
      .from('ai_catalog_checks')
      .update({
        status: 'completed',
        models_checked: currentCatalog?.length || 0,
        updates_found: updates.length,
        ai_model_used: adapter.model,
        ai_input_tokens: usage?.inputTokens,
        ai_output_tokens: usage?.outputTokens,
        ai_cost_usd: usage?.costUsd,
        duration_ms: durationMs,
        completed_at: new Date().toISOString(),
      })
      .eq('id', checkId)

    console.log(
      `[Catalog] Check completed: ${updates.length} updates found (${durationMs}ms, $${usage?.costUsd?.toFixed(4) || 0})`
    )

    return { checkId, updatesFound: updates.length }
  } catch (error) {
    // Update check log with error
    await supabase
      .from('ai_catalog_checks')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        completed_at: new Date().toISOString(),
      })
      .eq('id', checkId)

    throw error
  }
}

/**
 * Fetch pricing pages content
 *
 * Note: In production, this would use a proper web scraping service
 * or the providers' APIs where available.
 */
async function fetchPricingPages(): Promise<Record<AIProvider, string>> {
  const results: Record<AIProvider, string> = {
    claude: '',
    openai: '',
    gemini: '',
    groq: '',
  }

  for (const [provider, url] of Object.entries(PRICING_URLS)) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; AuswandererBot/1.0; +https://auswanderer-plattform.de)',
        },
      })

      if (response.ok) {
        const html = await response.text()
        // Extract text content (simplified - in production would parse HTML properly)
        results[provider as AIProvider] = extractTextFromHtml(html)
      } else {
        console.warn(`[Catalog] Failed to fetch ${provider} pricing: ${response.status}`)
        results[provider as AIProvider] = `[Fetch failed: ${response.status}]`
      }
    } catch (error) {
      console.error(`[Catalog] Error fetching ${provider}:`, error)
      results[provider as AIProvider] = `[Error: ${error}]`
    }
  }

  return results
}

/**
 * Extract readable text from HTML (simplified)
 */
function extractTextFromHtml(html: string): string {
  // Remove script and style tags
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ')

  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim()

  // Limit length
  return text.substring(0, 10000)
}

/**
 * Parse the agent's JSON response
 */
function parseAgentResponse(
  content: string
): Array<{
  type: string
  provider: AIProvider
  modelId: string
  suggestedData: Record<string, unknown>
  changeSummary: string
  confidence: number
}> {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return []
    }

    const parsed = JSON.parse(jsonMatch[0])
    return parsed.updates || []
  } catch (error) {
    console.error('[Catalog] Failed to parse agent response:', error)
    return []
  }
}

/**
 * Get current model data from catalog
 */
function getCurrentModelData(
  catalog: any[] | null,
  modelId: string
): Record<string, unknown> | null {
  if (!catalog) return null

  const model = catalog.find((m) => m.id === modelId)
  return model || null
}

/**
 * Apply a model update
 */
export async function applyModelUpdate(
  updateId: string,
  appliedBy: string
): Promise<void> {
  const supabase = createAdminClient()

  // Get the update
  const { data: update, error: fetchError } = await supabase
    .from('ai_model_updates')
    .select('*')
    .eq('id', updateId)
    .single()

  if (fetchError || !update) {
    throw new Error('Update not found')
  }

  if (update.status !== 'pending') {
    throw new Error('Update already processed')
  }

  const suggestedData = update.suggested_data as Record<string, unknown>

  // Apply based on update type
  switch (update.update_type) {
    case 'new_model':
      await supabase.from('ai_model_catalog').insert({
        id: update.model_id,
        provider: update.provider,
        name: String(suggestedData.name || 'Unknown Model'),
        input_cost_per_1k: Number(suggestedData.inputCostPer1k) || 0,
        output_cost_per_1k: Number(suggestedData.outputCostPer1k) || 0,
        max_tokens: Number(suggestedData.maxTokens) || 4096,
        is_available: true,
        is_latest: Boolean(suggestedData.isLatest) || false,
      })
      break

    case 'price_change':
      await supabase
        .from('ai_model_catalog')
        .update({
          input_cost_per_1k: Number(suggestedData.inputCostPer1k) || 0,
          output_cost_per_1k: Number(suggestedData.outputCostPer1k) || 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', update.model_id)
      break

    case 'deprecated':
      await supabase
        .from('ai_model_catalog')
        .update({
          is_deprecated: true,
          deprecated_at: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
        })
        .eq('id', update.model_id)
      break
  }

  // Mark update as applied
  await supabase
    .from('ai_model_updates')
    .update({
      status: 'applied',
      applied_at: new Date().toISOString(),
      applied_by: appliedBy,
    })
    .eq('id', updateId)
}

/**
 * Dismiss a model update
 */
export async function dismissModelUpdate(
  updateId: string,
  dismissedBy: string,
  reason?: string
): Promise<void> {
  const supabase = createAdminClient()

  await supabase
    .from('ai_model_updates')
    .update({
      status: 'dismissed',
      dismissed_at: new Date().toISOString(),
      dismissed_by: dismissedBy,
      dismiss_reason: reason || null,
    })
    .eq('id', updateId)
}

/**
 * Get pending model updates
 */
export async function getPendingUpdates(): Promise<ModelUpdate[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('ai_model_updates')
    .select('*')
    .eq('status', 'pending')
    .order('checked_at', { ascending: false })

  if (error) {
    console.error('[Catalog] Failed to fetch pending updates:', error)
    return []
  }

  return (data || []).map((row) => ({
    id: row.id,
    updateType: row.update_type as ModelUpdateType,
    provider: row.provider as AIProvider,
    modelId: row.model_id,
    currentData: row.current_data as Record<string, unknown> | null,
    suggestedData: row.suggested_data as Record<string, unknown>,
    changeSummary: row.change_summary || '',
    sourceUrl: row.source_url || undefined,
    confidence: Number(row.confidence) || 0,
    status: (row.status || 'pending') as 'pending' | 'applied' | 'dismissed' | 'invalid',
    checkedAt: row.checked_at || new Date().toISOString(),
    appliedAt: row.applied_at || undefined,
    appliedBy: row.applied_by || undefined,
  }))
}

/**
 * Get recent catalog checks
 */
export async function getRecentChecks(limit = 10): Promise<CatalogCheck[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('ai_catalog_checks')
    .select('*')
    .order('checked_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[Catalog] Failed to fetch checks:', error)
    return []
  }

  return (data || []).map((row) => ({
    id: row.id,
    checkedAt: row.checked_at || new Date().toISOString(),
    triggerType: (row.trigger_type || 'manual') as 'cron' | 'manual',
    triggeredBy: row.triggered_by || undefined,
    status: (row.status || 'running') as 'running' | 'completed' | 'failed',
    modelsChecked: row.models_checked || 0,
    updatesFound: row.updates_found || 0,
    aiModelUsed: row.ai_model_used || undefined,
    aiInputTokens: row.ai_input_tokens || undefined,
    aiOutputTokens: row.ai_output_tokens || undefined,
    aiCostUsd: row.ai_cost_usd ? Number(row.ai_cost_usd) : undefined,
    durationMs: row.duration_ms || undefined,
    errorMessage: row.error_message || undefined,
    completedAt: row.completed_at || undefined,
  }))
}

