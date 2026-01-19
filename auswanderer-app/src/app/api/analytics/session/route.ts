/**
 * API: Analytics Session Tracking
 *
 * POST - Start or update a session
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  startSession,
  updateSession,
  findSessionBySessionId,
  parseUserAgent,
  parseUtmParams,
} from '@/lib/analytics'
import { hashIP, getClientIP } from '@/lib/rate-limit'

const SESSION_COOKIE_NAME = 'session_id'
const ANALYTICS_SESSION_COOKIE = 'analytics_session_id'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    // Get client info
    const clientIP = getClientIP(request.headers)
    const ipHash = hashIP(clientIP)
    const userAgent = request.headers.get('user-agent') || ''
    const referer = request.headers.get('referer') || ''

    // Get session cookies
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value || null
    let analyticsSessionId = cookieStore.get(ANALYTICS_SESSION_COOKIE)?.value || null

    // Parse device info
    const deviceInfo = parseUserAgent(userAgent)

    // Parse UTM params from referer or current URL
    const utmParams = parseUtmParams(data?.url || referer)

    switch (action) {
      case 'start': {
        // Start new analytics session
        const newSessionId = await startSession({
          ipHash,
          sessionId,
          referrer: referer,
          ...utmParams,
          landingPage: data?.landingPage,
          userAgent,
          ...deviceInfo,
          screenWidth: data?.screenWidth,
          screenHeight: data?.screenHeight,
          countryCode: data?.countryCode,
        })

        // Create response with cookie
        const response = NextResponse.json({
          success: true,
          analyticsSessionId: newSessionId,
        })

        response.cookies.set(ANALYTICS_SESSION_COOKIE, newSessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24, // 24 hours
          path: '/',
        })

        return response
      }

      case 'update': {
        // Update existing session
        const existingSessionId = analyticsSessionId || await findSessionBySessionId(sessionId!)

        if (!existingSessionId) {
          return NextResponse.json(
            { error: 'No active session' },
            { status: 400 }
          )
        }

        await updateSession(existingSessionId, {
          questionsAnswered: data?.questionsAnswered,
          questionTimes: data?.questionTimes,
          isCompleted: data?.isCompleted,
          abandonedAtQuestion: data?.abandonedAtQuestion,
          abandonedAtStep: data?.abandonedAtStep,
          aiProvider: data?.aiProvider,
          aiModel: data?.aiModel,
          aiInputTokens: data?.aiInputTokens,
          aiOutputTokens: data?.aiOutputTokens,
          aiCostUsd: data?.aiCostUsd,
          aiResponseTimeMs: data?.aiResponseTimeMs,
          aiFallbackUsed: data?.aiFallbackUsed,
          analysisId: data?.analysisId,
          topCountry: data?.topCountry,
          topCountryPercentage: data?.topCountryPercentage,
          countriesOfInterest: data?.countriesOfInterest,
        })

        return NextResponse.json({ success: true })
      }

      case 'abandon': {
        // Mark session as abandoned
        const existingSessionId = analyticsSessionId || await findSessionBySessionId(sessionId!)

        if (existingSessionId) {
          await updateSession(existingSessionId, {
            abandonedAtStep: data?.step,
            abandonedAtQuestion: data?.question,
          })
        }

        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('[Analytics] Session error:', error)
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    )
  }
}

