/**
 * Admin API: AI Settings
 *
 * GET - List all provider configs and models
 * PUT - Update provider configuration
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { encryptApiKey, maskApiKey, isEncryptionConfigured } from '@/lib/ai'
import { logAuditEvent } from '@/lib/audit'
import { clearAIConfigCache } from '@/lib/ai'

/**
 * GET /api/admin/ai-settings
 * List all provider configs and available models
 */
export async function GET() {
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

  // Fetch provider configs
  const { data: configs, error: configError } = await supabase
    .from('ai_provider_config')
    .select('*')
    .order('priority', { ascending: true })

  if (configError) {
    console.error('Failed to fetch AI configs:', configError)
    return NextResponse.json({ error: 'Laden fehlgeschlagen' }, { status: 500 })
  }

  // Fetch available models
  const { data: models, error: modelError } = await supabase
    .from('ai_model_catalog')
    .select('*')
    .eq('is_available', true)
    .order('provider')
    .order('is_latest', { ascending: false })

  if (modelError) {
    console.error('Failed to fetch AI models:', modelError)
    return NextResponse.json({ error: 'Laden fehlgeschlagen' }, { status: 500 })
  }

  // Mask API keys for response
  const maskedConfigs = (configs || []).map((config) => ({
    ...config,
    api_key_encrypted: config.api_key_encrypted
      ? maskApiKey(config.api_key_encrypted.substring(0, 20)) // Mask even encrypted
      : null,
    has_api_key: !!config.api_key_encrypted,
  }))

  return NextResponse.json({
    configs: maskedConfigs,
    models: models || [],
    encryptionConfigured: isEncryptionConfigured(),
  })
}

/**
 * PUT /api/admin/ai-settings
 * Update a provider configuration
 */
export async function PUT(request: NextRequest) {
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

  // Only super_admin can modify AI settings
  if (!adminUser || adminUser.role !== 'super_admin') {
    return NextResponse.json(
      { error: 'Nur Super-Admins können AI-Einstellungen ändern' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { id, provider, model, apiKey, isActive, is_active, priority, settings, is_catalog_agent } = body

    if (!id) {
      return NextResponse.json({ error: 'ID erforderlich' }, { status: 400 })
    }

    // Validate provider
    const validProviders = ['claude', 'openai', 'gemini', 'groq']
    if (provider && !validProviders.includes(provider)) {
      return NextResponse.json({ error: 'Ungültiger Provider' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    }

    if (provider !== undefined) updateData.provider = provider
    if (model !== undefined) updateData.model = model
    if (isActive !== undefined) updateData.is_active = isActive
    if (is_active !== undefined) updateData.is_active = is_active
    if (priority !== undefined) updateData.priority = priority
    if (settings !== undefined) updateData.settings = settings
    
    // Handle catalog agent toggle (only one can be true)
    if (is_catalog_agent !== undefined) {
      if (is_catalog_agent) {
        // First, unset all others
        await supabase
          .from('ai_provider_config')
          .update({ is_catalog_agent: false })
          .neq('id', id)
      }
      updateData.is_catalog_agent = is_catalog_agent
    }

    // Handle API key (encrypt if provided)
    if (apiKey) {
      if (isEncryptionConfigured()) {
        updateData.api_key_encrypted = encryptApiKey(apiKey)
      } else {
        // Store as-is in development
        updateData.api_key_encrypted = apiKey
      }
    }

    // Update config
    const { error: updateError } = await supabase
      .from('ai_provider_config')
      .update(updateData)
      .eq('id', id)

    if (updateError) {
      console.error('Failed to update AI config:', updateError)
      return NextResponse.json({ error: 'Speichern fehlgeschlagen' }, { status: 500 })
    }

    // Clear cache
    clearAIConfigCache()

    // Audit log
    await logAuditEvent({
      action: 'AI_SETTINGS_UPDATED' as any,
      targetId: id,
      targetType: 'ai_provider' as any,
      adminId: user.id,
      metadata: {
        provider,
        model,
        isActive: isActive || is_active,
        priority,
        isCatalogAgent: is_catalog_agent,
        apiKeyChanged: !!apiKey,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('AI settings update error:', error)
    return NextResponse.json({ error: 'Fehler beim Speichern' }, { status: 500 })
  }
}

