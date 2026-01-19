/**
 * Rate Limiting & Cost Control Utilities
 *
 * Manages:
 * - IP-based rate limits
 * - Session-based rate limits
 * - Global daily limits
 * - Budget tracking
 */

import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'

// ============================================
// TYPES
// ============================================

export interface RateLimitResult {
  allowed: boolean
  reason?: 'ip_limit' | 'session_limit' | 'global_limit' | 'budget_exceeded'
  currentCount: number
  limit: number
  remaining: number
  resetAt: Date
}

export interface UsageStats {
  inputTokens: number
  outputTokens: number
  totalTokens: number
  costUsd: number
  model: string
  requestId?: string
}

export interface Settings {
  rateLimitIpDaily: number
  rateLimitSessionTotal: number
  rateLimitGlobalDaily: number
  budgetDailyUsd: number
  budgetWarningPercent: number
  claudeCostPer1kInput: number
  claudeCostPer1kOutput: number
}

// ============================================
// HASH UTILITIES
// ============================================

/**
 * Hash an IP address for privacy (DSGVO compliance)
 * Uses daily salt so hashes change daily
 */
export function hashIP(ip: string): string {
  const salt = process.env.AUDIT_SALT
  if (!salt) {
    console.error('[Security] AUDIT_SALT environment variable is not set! IP hashing is compromised.')
    // In production, throw to prevent weak hashing
    if (process.env.NODE_ENV === 'production') {
      throw new Error('AUDIT_SALT must be configured for DSGVO-compliant IP hashing')
    }
  }
  const dailySalt = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  return crypto
    .createHash('sha256')
    .update(ip + (salt || 'dev-fallback-salt') + dailySalt)
    .digest('hex')
    .substring(0, 32)
}

/**
 * Get client IP from request headers
 * Uses multiple fallbacks for robustness
 */
export function getClientIP(headers: Headers): string {
  // Check common headers for real IP (behind proxies)
  // Priority order: cf-connecting-ip (Cloudflare) > x-forwarded-for > x-real-ip
  
  // Cloudflare provides the most reliable IP
  const cfIP = headers.get('cf-connecting-ip')
  if (cfIP && isValidIP(cfIP)) {
    return cfIP.trim()
  }
  
  // Standard proxy header (can contain multiple IPs)
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    const firstIP = forwarded.split(',')[0].trim()
    if (isValidIP(firstIP)) {
      return firstIP
    }
  }
  
  // Nginx real IP
  const realIP = headers.get('x-real-ip')
  if (realIP && isValidIP(realIP)) {
    return realIP.trim()
  }

  // Vercel provides true-client-ip
  const trueClientIP = headers.get('true-client-ip')
  if (trueClientIP && isValidIP(trueClientIP)) {
    return trueClientIP.trim()
  }
  
  // Fallback - generate a unique identifier to prevent shared rate limits
  // This is less ideal but prevents over-blocking multiple users
  console.warn('[RateLimit] Could not determine client IP, using session-based fallback')
  return `no-ip-${Date.now()}`
}

/**
 * Basic IP validation (IPv4 or IPv6)
 */
function isValidIP(ip: string): boolean {
  if (!ip || ip === 'unknown' || ip === '::1' || ip === '127.0.0.1') {
    // Localhost IPs are valid but we might want to handle them differently
    return true
  }
  // Simple check: contains at least one dot (IPv4) or colon (IPv6)
  return ip.includes('.') || ip.includes(':')
}

// ============================================
// SETTINGS LOADER
// ============================================

let settingsCache: { data: Settings; cachedAt: number } | null = null
const SETTINGS_CACHE_TTL = 60 * 1000 // 1 minute

/**
 * Load system settings from database (with caching)
 */
export async function getSettings(): Promise<Settings> {
  // Check cache
  if (settingsCache && Date.now() - settingsCache.cachedAt < SETTINGS_CACHE_TTL) {
    return settingsCache.data
  }

  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('system_settings')
    .select('key, value')

  if (error) {
    console.error('[RateLimit] Failed to load settings:', error)
    // Return defaults
    return getDefaultSettings()
  }

  const settingsMap = new Map(data?.map(s => [s.key, s.value]) || [])

  const settings: Settings = {
    rateLimitIpDaily: (settingsMap.get('rate_limit_ip_daily') as any)?.limit ?? 3,
    rateLimitSessionTotal: (settingsMap.get('rate_limit_session_total') as any)?.limit ?? 5,
    rateLimitGlobalDaily: (settingsMap.get('rate_limit_global_daily') as any)?.limit ?? 100,
    budgetDailyUsd: (settingsMap.get('budget_daily_usd') as any)?.limit ?? 50,
    budgetWarningPercent: (settingsMap.get('budget_daily_usd') as any)?.warning_percent ?? 80,
    claudeCostPer1kInput: (settingsMap.get('claude_cost_per_1k_input') as any)?.cost ?? 0.003,
    claudeCostPer1kOutput: (settingsMap.get('claude_cost_per_1k_output') as any)?.cost ?? 0.015,
  }

  // Update cache
  settingsCache = { data: settings, cachedAt: Date.now() }

  return settings
}

function getDefaultSettings(): Settings {
  return {
    rateLimitIpDaily: 3,
    rateLimitSessionTotal: 5,
    rateLimitGlobalDaily: 100,
    budgetDailyUsd: 50,
    budgetWarningPercent: 80,
    claudeCostPer1kInput: 0.003,
    claudeCostPer1kOutput: 0.015,
  }
}

/**
 * Clear settings cache (call after admin updates settings)
 */
export function clearSettingsCache(): void {
  settingsCache = null
}

// ============================================
// RATE LIMIT CHECKING
// ============================================

/**
 * Check all rate limits for a request
 * Returns whether request is allowed and remaining quota
 */
export async function checkRateLimits(
  ipHash: string,
  sessionId: string | null
): Promise<RateLimitResult> {
  const supabase = createAdminClient()
  const settings = await getSettings()
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  // Check IP limit
  const { data: ipData } = await supabase
    .from('rate_limits')
    .select('count')
    .eq('identifier', `ip:${ipHash}`)
    .eq('date', new Date().toISOString().split('T')[0])
    .single()

  const ipCount = ipData?.count || 0
  if (ipCount >= settings.rateLimitIpDaily) {
    return {
      allowed: false,
      reason: 'ip_limit',
      currentCount: ipCount,
      limit: settings.rateLimitIpDaily,
      remaining: 0,
      resetAt: today,
    }
  }

  // Check session limit (if session exists)
  // Note: Session limits are cumulative across all days, so we aggregate all counts
  if (sessionId) {
    const { data: sessionData } = await supabase
      .from('rate_limits')
      .select('count')
      .eq('identifier', `session:${sessionId}`)

    // Sum all counts across all dates for this session
    const sessionCount = sessionData?.reduce((sum, row) => sum + (row.count || 0), 0) || 0
    if (sessionCount >= settings.rateLimitSessionTotal) {
      return {
        allowed: false,
        reason: 'session_limit',
        currentCount: sessionCount,
        limit: settings.rateLimitSessionTotal,
        remaining: 0,
        resetAt: today,
      }
    }
  }

  // Check global daily limit
  const { data: dailyData } = await supabase
    .from('daily_usage')
    .select('total_analyses, total_cost_usd')
    .eq('date', new Date().toISOString().split('T')[0])
    .single()

  const globalCount = dailyData?.total_analyses || 0
  if (globalCount >= settings.rateLimitGlobalDaily) {
    return {
      allowed: false,
      reason: 'global_limit',
      currentCount: globalCount,
      limit: settings.rateLimitGlobalDaily,
      remaining: 0,
      resetAt: today,
    }
  }

  // Check budget
  const dailyCost = Number(dailyData?.total_cost_usd || 0)
  if (dailyCost >= settings.budgetDailyUsd) {
    return {
      allowed: false,
      reason: 'budget_exceeded',
      currentCount: Math.round(dailyCost * 100), // cents
      limit: Math.round(settings.budgetDailyUsd * 100),
      remaining: 0,
      resetAt: today,
    }
  }

  // All checks passed
  return {
    allowed: true,
    currentCount: ipCount,
    limit: settings.rateLimitIpDaily,
    remaining: settings.rateLimitIpDaily - ipCount - 1,
    resetAt: today,
  }
}

// ============================================
// RATE LIMIT INCREMENTING
// ============================================

/**
 * Increment rate limit counters after an analysis
 */
export async function incrementRateLimits(
  ipHash: string,
  sessionId: string | null,
  usage: UsageStats
): Promise<void> {
  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  // Increment IP counter
  await supabase.rpc('increment_rate_limit', {
    p_identifier: `ip:${ipHash}`,
    p_identifier_type: 'ip',
  })

  // Increment session counter (if session exists)
  if (sessionId) {
    await supabase.rpc('increment_rate_limit', {
      p_identifier: `session:${sessionId}`,
      p_identifier_type: 'session',
    })
  }

  // Update daily usage aggregates using RPC for atomic increment
  // Note: upsert would overwrite values, RPC does proper increment
  const { error } = await supabase.rpc('increment_daily_usage', {
    p_date: today,
    p_input_tokens: usage.inputTokens,
    p_output_tokens: usage.outputTokens,
    p_cost: usage.costUsd,
  })

  if (error) {
    console.error('[RateLimit] Failed to increment daily usage:', error)
  }
}

// ============================================
// USAGE TRACKING
// ============================================

/**
 * Record usage statistics for an analysis
 */
export async function recordUsageStats(params: {
  analysisId: string
  sessionId?: string | null
  ipHash: string
  usage: UsageStats
  userAgent?: string
  referrer?: string
  stepReached?: string
  questionsAnswered?: number
  isCompleted?: boolean
}): Promise<void> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('usage_stats')
    .insert({
      analysis_id: params.analysisId,
      session_id: params.sessionId || null,
      ip_hash: params.ipHash,
      claude_input_tokens: params.usage.inputTokens,
      claude_output_tokens: params.usage.outputTokens,
      claude_total_tokens: params.usage.totalTokens,
      claude_cost_usd: params.usage.costUsd,
      claude_model: params.usage.model,
      claude_request_id: params.usage.requestId || null,
      user_agent: params.userAgent?.substring(0, 500) || null,
      referrer: params.referrer?.substring(0, 500) || null,
      step_reached: params.stepReached || 'result',
      questions_answered: params.questionsAnswered || 28,
      is_completed: params.isCompleted ?? true,
      completed_at: new Date().toISOString(),
    })

  if (error) {
    console.error('[Usage] Failed to record stats:', error)
  }
}

// ============================================
// COST CALCULATION
// ============================================

/**
 * Calculate Claude API cost from token usage
 */
export async function calculateCost(
  inputTokens: number,
  outputTokens: number
): Promise<number> {
  const settings = await getSettings()
  
  const inputCost = (inputTokens / 1000) * settings.claudeCostPer1kInput
  const outputCost = (outputTokens / 1000) * settings.claudeCostPer1kOutput
  
  return inputCost + outputCost
}

// ============================================
// BUDGET MONITORING
// ============================================

/**
 * Check if budget warning threshold is reached
 */
export async function checkBudgetWarning(): Promise<{
  warningReached: boolean
  currentSpend: number
  budget: number
  percentUsed: number
}> {
  const supabase = createAdminClient()
  const settings = await getSettings()
  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('daily_usage')
    .select('total_cost_usd')
    .eq('date', today)
    .single()

  const currentSpend = Number(data?.total_cost_usd || 0)
  const percentUsed = (currentSpend / settings.budgetDailyUsd) * 100

  return {
    warningReached: percentUsed >= settings.budgetWarningPercent,
    currentSpend,
    budget: settings.budgetDailyUsd,
    percentUsed,
  }
}

