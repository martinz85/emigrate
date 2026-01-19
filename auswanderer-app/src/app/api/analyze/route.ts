import { NextRequest, NextResponse } from 'next/server'
import { analyzeEmigration, type AnalysisRequest } from '@/lib/ai'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'
import {
  checkRateLimits,
  incrementRateLimits,
  recordUsageStats,
  calculateCost,
  hashIP,
  getClientIP,
  checkBudgetWarning,
  type UsageStats,
} from '@/lib/rate-limit'
import { sendEmail } from '@/lib/email'

// Cookie name for anonymous session tracking
const SESSION_COOKIE_NAME = 'session_id'
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

// Track if warning email was sent today
let lastWarningEmailDate: string | null = null

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Get client identifiers for rate limiting
    const clientIP = getClientIP(request.headers)
    const ipHash = hashIP(clientIP)

    // Get session ID from cookies
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value || null

    // Check rate limits BEFORE processing
    const rateLimitResult = await checkRateLimits(ipHash, sessionId)

    if (!rateLimitResult.allowed) {
      const errorMessages: Record<string, string> = {
        ip_limit: `Du hast das tägliche Limit erreicht (${rateLimitResult.limit} Analysen/Tag). Versuche es morgen erneut.`,
        session_limit: `Du hast das Maximum erreicht (${rateLimitResult.limit} Analysen pro Session).`,
        global_limit: 'Wir haben heute das globale Analyselimit erreicht. Bitte versuche es morgen erneut.',
        budget_exceeded: 'Der Service ist heute vorübergehend nicht verfügbar. Bitte versuche es morgen erneut.',
      }

      return NextResponse.json(
        {
          error: errorMessages[rateLimitResult.reason!] || 'Rate limit erreicht',
          rateLimit: {
            limit: rateLimitResult.limit,
            remaining: rateLimitResult.remaining,
            resetAt: rateLimitResult.resetAt.toISOString(),
          },
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(rateLimitResult.limit),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
            'Retry-After': String(Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000)),
          },
        }
      )
    }

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

    // Extract token usage from Claude response (if available)
    const inputTokens = (analysisResult as any)._usage?.input_tokens || 2500
    const outputTokens = (analysisResult as any)._usage?.output_tokens || 1500
    const totalTokens = inputTokens + outputTokens
    const costUsd = await calculateCost(inputTokens, outputTokens)

    const usage: UsageStats = {
      inputTokens,
      outputTokens,
      totalTokens,
      costUsd,
      model: 'claude-3-5-sonnet-20241022',
      requestId: (analysisResult as any)._requestId,
    }

    // Get Supabase client and current user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get or create session ID for anonymous users
    let newSessionId = sessionId

    if (!user && !newSessionId) {
      newSessionId = randomUUID()
    }

    // Prepare analysis data for storage
    const analysisId = randomUUID()
    const analysisData = {
      id: analysisId,
      user_id: user?.id || null,
      session_id: user ? null : newSessionId,
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
      storageWarning = 'Analyse erstellt, aber Speicherung fehlgeschlagen. Bei Problemen bitte erneut starten.'
    } else {
      console.log(`Analysis ${analysisId} stored in Supabase`)
    }

    // Increment rate limits and record usage AFTER successful analysis
    await incrementRateLimits(ipHash, newSessionId, usage)

    // Record detailed usage stats
    await recordUsageStats({
      analysisId,
      sessionId: newSessionId,
      ipHash,
      usage,
      userAgent: request.headers.get('user-agent') || undefined,
      referrer: request.headers.get('referer') || undefined,
      stepReached: 'result',
      questionsAnswered: Object.keys(ratings).length,
      isCompleted: true,
    })

    // Check if budget warning should be sent (once per day)
    const today = new Date().toISOString().split('T')[0]
    if (lastWarningEmailDate !== today) {
      const budgetStatus = await checkBudgetWarning()
      if (budgetStatus.warningReached) {
        lastWarningEmailDate = today
        // Send warning email (non-blocking)
        sendBudgetWarningEmail(budgetStatus).catch(console.error)
      }
    }

    const duration = Date.now() - startTime

    // Create response with rate limit headers
    const response = NextResponse.json({
      success: true,
      analysisId,
      ...(storageWarning && { warning: storageWarning, storageError: true }),
      ...analysisResult,
      _meta: {
        duration,
        remaining: rateLimitResult.remaining,
      },
    })

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', String(rateLimitResult.limit))
    response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining))
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetAt.toISOString())

    // Set session cookie for anonymous users
    if (!user && newSessionId) {
      response.cookies.set(SESSION_COOKIE_NAME, newSessionId, {
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

/**
 * Send budget warning email to admin
 */
async function sendBudgetWarningEmail(budgetStatus: {
  currentSpend: number
  budget: number
  percentUsed: number
}): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || 'martin@infravivo.se'

  try {
    await sendEmail({
      to: adminEmail,
      subject: `⚠️ Budget-Warnung: ${Math.round(budgetStatus.percentUsed)}% des Tagesbudgets erreicht`,
      text: `
Auswanderer-Plattform Budget-Warnung

Aktueller Stand:
- Verbrauch heute: $${budgetStatus.currentSpend.toFixed(4)}
- Tagesbudget: $${budgetStatus.budget.toFixed(2)}
- Prozent verbraucht: ${Math.round(budgetStatus.percentUsed)}%

Empfehlung: Überprüfe die Nutzung im Admin-Dashboard.

--
Automatische Benachrichtigung von der Auswanderer-Plattform
      `.trim(),
    })

    console.log('[Budget] Warning email sent to admin')
  } catch (error) {
    console.error('[Budget] Failed to send warning email:', error)
  }
}
