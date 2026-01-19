'use client'

import { useState, useEffect } from 'react'
import { AdminCard } from '../components'

interface DailyUsage {
  date: string
  total_analyses: number
  completed_analyses: number
  abandoned_analyses: number
  paid_conversions: number
  total_input_tokens: number
  total_output_tokens: number
  total_cost_usd: number
  unique_ips: number
  unique_sessions: number
}

interface RevenueDaily {
  date: string
  gross_revenue: number
  net_revenue: number
  refunds: number
  analysis_sales: number
  pro_subscriptions: number
  ebook_sales: number
  avg_order_value: number
}

interface CostsDaily {
  date: string
  total_ai_cost: number
  claude_cost: number
  openai_cost: number
  gemini_cost: number
  stripe_fees: number
  email_cost: number
  total_cost: number
  ai_requests: number
}

interface FunnelDaily {
  date: string
  landing_views: number
  analysis_started: number
  questions_completed: number
  teaser_viewed: number
  checkout_started: number
  checkout_completed: number
  overall_conversion_rate: number
}

interface SessionStats {
  avgDurationMs: number
  avgQuestionTimeMs: number
  completionRate: number
  mobilePercent: number
  topCountries: Array<{ country: string; count: number }>
  topReferrers: Array<{ referrer: string; count: number }>
}

interface AnalyticsData {
  today: {
    usage: DailyUsage | null
    revenue: RevenueDaily | null
    costs: CostsDaily | null
    funnel: FunnelDaily | null
  }
  last7Days: {
    usage: DailyUsage[]
    revenue: RevenueDaily[]
    costs: CostsDaily[]
    funnel: FunnelDaily[]
  }
  sessionStats: SessionStats | null
  limits: {
    budgetDaily: number
    globalDaily: number
  }
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'funnel' | 'revenue' | 'sessions'>('overview')

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics/extended')
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Laden fehlgeschlagen')
      }

      setData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    )
  }

  const today = data?.today
  const revenue = today?.revenue
  const costs = today?.costs
  const funnel = today?.funnel
  const usage = today?.usage
  const sessionStats = data?.sessionStats

  // Calculate P&L
  const grossRevenue = revenue?.gross_revenue || 0
  const totalCosts = costs?.total_cost || 0
  const netProfit = grossRevenue - totalCosts
  const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-600 mt-1">
            Detaillierte Analyse für SEO, Conversion und Business Performance
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-200">
        {(['overview', 'funnel', 'revenue', 'sessions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'overview' && '📊 Übersicht'}
            {tab === 'funnel' && '🎯 Funnel'}
            {tab === 'revenue' && '💰 Revenue & P&L'}
            {tab === 'sessions' && '👥 Sessions'}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <AdminCard
              title="Umsatz heute"
              value={`€${(grossRevenue / 100).toFixed(2)}`}
              subtitle={`${revenue?.analysis_sales || 0} Verkäufe`}
              icon="💰"
              trend={grossRevenue > 0 ? 'up' : 'neutral'}
            />
            <AdminCard
              title="AI Kosten heute"
              value={`$${(costs?.total_ai_cost || 0).toFixed(4)}`}
              subtitle={`${costs?.ai_requests || 0} Anfragen`}
              icon="🤖"
            />
            <AdminCard
              title="Conversion Rate"
              value={`${(funnel?.overall_conversion_rate || 0).toFixed(1)}%`}
              subtitle="Start → Kauf"
              icon="🎯"
              trend={(funnel?.overall_conversion_rate || 0) > 5 ? 'up' : 'neutral'}
            />
            <AdminCard
              title="Profit heute"
              value={`€${(netProfit / 100).toFixed(2)}`}
              subtitle={`${profitMargin.toFixed(0)}% Marge`}
              icon="📈"
              trend={netProfit > 0 ? 'up' : netProfit < 0 ? 'down' : 'neutral'}
            />
          </div>

          {/* Cost Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Kosten-Breakdown (heute)</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  ${(costs?.claude_cost || 0).toFixed(4)}
                </p>
                <p className="text-sm text-slate-600">Claude</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  ${(costs?.openai_cost || 0).toFixed(4)}
                </p>
                <p className="text-sm text-slate-600">OpenAI</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  ${(costs?.gemini_cost || 0).toFixed(4)}
                </p>
                <p className="text-sm text-slate-600">Gemini</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <p className="text-2xl font-bold text-amber-600">
                  €{((costs?.stripe_fees || 0) / 100).toFixed(2)}
                </p>
                <p className="text-sm text-slate-600">Stripe</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-600">
                  ${(costs?.email_cost || 0).toFixed(4)}
                </p>
                <p className="text-sm text-slate-600">Email</p>
              </div>
            </div>
          </div>

          {/* 7-Day Trend */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">7-Tage Trend</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-2 font-medium text-slate-600">Datum</th>
                    <th className="text-right py-3 px-2 font-medium text-slate-600">Analysen</th>
                    <th className="text-right py-3 px-2 font-medium text-slate-600">Umsatz</th>
                    <th className="text-right py-3 px-2 font-medium text-slate-600">AI Kosten</th>
                    <th className="text-right py-3 px-2 font-medium text-slate-600">Conversion</th>
                    <th className="text-right py-3 px-2 font-medium text-slate-600">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.last7Days?.usage?.map((day, i) => {
                    const rev = data.last7Days.revenue?.[i]
                    const cost = data.last7Days.costs?.[i]
                    const fun = data.last7Days.funnel?.[i]
                    const dayRevenue = rev?.gross_revenue || 0
                    const dayCost = cost?.total_cost || 0
                    const dayProfit = dayRevenue - dayCost

                    return (
                      <tr key={day.date} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-2">
                          {new Date(day.date).toLocaleDateString('de-DE', {
                            weekday: 'short',
                            day: '2-digit',
                            month: '2-digit',
                          })}
                        </td>
                        <td className="text-right py-3 px-2">{day.total_analyses}</td>
                        <td className="text-right py-3 px-2 font-medium">
                          €{(dayRevenue / 100).toFixed(2)}
                        </td>
                        <td className="text-right py-3 px-2 text-slate-500">
                          ${dayCost.toFixed(4)}
                        </td>
                        <td className="text-right py-3 px-2">
                          {(fun?.overall_conversion_rate || 0).toFixed(1)}%
                        </td>
                        <td className={`text-right py-3 px-2 font-medium ${
                          dayProfit > 0 ? 'text-emerald-600' : dayProfit < 0 ? 'text-red-600' : ''
                        }`}>
                          €{(dayProfit / 100).toFixed(2)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Funnel Tab */}
      {activeTab === 'funnel' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-6">Conversion Funnel (heute)</h2>

            <div className="space-y-4">
              {[
                { label: 'Landing Views', value: funnel?.landing_views || 0, percent: 100 },
                { label: 'Analyse gestartet', value: funnel?.analysis_started || 0, percent: funnel ? (funnel.analysis_started / (funnel.landing_views || 1)) * 100 : 0 },
                { label: 'Fragen abgeschlossen', value: funnel?.questions_completed || 0, percent: funnel ? (funnel.questions_completed / (funnel.landing_views || 1)) * 100 : 0 },
                { label: 'Teaser gesehen', value: funnel?.teaser_viewed || 0, percent: funnel ? (funnel.teaser_viewed / (funnel.landing_views || 1)) * 100 : 0 },
                { label: 'Checkout gestartet', value: funnel?.checkout_started || 0, percent: funnel ? (funnel.checkout_started / (funnel.landing_views || 1)) * 100 : 0 },
                { label: 'Kauf abgeschlossen', value: funnel?.checkout_completed || 0, percent: funnel ? (funnel.checkout_completed / (funnel.landing_views || 1)) * 100 : 0 },
              ].map((step, i) => (
                <div key={step.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{step.label}</span>
                    <span className="text-slate-500">
                      {step.value} ({step.percent.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-8 bg-slate-100 rounded-lg overflow-hidden">
                    <div
                      className={`h-full rounded-lg transition-all ${
                        i === 0 ? 'bg-slate-400' :
                        i === 5 ? 'bg-emerald-500' :
                        'bg-primary-400'
                      }`}
                      style={{ width: `${Math.max(step.percent, 2)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Drop-off Analysis */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h3 className="font-medium text-slate-900 mb-4">Drop-off Analyse</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-xl font-bold text-red-600">
                    {funnel ? ((funnel.landing_views - funnel.analysis_started) / (funnel.landing_views || 1) * 100).toFixed(0) : 0}%
                  </p>
                  <p className="text-xs text-slate-600">Landing → Start</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <p className="text-xl font-bold text-amber-600">
                    {funnel ? ((funnel.analysis_started - funnel.questions_completed) / (funnel.analysis_started || 1) * 100).toFixed(0) : 0}%
                  </p>
                  <p className="text-xs text-slate-600">Start → Fertig</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-xl font-bold text-orange-600">
                    {funnel ? ((funnel.teaser_viewed - funnel.checkout_started) / (funnel.teaser_viewed || 1) * 100).toFixed(0) : 0}%
                  </p>
                  <p className="text-xs text-slate-600">Teaser → Checkout</p>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <p className="text-xl font-bold text-emerald-600">
                    {funnel ? ((funnel.checkout_started - funnel.checkout_completed) / (funnel.checkout_started || 1) * 100).toFixed(0) : 0}%
                  </p>
                  <p className="text-xs text-slate-600">Checkout → Paid</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          {/* P&L Summary */}
          <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">P&L Heute</h2>
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-3xl font-bold text-emerald-600">
                  €{(grossRevenue / 100).toFixed(2)}
                </p>
                <p className="text-sm text-slate-600">Brutto-Umsatz</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-500">
                  -€{(totalCosts / 100).toFixed(2)}
                </p>
                <p className="text-sm text-slate-600">Kosten</p>
              </div>
              <div>
                <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  €{(netProfit / 100).toFixed(2)}
                </p>
                <p className="text-sm text-slate-600">Netto-Profit ({profitMargin.toFixed(0)}%)</p>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Umsatz nach Produkt</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-primary-50 rounded-lg">
                <p className="text-2xl font-bold text-primary-600">
                  €{((revenue?.analysis_revenue || 0) / 100).toFixed(2)}
                </p>
                <p className="text-sm text-slate-600">Analyse ({revenue?.analysis_sales || 0}×)</p>
              </div>
              <div className="p-4 bg-secondary-50 rounded-lg">
                <p className="text-2xl font-bold text-secondary-600">
                  €{((revenue?.pro_revenue || 0) / 100).toFixed(2)}
                </p>
                <p className="text-sm text-slate-600">PRO Abo ({revenue?.pro_subscriptions || 0}×)</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg">
                <p className="text-2xl font-bold text-amber-600">
                  €{((revenue?.ebook_revenue || 0) / 100).toFixed(2)}
                </p>
                <p className="text-sm text-slate-600">E-Books ({revenue?.ebook_sales || 0}×)</p>
              </div>
            </div>
          </div>

          {/* 7-Day Revenue Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">7-Tage Umsatz</h2>
            <div className="h-48 flex items-end gap-2">
              {data?.last7Days?.revenue?.map((day) => {
                const maxRevenue = Math.max(...(data.last7Days.revenue?.map(d => d.gross_revenue) || [1]))
                const height = maxRevenue > 0 ? (day.gross_revenue / maxRevenue) * 100 : 0

                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-emerald-500 rounded-t"
                      style={{ height: `${Math.max(height, 5)}%` }}
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      {new Date(day.date).toLocaleDateString('de-DE', { weekday: 'short' })}
                    </p>
                    <p className="text-xs font-medium">€{(day.gross_revenue / 100).toFixed(0)}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          {/* Session Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <AdminCard
              title="Ø Session-Dauer"
              value={formatDuration(sessionStats?.avgDurationMs || 0)}
              icon="⏱️"
            />
            <AdminCard
              title="Ø Zeit/Frage"
              value={`${((sessionStats?.avgQuestionTimeMs || 0) / 1000).toFixed(1)}s`}
              icon="❓"
            />
            <AdminCard
              title="Completion Rate"
              value={`${(sessionStats?.completionRate || 0).toFixed(1)}%`}
              icon="✅"
            />
            <AdminCard
              title="Mobile Anteil"
              value={`${(sessionStats?.mobilePercent || 0).toFixed(0)}%`}
              icon="📱"
            />
          </div>

          {/* Top Sources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Countries */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Top Länder</h2>
              <div className="space-y-3">
                {(sessionStats?.topCountries || []).slice(0, 5).map((item) => (
                  <div key={item.country} className="flex items-center justify-between">
                    <span className="text-slate-700">{item.country}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
                {(!sessionStats?.topCountries || sessionStats.topCountries.length === 0) && (
                  <p className="text-slate-500 text-center py-4">Keine Daten</p>
                )}
              </div>
            </div>

            {/* Top Referrers */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Top Referrer</h2>
              <div className="space-y-3">
                {(sessionStats?.topReferrers || []).slice(0, 5).map((item) => (
                  <div key={item.referrer} className="flex items-center justify-between">
                    <span className="text-slate-700 truncate max-w-[200px]">{item.referrer || 'Direct'}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
                {(!sessionStats?.topReferrers || sessionStats.topReferrers.length === 0) && (
                  <p className="text-slate-500 text-center py-4">Keine Daten</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
