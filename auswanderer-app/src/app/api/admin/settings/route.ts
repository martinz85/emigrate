import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/settings
 * Lädt alle Analyse-Einstellungen
 */
export async function GET() {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('analysis_settings')
      .select('*')
      .order('key', { ascending: true })

    if (error) {
      console.error('Error fetching settings:', error)
      return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/settings
 * Aktualisiert eine Einstellung
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()
    const { key, value } = body

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key und Value sind erforderlich' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('analysis_settings')
      .update({ value })
      .eq('key', key)
      .select()
      .single()

    if (error) {
      console.error('Error updating setting:', error)
      return NextResponse.json({ error: 'Fehler beim Speichern' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Settings PUT error:', error)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}
