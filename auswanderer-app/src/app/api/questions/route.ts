import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { AnalysisQuestionWithCategory } from '@/types/questions'

/**
 * GET /api/questions
 * 
 * Öffentliche API für aktive Analyse-Fragen.
 * Kein Auth erforderlich - nur aktive Fragen werden zurückgegeben.
 * 
 * Wird vom Frontend verwendet, um Fragen dynamisch zu laden.
 * Änderungen im Admin wirken sofort.
 */
export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('analysis_questions')
      .select(`
        *,
        category:question_categories(*)
      `)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching questions:', error)
      return NextResponse.json(
        { error: 'Fehler beim Laden der Fragen' },
        { status: 500 }
      )
    }

    // Cache für 60 Sekunden, aber revalidate on demand
    return NextResponse.json(
      { data: data as AnalysisQuestionWithCategory[] },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    )
  } catch (error) {
    console.error('Questions API error:', error)
    return NextResponse.json(
      { error: 'Serverfehler' },
      { status: 500 }
    )
  }
}

