/**
 * Session Tracking Utilities
 *
 * Tracks user journey through the analysis flow for:
 * - Julian (SEO/Conversion): Traffic sources, device, funnel
 * - Linus (Controller): Revenue, costs, conversion rates
 */

import { createAdminClient } from '@/lib/supabase/server'
import { hashIP } from '@/lib/rate-limit'

// ============================================
// TYPES
// ============================================

export interface SessionData {
  ipHash: string
  sessionId: string | null
  userId?: string | null
  
  // Traffic Source
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  landingPage?: string
  
  // Device
  userAgent?: string
  deviceType?: 'mobile' | 'tablet' | 'desktop'
  browser?: string
  os?: string
  screenWidth?: number
  screenHeight?: number
  
  // Geo
  countryCode?: string
}

export interface SessionUpdate {
  questionsAnswered?: number
  questionTimes?: Record<string, number>
  isCompleted?: boolean
  abandonedAtQuestion?: number
  abandonedAtStep?: string
  
  // AI
  aiProvider?: string
  aiModel?: string
  aiInputTokens?: number
  aiOutputTokens?: number
  aiCostUsd?: number
  aiResponseTimeMs?: number
  aiFallbackUsed?: boolean
  
  // Result
  analysisId?: string
  topCountry?: string
  topCountryPercentage?: number
  countriesOfInterest?: string[]
}

export interface ConversionUpdate {
  teaserViewedAt?: string
  checkoutStartedAt?: string
  convertedToPaid?: boolean
  paidAt?: string
  pricePaid?: number
  discountCode?: string
  discountAmount?: number
}

// ============================================
// SESSION CREATION
// ============================================

/**
 * Start a new analysis session
 */
export async function startSession(data: SessionData): Promise<string> {
  const supabase = createAdminClient()

  const { data: session, error } = await supabase
    .from('analysis_sessions')
    .insert({
      ip_hash: data.ipHash,
      session_id: data.sessionId,
      user_id: data.userId || null,
      referrer: data.referrer?.substring(0, 500),
      utm_source: data.utmSource,
      utm_medium: data.utmMedium,
      utm_campaign: data.utmCampaign,
      utm_term: data.utmTerm,
      utm_content: data.utmContent,
      landing_page: data.landingPage,
      user_agent: data.userAgent?.substring(0, 500),
      device_type: data.deviceType,
      browser: data.browser,
      os: data.os,
      screen_width: data.screenWidth,
      screen_height: data.screenHeight,
      country_code: data.countryCode,
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) {
    console.error('[Session] Failed to start session:', error)
    throw error
  }

  return session.id
}

/**
 * Update session with progress data
 */
export async function updateSession(
  sessionId: string,
  update: SessionUpdate
): Promise<void> {
  const supabase = createAdminClient()

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (update.questionsAnswered !== undefined) {
    updateData.questions_answered = update.questionsAnswered
  }
  if (update.questionTimes !== undefined) {
    updateData.question_times = update.questionTimes
    // Calculate average
    const times = Object.values(update.questionTimes)
    if (times.length > 0) {
      updateData.avg_question_time_ms = Math.round(
        times.reduce((a, b) => a + b, 0) / times.length
      )
    }
  }
  if (update.isCompleted !== undefined) {
    updateData.is_completed = update.isCompleted
    if (update.isCompleted) {
      updateData.completed_at = new Date().toISOString()
    }
  }
  if (update.abandonedAtQuestion !== undefined) {
    updateData.abandoned_at_question = update.abandonedAtQuestion
    updateData.abandoned_at = new Date().toISOString()
  }
  if (update.abandonedAtStep !== undefined) {
    updateData.abandoned_at_step = update.abandonedAtStep
    updateData.abandoned_at = new Date().toISOString()
  }
  if (update.aiProvider !== undefined) {
    updateData.ai_provider = update.aiProvider
  }
  if (update.aiModel !== undefined) {
    updateData.ai_model = update.aiModel
  }
  if (update.aiInputTokens !== undefined) {
    updateData.ai_input_tokens = update.aiInputTokens
  }
  if (update.aiOutputTokens !== undefined) {
    updateData.ai_output_tokens = update.aiOutputTokens
  }
  if (update.aiCostUsd !== undefined) {
    updateData.ai_cost_usd = update.aiCostUsd
  }
  if (update.aiResponseTimeMs !== undefined) {
    updateData.ai_response_time_ms = update.aiResponseTimeMs
  }
  if (update.aiFallbackUsed !== undefined) {
    updateData.ai_fallback_used = update.aiFallbackUsed
  }
  if (update.analysisId !== undefined) {
    updateData.analysis_id = update.analysisId
  }
  if (update.topCountry !== undefined) {
    updateData.top_country = update.topCountry
  }
  if (update.topCountryPercentage !== undefined) {
    updateData.top_country_percentage = update.topCountryPercentage
  }
  if (update.countriesOfInterest !== undefined) {
    updateData.countries_of_interest = update.countriesOfInterest
  }

  const { error } = await supabase
    .from('analysis_sessions')
    .update(updateData)
    .eq('id', sessionId)

  if (error) {
    console.error('[Session] Failed to update session:', error)
  }
}

/**
 * Update session with conversion data
 */
export async function updateConversion(
  sessionId: string,
  update: ConversionUpdate
): Promise<void> {
  const supabase = createAdminClient()

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (update.teaserViewedAt !== undefined) {
    updateData.teaser_viewed_at = update.teaserViewedAt
  }
  if (update.checkoutStartedAt !== undefined) {
    updateData.checkout_started_at = update.checkoutStartedAt
  }
  if (update.convertedToPaid !== undefined) {
    updateData.converted_to_paid = update.convertedToPaid
  }
  if (update.paidAt !== undefined) {
    updateData.paid_at = update.paidAt
  }
  if (update.pricePaid !== undefined) {
    updateData.price_paid = update.pricePaid
  }
  if (update.discountCode !== undefined) {
    updateData.discount_code = update.discountCode
  }
  if (update.discountAmount !== undefined) {
    updateData.discount_amount = update.discountAmount
  }

  // Calculate total duration
  updateData.total_duration_ms = await calculateDuration(sessionId)

  const { error } = await supabase
    .from('analysis_sessions')
    .update(updateData)
    .eq('id', sessionId)

  if (error) {
    console.error('[Session] Failed to update conversion:', error)
  }
}

/**
 * Calculate total duration from start to now
 */
async function calculateDuration(sessionId: string): Promise<number | null> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('analysis_sessions')
    .select('started_at')
    .eq('id', sessionId)
    .single()

  if (!data?.started_at) {
    return null
  }

  return Date.now() - new Date(data.started_at).getTime()
}

/**
 * Find or create session by session cookie
 */
export async function findSessionBySessionId(
  sessionId: string
): Promise<string | null> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('analysis_sessions')
    .select('id')
    .eq('session_id', sessionId)
    .order('started_at', { ascending: false })
    .limit(1)
    .single()

  return data?.id || null
}

// ============================================
// REVENUE TRACKING
// ============================================

/**
 * Record a sale in revenue_daily
 */
export async function recordRevenue(
  product: 'analysis' | 'pro' | 'ebook',
  amount: number,
  isRefund = false
): Promise<void> {
  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  await supabase.rpc('update_revenue_daily', {
    p_date: today,
    p_product: product,
    p_amount: amount,
    p_is_refund: isRefund,
  })
}

// ============================================
// COST TRACKING
// ============================================

/**
 * Record a cost in costs_daily
 */
export async function recordCost(
  costType: 'claude' | 'openai' | 'gemini' | 'stripe' | 'email',
  amount: number
): Promise<void> {
  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  await supabase.rpc('update_costs_daily', {
    p_date: today,
    p_cost_type: costType,
    p_amount: amount,
  })
}

// ============================================
// FUNNEL TRACKING
// ============================================

/**
 * Increment a funnel step counter
 */
export async function incrementFunnelStep(
  step: string,
  deviceType?: string
): Promise<void> {
  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  // Ensure row exists
  await supabase
    .from('funnel_daily')
    .upsert({ date: today }, { onConflict: 'date' })

  // Build update
  const validSteps = [
    'landing_views',
    'analysis_started',
    'pre_analysis_completed',
    'questions_halfway',
    'questions_completed',
    'teaser_viewed',
    'checkout_started',
    'checkout_completed',
    'pdf_downloaded',
    'abandoned_at_welcome',
    'abandoned_at_pre_analysis',
    'abandoned_at_questions',
    'abandoned_at_teaser',
    'abandoned_at_checkout',
  ]

  if (!validSteps.includes(step)) {
    console.warn(`[Funnel] Invalid step: ${step}`)
    return
  }

  // Raw SQL update for incrementing
  const { error } = await supabase.rpc('increment_funnel_step', {
    p_date: today,
    p_step: step,
    p_device: deviceType || 'desktop',
  })

  if (error) {
    console.error('[Funnel] Failed to increment step:', error)
  }
}

// ============================================
// PAGE VIEW TRACKING
// ============================================

/**
 * Record a page view
 */
export async function recordPageView(data: {
  path: string
  sessionId?: string
  ipHash?: string
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  deviceType?: string
  countryCode?: string
  timeOnPageMs?: number
  scrollDepth?: number
}): Promise<void> {
  const supabase = createAdminClient()

  const { error } = await supabase.from('page_views').insert({
    path: data.path,
    session_id: data.sessionId,
    ip_hash: data.ipHash,
    referrer: data.referrer?.substring(0, 500),
    utm_source: data.utmSource,
    utm_medium: data.utmMedium,
    utm_campaign: data.utmCampaign,
    device_type: data.deviceType,
    country_code: data.countryCode,
    time_on_page_ms: data.timeOnPageMs,
    scroll_depth: data.scrollDepth,
  })

  if (error) {
    console.error('[PageView] Failed to record:', error)
  }
}

// ============================================
// DEVICE DETECTION
// ============================================

/**
 * Parse user agent to extract device info
 */
export function parseUserAgent(userAgent: string): {
  deviceType: 'mobile' | 'tablet' | 'desktop'
  browser: string
  os: string
} {
  const ua = userAgent.toLowerCase()

  // Device Type
  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop'
  if (ua.includes('mobile') || ua.includes('android')) {
    deviceType = 'mobile'
  } else if (ua.includes('ipad') || ua.includes('tablet')) {
    deviceType = 'tablet'
  }

  // Browser
  let browser = 'other'
  if (ua.includes('chrome') && !ua.includes('edge')) {
    browser = 'chrome'
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'safari'
  } else if (ua.includes('firefox')) {
    browser = 'firefox'
  } else if (ua.includes('edge')) {
    browser = 'edge'
  }

  // OS
  let os = 'other'
  if (ua.includes('windows')) {
    os = 'windows'
  } else if (ua.includes('macintosh') || ua.includes('mac os')) {
    os = 'macos'
  } else if (ua.includes('iphone') || ua.includes('ipad')) {
    os = 'ios'
  } else if (ua.includes('android')) {
    os = 'android'
  } else if (ua.includes('linux')) {
    os = 'linux'
  }

  return { deviceType, browser, os }
}

/**
 * Parse UTM parameters from URL
 */
export function parseUtmParams(url: string): {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
} {
  try {
    const urlObj = new URL(url)
    return {
      utmSource: urlObj.searchParams.get('utm_source') || undefined,
      utmMedium: urlObj.searchParams.get('utm_medium') || undefined,
      utmCampaign: urlObj.searchParams.get('utm_campaign') || undefined,
      utmTerm: urlObj.searchParams.get('utm_term') || undefined,
      utmContent: urlObj.searchParams.get('utm_content') || undefined,
    }
  } catch {
    return {}
  }
}

