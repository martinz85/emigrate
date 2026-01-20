import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/settings
 * Lädt Analyse-Einstellungen (öffentlich, nur lesen)
 */
export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('analysis_settings')
      .select('key, value')

    if (error) {
      console.error('Error fetching settings:', error)
      return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
    }

    // Convert to key-value object for easier access
    const settings: Record<string, unknown> = {}
    for (const item of data || []) {
      settings[item.key] = item.value
    }

    return NextResponse.json({ data: settings })
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}

