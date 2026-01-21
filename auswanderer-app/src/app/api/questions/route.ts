import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { AnalysisQuestionWithCategory } from '@/types/questions'

/**
 * GET /api/questions
 * 
 * Öffentliche API für aktive Analyse-Fragen.
 * 
 * Story 8.4: PRO-Only Fragen
 * - FREE User: Nur Fragen mit is_pro_only = false
 * - PRO User: Alle Fragen (inkl. PRO-Only)
 * 
 * Wird vom Frontend verwendet, um Fragen dynamisch zu laden.
 * Änderungen im Admin wirken sofort.
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // Check if user is PRO
    let isPro = false
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const supabaseAdmin = createAdminClient()
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('subscription_tier, subscription_status')
        .eq('id', user.id)
        .single()
      
      isPro = profile?.subscription_tier === 'pro' && 
              (profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing')
    }

    // Build query - filter PRO-only questions for free users
    let query = supabase
      .from('analysis_questions')
      .select(`
        *,
        category:question_categories(*)
      `)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    // FREE users don't see PRO-only questions
    if (!isPro) {
      query = query.or('is_pro_only.is.null,is_pro_only.eq.false')
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching questions:', error)
      return NextResponse.json(
        { error: 'Fehler beim Laden der Fragen' },
        { status: 500 }
      )
    }

    // Cache für 60 Sekunden, aber revalidate on demand
    // Vary by user's PRO status
    return NextResponse.json(
      { 
        data: data as AnalysisQuestionWithCategory[],
        isPro: isPro, // Let frontend know for UI hints
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=60', // private because it depends on user
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

