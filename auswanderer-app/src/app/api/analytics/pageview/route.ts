/**
 * API: Page View Tracking
 *
 * POST - Record a page view
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { recordPageView, parseUserAgent, parseUtmParams } from '@/lib/analytics'
import { hashIP, getClientIP } from '@/lib/rate-limit'

const SESSION_COOKIE_NAME = 'session_id'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { path, timeOnPageMs, scrollDepth } = body

    if (!path) {
      return NextResponse.json(
        { error: 'Path required' },
        { status: 400 }
      )
    }

    // Get client info
    const clientIP = getClientIP(request.headers)
    const ipHash = hashIP(clientIP)
    const userAgent = request.headers.get('user-agent') || ''
    const referer = request.headers.get('referer') || ''

    // Get session
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

    // Parse device info
    const { deviceType } = parseUserAgent(userAgent)

    // Parse UTM params
    const utmParams = parseUtmParams(body.url || referer)

    await recordPageView({
      path,
      sessionId,
      ipHash,
      referrer: referer,
      ...utmParams,
      deviceType,
      countryCode: body.countryCode,
      timeOnPageMs,
      scrollDepth,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Analytics] PageView error:', error)
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    )
  }
}

