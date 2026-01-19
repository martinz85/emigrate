/**
 * Admin API: Extended Analytics
 *
 * Fetches all analytics data for the enhanced dashboard
 */

import { NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { getSettings } from '@/lib/rate-limit'

export async function GET() {
  // Verify admin access
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const { data: adminUser } = await supabaseAuth
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminUser) {
    return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 })
  }

  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]

  try {
    // Fetch today's data
    const [
      { data: usageToday },
      { data: revenueToday },
      { data: costsToday },
      { data: funnelToday },
    ] = await Promise.all([
      supabase.from('daily_usage').select('*').eq('date', today).single(),
      supabase.from('revenue_daily').select('*').eq('date', today).single(),
      supabase.from('costs_daily').select('*').eq('date', today).single(),
      supabase.from('funnel_daily').select('*').eq('date', today).single(),
    ])

    // Fetch 7-day data
    const [
      { data: usageLast7 },
      { data: revenueLast7 },
      { data: costsLast7 },
      { data: funnelLast7 },
    ] = await Promise.all([
      supabase.from('daily_usage').select('*').gte('date', sevenDaysAgoStr).order('date', { ascending: false }),
      supabase.from('revenue_daily').select('*').gte('date', sevenDaysAgoStr).order('date', { ascending: false }),
      supabase.from('costs_daily').select('*').gte('date', sevenDaysAgoStr).order('date', { ascending: false }),
      supabase.from('funnel_daily').select('*').gte('date', sevenDaysAgoStr).order('date', { ascending: false }),
    ])

    // Fetch session stats (last 7 days)
    const { data: sessions } = await supabase
      .from('analysis_sessions')
      .select('total_duration_ms, avg_question_time_ms, is_completed, device_type, country_code, referrer')
      .gte('started_at', sevenDaysAgo.toISOString())

    // Calculate session stats
    let sessionStats = null
    if (sessions && sessions.length > 0) {
      const completedSessions = sessions.filter(s => s.is_completed)
      const mobileSessions = sessions.filter(s => s.device_type === 'mobile')

      // Top countries
      const countryMap = new Map<string, number>()
      sessions.forEach(s => {
        if (s.country_code) {
          countryMap.set(s.country_code, (countryMap.get(s.country_code) || 0) + 1)
        }
      })
      const topCountries = Array.from(countryMap.entries())
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      // Top referrers
      const referrerMap = new Map<string, number>()
      sessions.forEach(s => {
        const referrer = s.referrer ? new URL(s.referrer).hostname : 'Direct'
        referrerMap.set(referrer, (referrerMap.get(referrer) || 0) + 1)
      })
      const topReferrers = Array.from(referrerMap.entries())
        .map(([referrer, count]) => ({ referrer, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      // Calculate averages
      const durationsWithValue = sessions.filter(s => s.total_duration_ms).map(s => s.total_duration_ms!)
      const questionTimesWithValue = sessions.filter(s => s.avg_question_time_ms).map(s => s.avg_question_time_ms!)

      sessionStats = {
        avgDurationMs: durationsWithValue.length > 0
          ? Math.round(durationsWithValue.reduce((a, b) => a + b, 0) / durationsWithValue.length)
          : 0,
        avgQuestionTimeMs: questionTimesWithValue.length > 0
          ? Math.round(questionTimesWithValue.reduce((a, b) => a + b, 0) / questionTimesWithValue.length)
          : 0,
        completionRate: (completedSessions.length / sessions.length) * 100,
        mobilePercent: (mobileSessions.length / sessions.length) * 100,
        topCountries,
        topReferrers,
      }
    }

    // Get limits
    const settings = await getSettings()

    return NextResponse.json({
      today: {
        usage: usageToday || createEmptyUsage(today),
        revenue: revenueToday || createEmptyRevenue(today),
        costs: costsToday || createEmptyCosts(today),
        funnel: funnelToday || createEmptyFunnel(today),
      },
      last7Days: {
        usage: usageLast7 || [],
        revenue: revenueLast7 || [],
        costs: costsLast7 || [],
        funnel: funnelLast7 || [],
      },
      sessionStats,
      limits: {
        budgetDaily: settings.budgetDailyUsd,
        globalDaily: settings.rateLimitGlobalDaily,
      },
    })
  } catch (error) {
    console.error('Extended analytics error:', error)
    return NextResponse.json({ error: 'Laden fehlgeschlagen' }, { status: 500 })
  }
}

function createEmptyUsage(date: string) {
  return {
    date,
    total_analyses: 0,
    completed_analyses: 0,
    abandoned_analyses: 0,
    paid_conversions: 0,
    total_input_tokens: 0,
    total_output_tokens: 0,
    total_cost_usd: 0,
    unique_ips: 0,
    unique_sessions: 0,
  }
}

function createEmptyRevenue(date: string) {
  return {
    date,
    gross_revenue: 0,
    net_revenue: 0,
    refunds: 0,
    analysis_sales: 0,
    pro_subscriptions: 0,
    ebook_sales: 0,
    analysis_revenue: 0,
    pro_revenue: 0,
    ebook_revenue: 0,
    avg_order_value: 0,
  }
}

function createEmptyCosts(date: string) {
  return {
    date,
    total_ai_cost: 0,
    claude_cost: 0,
    openai_cost: 0,
    gemini_cost: 0,
    stripe_fees: 0,
    email_cost: 0,
    total_cost: 0,
    ai_requests: 0,
  }
}

function createEmptyFunnel(date: string) {
  return {
    date,
    landing_views: 0,
    analysis_started: 0,
    questions_completed: 0,
    teaser_viewed: 0,
    checkout_started: 0,
    checkout_completed: 0,
    overall_conversion_rate: 0,
  }
}

