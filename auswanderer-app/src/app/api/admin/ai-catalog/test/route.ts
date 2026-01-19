/**
 * API: Test Catalog Agent
 *
 * Runs a test of the catalog agent to see what models are detected
 * POST - Run test and return results
 */

import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// Model pricing URLs to check
const PRICING_PAGES = {
  anthropic: 'https://www.anthropic.com/pricing',
  openai: 'https://openai.com/api/pricing/',
  google: 'https://ai.google.dev/pricing',
}

// Known models to compare against
const KNOWN_MODELS = {
  anthropic: [
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', input: 0.003, output: 0.015 },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', input: 0.015, output: 0.075 },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', input: 0.003, output: 0.015 },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', input: 0.00025, output: 0.00125 },
  ],
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o', input: 0.005, output: 0.015 },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', input: 0.00015, output: 0.0006 },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', input: 0.01, output: 0.03 },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', input: 0.0005, output: 0.0015 },
    { id: 'o1', name: 'o1', input: 0.015, output: 0.06 },
    { id: 'o1-mini', name: 'o1-mini', input: 0.003, output: 0.012 },
  ],
  google: [
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', input: 0.00125, output: 0.005 },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', input: 0.000075, output: 0.0003 },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', input: 0.0001, output: 0.0004 },
    { id: 'gemini-2.5-pro-experimental', name: 'Gemini 2.5 Pro (Experimental)', input: 0.0, output: 0.0 },
  ],
}

export async function POST() {
  // Verify admin access
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const { data: adminUser } = await supabaseAuth
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminUser) {
    return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 })
  }

  const supabase = createAdminClient()

  try {
    // Get current catalog from DB
    const { data: catalogModels } = await supabase
      .from('ai_model_catalog')
      .select('*')
      .order('provider', { ascending: true })
      .order('is_latest', { ascending: false })

    // Get current provider configs
    const { data: providerConfigs } = await supabase
      .from('ai_provider_config')
      .select('*')
      .order('priority', { ascending: true })

    // Get catalog agent provider
    const catalogAgentConfig = providerConfigs?.find(c => c.is_catalog_agent)

    // Compile results
    const results = {
      timestamp: new Date().toISOString(),
      catalogAgentProvider: catalogAgentConfig?.provider || 'none (not configured)',
      
      // Models in our database
      currentCatalog: {
        total: catalogModels?.length || 0,
        byProvider: {
          claude: catalogModels?.filter(m => m.provider === 'claude') || [],
          openai: catalogModels?.filter(m => m.provider === 'openai') || [],
          gemini: catalogModels?.filter(m => m.provider === 'gemini') || [],
        }
      },

      // Known models (hardcoded reference)
      knownModels: KNOWN_MODELS,

      // Pricing page URLs
      pricingUrls: PRICING_PAGES,

      // Provider priority
      providerPriority: providerConfigs?.map((c, i) => ({
        position: i + 1,
        provider: c.provider,
        model: c.model,
        isActive: c.is_active,
        hasApiKey: !!c.api_key_encrypted,
        isCatalogAgent: c.is_catalog_agent,
      })) || [],

      // Recommendations
      recommendations: [] as string[],
    }

    // Add recommendations
    if (!catalogAgentConfig) {
      results.recommendations.push('⚠️ Kein Catalog Agent konfiguriert. Empfehlung: Gemini als Agent setzen (kostenlos).')
    }
    
    if (catalogAgentConfig && !catalogAgentConfig.api_key_encrypted) {
      results.recommendations.push(`⚠️ Catalog Agent (${catalogAgentConfig.provider}) hat keinen API Key.`)
    }

    const geminiConfig = providerConfigs?.find(c => c.provider === 'gemini')
    if (geminiConfig && !geminiConfig.is_catalog_agent) {
      results.recommendations.push('💡 Tipp: Gemini hat ein kostenloses Kontingent - ideal als Catalog Agent.')
    }

    const activeProviders = providerConfigs?.filter(c => c.is_active && c.api_key_encrypted) || []
    if (activeProviders.length === 0) {
      results.recommendations.push('⚠️ Kein Provider aktiv mit API Key. Mindestens einer benötigt.')
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Catalog test error:', error)
    return NextResponse.json({ error: 'Test fehlgeschlagen' }, { status: 500 })
  }
}

