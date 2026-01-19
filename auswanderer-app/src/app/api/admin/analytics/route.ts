import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { getSettings } from '@/lib/rate-limit'

/**
 * GET /api/admin/analytics
 * Fetch usage analytics and statistics
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const range = searchParams.get('range') || '7d'
  const days = range === '30d' ? 30 : 7

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
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startDateStr = startDate.toISOString().split('T')[0]

  try {
    // Fetch today's usage
    const { data: todayData } = await supabase
      .from('daily_usage')
      .select('*')
      .eq('date', today)
      .single()

    // Fetch last N days
    const { data: dailyData } = await supabase
      .from('daily_usage')
      .select('*')
      .gte('date', startDateStr)
      .order('date', { ascending: false })

    // Calculate 30-day summary
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: monthlyData } = await supabase
      .from('daily_usage')
      .select('total_analyses, total_cost_usd, paid_conversions')
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])

    const totalAnalyses = monthlyData?.reduce((sum, d) => sum + (d.total_analyses || 0), 0) || 0
    const totalCost = monthlyData?.reduce((sum, d) => sum + Number(d.total_cost_usd || 0), 0) || 0
    const totalConversions = monthlyData?.reduce((sum, d) => sum + (d.paid_conversions || 0), 0) || 0

    // Fetch recent usage stats (last 20)
    const { data: recentStats } = await supabase
      .from('usage_stats')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    // Get current limits
    const settings = await getSettings()

    return NextResponse.json({
      today: todayData || {
        date: today,
        total_analyses: 0,
        completed_analyses: 0,
        abandoned_analyses: 0,
        paid_conversions: 0,
        total_input_tokens: 0,
        total_output_tokens: 0,
        total_cost_usd: 0,
        unique_ips: 0,
        unique_sessions: 0,
      },
      last7Days: dailyData || [],
      last30Days: {
        totalAnalyses,
        totalCost,
        avgCostPerAnalysis: totalAnalyses > 0 ? totalCost / totalAnalyses : 0,
        conversionRate: totalAnalyses > 0 ? (totalConversions / totalAnalyses) * 100 : 0,
      },
      recentStats: recentStats || [],
      limits: {
        ipDaily: settings.rateLimitIpDaily,
        sessionTotal: settings.rateLimitSessionTotal,
        globalDaily: settings.rateLimitGlobalDaily,
        budgetDaily: settings.budgetDailyUsd,
      },
    })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json({ error: 'Laden fehlgeschlagen' }, { status: 500 })
  }
}

