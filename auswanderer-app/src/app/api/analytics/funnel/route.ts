/**
 * API: Funnel Step Tracking
 *
 * POST - Increment a funnel step
 */

import { NextRequest, NextResponse } from 'next/server'
import { incrementFunnelStep, parseUserAgent } from '@/lib/analytics'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { step } = body

    if (!step) {
      return NextResponse.json(
        { error: 'Step required' },
        { status: 400 }
      )
    }

    // Get device type
    const userAgent = request.headers.get('user-agent') || ''
    const { deviceType } = parseUserAgent(userAgent)

    await incrementFunnelStep(step, deviceType)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Analytics] Funnel error:', error)
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    )
  }
}

