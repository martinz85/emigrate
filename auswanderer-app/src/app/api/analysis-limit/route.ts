/**
 * Analysis Limit API
 * Story 8.5: Tägliches Analyse-Limit für PRO-User
 * 
 * Returns the current user's analysis limit status.
 */

import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { checkAnalysisLimit } from '@/lib/analysis-limit'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Not logged in - return no limit info
      return NextResponse.json({
        isPro: false,
        hasLimit: false,
      })
    }

    const supabaseAdmin = createAdminClient()
    const limitResult = await checkAnalysisLimit(supabaseAdmin, user.id)

    return NextResponse.json({
      isPro: limitResult.isPro,
      hasLimit: limitResult.isPro && limitResult.limit > 0,
      allowed: limitResult.allowed,
      remaining: limitResult.remaining,
      limit: limitResult.limit,
      usedToday: limitResult.usedToday,
      resetAt: limitResult.resetAt,
    })

  } catch (error) {
    console.error('Analysis limit check error:', error)
    return NextResponse.json(
      { error: 'Limit konnte nicht abgerufen werden' },
      { status: 500 }
    )
  }
}

