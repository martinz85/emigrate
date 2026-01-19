/**
 * API Route: Test AI Provider Connection
 * 
 * POST /api/admin/ai-settings/test
 * 
 * Tests the connection to a specific AI provider by sending a simple request.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getSpecificAdapter } from '@/lib/ai/factory'
import type { AIProvider } from '@/lib/ai/types'

export async function POST(request: NextRequest) {
  try {
    // Check admin auth
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    // Check admin role
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!adminUser) {
      return NextResponse.json({ error: 'Kein Admin-Zugang' }, { status: 403 })
    }

    const body = await request.json()
    const { provider } = body as { provider: AIProvider }

    if (!provider) {
      return NextResponse.json({ error: 'Provider fehlt' }, { status: 400 })
    }

    // Measure latency
    const startTime = Date.now()

    try {
      // Get adapter for the specific provider
      const adapter = await getSpecificAdapter(provider)

      // Perform health check
      const isHealthy = await adapter.healthCheck()

      const latencyMs = Date.now() - startTime

      if (isHealthy) {
        return NextResponse.json({
          success: true,
          provider,
          latencyMs,
          message: 'Verbindung erfolgreich',
        })
      } else {
        return NextResponse.json({
          success: false,
          error: 'Health Check fehlgeschlagen',
          provider,
          latencyMs,
        }, { status: 500 })
      }
    } catch (adapterError) {
      const latencyMs = Date.now() - startTime
      const errorMessage = adapterError instanceof Error 
        ? adapterError.message 
        : 'Unbekannter Fehler'

      console.error(`[AI Test] Provider ${provider} failed:`, errorMessage)

      return NextResponse.json({
        success: false,
        error: errorMessage,
        provider,
        latencyMs,
      }, { status: 500 })
    }
  } catch (error) {
    console.error('[AI Test] Error:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

