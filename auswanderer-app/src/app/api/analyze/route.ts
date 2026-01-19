import { NextRequest, NextResponse } from 'next/server'
import { analyzeEmigration, type AnalysisRequest } from '@/lib/claude/analyze'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'

// Cookie name for anonymous session tracking
const SESSION_COOKIE_NAME = 'session_id'
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { preAnalysis, ratings } = body

    // Validate ratings
    if (!ratings || typeof ratings !== 'object' || Object.keys(ratings).length === 0) {
      return NextResponse.json(
        { error: 'Ungültige Bewertungsdaten' },
        { status: 400 }
      )
    }

    // Transform the request to match the Claude API format
    const analysisRequest: AnalysisRequest = {
      criteriaRatings: ratings,
      preAnalysis: preAnalysis || {
        countriesOfInterest: [],
        specialWishes: '',
      },
    }

    // Call Claude AI for analysis
    const analysisResult = await analyzeEmigration(analysisRequest)

    // Get Supabase client and current user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get or create session ID for anonymous users
    const cookieStore = await cookies()
    let sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!user && !sessionId) {
      sessionId = randomUUID()
    }

    // Prepare analysis data for storage
    const analysisId = randomUUID()
    const analysisData = {
      id: analysisId,
      user_id: user?.id || null,
      session_id: user ? null : sessionId,
      ratings: ratings,
      pre_analysis: preAnalysis || null,
      result: {
        topCountry: analysisResult.rankings?.[0]?.country || 'Unbekannt',
        matchPercentage: analysisResult.rankings?.[0]?.percentage || 0,
        rankings: analysisResult.rankings || [],
        recommendation: analysisResult.recommendation || '',
      },
      paid: false,
    }

    // Store in Supabase
    const { error: insertError } = await supabase
      .from('analyses')
      .insert(analysisData)

    let storageWarning: string | undefined

    if (insertError) {
      console.error('Failed to store analysis:', insertError)
      // Analysis was successful but storage failed
      // Return success but with warning - user can still see result but may not be able to retrieve later
      storageWarning = 'Analyse erstellt, aber Speicherung fehlgeschlagen. Bei Problemen bitte erneut starten.'
    } else {
      console.log(`Analysis ${analysisId} stored in Supabase`)
    }

    // Create response with optional warning
    const response = NextResponse.json({
      success: true,
      analysisId,
      ...(storageWarning && { warning: storageWarning, storageError: true }),
      ...analysisResult,
    })

    // Set session cookie for anonymous users
    if (!user && sessionId) {
      response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_COOKIE_MAX_AGE,
        path: '/',
      })
    }

    return response
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Analyse fehlgeschlagen. Bitte versuche es erneut.' },
      { status: 500 }
    )
  }
}
