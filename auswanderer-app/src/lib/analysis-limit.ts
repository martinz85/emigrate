/**
 * Analysis Limit Helper
 * Story 8.5: Tägliches Analyse-Limit für PRO-User
 * 
 * Checks and enforces daily analysis limits for PRO users.
 */

import { SupabaseClient } from '@supabase/supabase-js'

// Default limit if not configured
const DEFAULT_PRO_LIMIT = 5

interface AnalysisLimitResult {
  allowed: boolean
  remaining: number
  limit: number
  usedToday: number
  resetAt: string // ISO timestamp for next reset (midnight Berlin)
  isPro: boolean
}

/**
 * Check if user can perform an analysis and get remaining count
 */
export async function checkAnalysisLimit(
  supabase: SupabaseClient,
  userId: string
): Promise<AnalysisLimitResult> {
  // Get user profile to check PRO status and limit override
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status, analysis_limit_override')
    .eq('id', userId)
    .single()

  const isPro = profile?.subscription_tier === 'pro' && 
    (profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing')

  // FREE users have no daily limit (they pay per analysis)
  if (!isPro) {
    return {
      allowed: true,
      remaining: -1, // -1 means unlimited (for free users, limited by payment)
      limit: -1,
      usedToday: 0,
      resetAt: getNextMidnight(),
      isPro: false,
    }
  }

  // Get global limit from settings
  const { data: settings } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'pro_daily_analysis_limit')
    .single()

  const globalLimit = settings?.value ? parseInt(settings.value, 10) : DEFAULT_PRO_LIMIT

  // Use user override if set, otherwise use global limit
  // Note: profile might not have analysis_limit_override yet (migration pending)
  const profileData = profile as typeof profile & { analysis_limit_override?: number | null }
  const userLimit = profileData?.analysis_limit_override !== null && profileData?.analysis_limit_override !== undefined
    ? profileData.analysis_limit_override
    : globalLimit

  // 0 means unlimited
  if (userLimit === 0) {
    return {
      allowed: true,
      remaining: -1,
      limit: 0,
      usedToday: 0,
      resetAt: getNextMidnight(),
      isPro: true,
    }
  }

  // Get today's count
  const today = new Date().toISOString().split('T')[0]
  const { data: countData } = await supabase
    .from('user_analysis_counts')
    .select('count')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  const usedToday = countData?.count || 0
  const remaining = Math.max(0, userLimit - usedToday)

  return {
    allowed: remaining > 0,
    remaining,
    limit: userLimit,
    usedToday,
    resetAt: getNextMidnight(),
    isPro: true,
  }
}

/**
 * Increment user's daily analysis count
 */
export async function incrementAnalysisCount(
  supabase: SupabaseClient,
  userId: string
): Promise<{ success: boolean; newCount: number }> {
  const today = new Date().toISOString().split('T')[0]

  // Upsert: increment if exists, insert with count=1 if not
  const { data, error } = await supabase
    .from('user_analysis_counts')
    .upsert(
      {
        user_id: userId,
        date: today,
        count: 1,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,date',
        ignoreDuplicates: false,
      }
    )
    .select('count')
    .single()

  if (error) {
    // If upsert failed, try to increment existing
    const { data: updated, error: updateError } = await supabase
      .rpc('increment_analysis_count', { p_user_id: userId, p_date: today })

    if (updateError) {
      console.error('Failed to increment analysis count:', updateError)
      return { success: false, newCount: 0 }
    }

    return { success: true, newCount: updated || 1 }
  }

  return { success: true, newCount: data?.count || 1 }
}

/**
 * Get next midnight in Europe/Berlin timezone
 */
function getNextMidnight(): string {
  const now = new Date()
  
  // Convert to Berlin time
  const berlinTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }))
  
  // Set to next midnight
  const nextMidnight = new Date(berlinTime)
  nextMidnight.setDate(nextMidnight.getDate() + 1)
  nextMidnight.setHours(0, 0, 0, 0)
  
  // Convert back to UTC ISO string
  // This is approximate - for exact timezone handling use date-fns-tz
  const offset = now.getTimezoneOffset()
  const berlinOffset = -60 // CET is UTC+1 (simplified, doesn't account for DST)
  const diff = (berlinOffset - offset) * 60 * 1000
  
  return new Date(nextMidnight.getTime() - diff).toISOString()
}

/**
 * Format remaining time until reset
 */
export function formatTimeUntilReset(resetAt: string): string {
  const now = new Date()
  const reset = new Date(resetAt)
  const diffMs = reset.getTime() - now.getTime()
  
  if (diffMs <= 0) return 'Jetzt'
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h ${minutes}min`
  }
  return `${minutes} Minuten`
}

