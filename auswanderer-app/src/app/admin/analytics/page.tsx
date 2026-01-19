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

interface UsageStats {
  id: string
  created_at: string
  session_id: string
  ip_hash: string
  analysis_id: string
  step_reached: string
  questions_answered: number
  is_completed: boolean
  claude_input_tokens: number
  claude_output_tokens: number
  claude_total_tokens: number
  claude_cost_usd: number
  claude_model: string
  converted_to_paid: boolean
  user_agent: string
  referrer: string
}

interface AnalyticsData {
  today: DailyUsage | null
  last7Days: DailyUsage[]
  last30Days: {
    totalAnalyses: number
    totalCost: number
    avgCostPerAnalysis: number
    conversionRate: number
  }
  recentStats: UsageStats[]
  limits: {
    ipDaily: number
    sessionTotal: number
    globalDaily: number
    budgetDaily: number
  }
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/admin/analytics?range=${timeRange}`)
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
  const budgetUsed = today ? ((today.total_cost_usd / (data?.limits?.budgetDaily || 50)) * 100) : 0
  const globalUsed = today ? ((today.total_analyses / (data?.limits?.globalDaily || 100)) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Usage Analytics</h1>
          <p className="text-slate-600 mt-1">
            Claude API Nutzung, Kosten und Rate Limits
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === '7d'
                ? 'bg-primary-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            7 Tage
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === '30d'
                ? 'bg-primary-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            30 Tage
          </button>
        </div>
      </div>

      {/* Today's Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AdminCard
          title="Analysen heute"
          value={today?.total_analyses || 0}
          subtitle={`von ${data?.limits?.globalDaily || 100} (${globalUsed.toFixed(0)}%)`}
          icon="📊"
          trend={globalUsed > 80 ? 'warning' : 'neutral'}
        />
        <AdminCard
          title="Kosten heute"
          value={`$${(today?.total_cost_usd || 0).toFixed(4)}`}
          subtitle={`von $${data?.limits?.budgetDaily || 50} (${budgetUsed.toFixed(1)}%)`}
          icon="💰"
          trend={budgetUsed > 80 ? 'warning' : 'neutral'}
        />
        <AdminCard
          title="Unique IPs heute"
          value={today?.unique_ips || 0}
          subtitle="Verschiedene Besucher"
          icon="🌐"
        />
        <AdminCard
          title="Conversions heute"
          value={today?.paid_conversions || 0}
          subtitle="Zahlende Kunden"
          icon="💳"
          trend={today?.paid_conversions ? 'up' : 'neutral'}
        />
      </div>

      {/* Budget Progress */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Budget Status</h2>
        
        <div className="space-y-4">
          {/* Daily Budget */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600">Tagesbudget</span>
              <span className="font-medium">
                ${(today?.total_cost_usd || 0).toFixed(4)} / ${data?.limits?.budgetDaily || 50}
              </span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  budgetUsed > 80
                    ? 'bg-red-500'
                    : budgetUsed > 50
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(budgetUsed, 100)}%` }}
              />
            </div>
          </div>

          {/* Global Limit */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600">Globales Tageslimit</span>
              <span className="font-medium">
                {today?.total_analyses || 0} / {data?.limits?.globalDaily || 100}
              </span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  globalUsed > 80
                    ? 'bg-red-500'
                    : globalUsed > 50
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(globalUsed, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Daily Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">
          Tägliche Nutzung ({timeRange === '7d' ? 'letzte 7 Tage' : 'letzte 30 Tage'})
        </h2>

        {data?.last7Days && data.last7Days.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 font-medium text-slate-600">Datum</th>
                  <th className="text-right py-3 px-2 font-medium text-slate-600">Analysen</th>
                  <th className="text-right py-3 px-2 font-medium text-slate-600">Input Tokens</th>
                  <th className="text-right py-3 px-2 font-medium text-slate-600">Output Tokens</th>
                  <th className="text-right py-3 px-2 font-medium text-slate-600">Kosten</th>
                  <th className="text-right py-3 px-2 font-medium text-slate-600">Conversions</th>
                </tr>
              </thead>
              <tbody>
                {data.last7Days.map((day) => (
                  <tr key={day.date} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-2">
                      {new Date(day.date).toLocaleDateString('de-DE', {
                        weekday: 'short',
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </td>
                    <td className="text-right py-3 px-2">{day.total_analyses}</td>
                    <td className="text-right py-3 px-2 text-slate-500">
                      {(day.total_input_tokens / 1000).toFixed(1)}K
                    </td>
                    <td className="text-right py-3 px-2 text-slate-500">
                      {(day.total_output_tokens / 1000).toFixed(1)}K
                    </td>
                    <td className="text-right py-3 px-2 font-medium">
                      ${day.total_cost_usd.toFixed(4)}
                    </td>
                    <td className="text-right py-3 px-2">
                      {day.paid_conversions > 0 ? (
                        <span className="text-emerald-600 font-medium">
                          {day.paid_conversions}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500 text-center py-8">Keine Daten vorhanden</p>
        )}
      </div>

      {/* 30-Day Summary */}
      {data?.last30Days && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <AdminCard
            title="Analysen (30 Tage)"
            value={data.last30Days.totalAnalyses}
            icon="📈"
          />
          <AdminCard
            title="Kosten (30 Tage)"
            value={`$${data.last30Days.totalCost.toFixed(2)}`}
            icon="💵"
          />
          <AdminCard
            title="Ø Kosten/Analyse"
            value={`$${data.last30Days.avgCostPerAnalysis.toFixed(4)}`}
            icon="📊"
          />
          <AdminCard
            title="Conversion Rate"
            value={`${data.last30Days.conversionRate.toFixed(1)}%`}
            icon="🎯"
            trend={data.last30Days.conversionRate > 5 ? 'up' : 'neutral'}
          />
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Letzte Aktivitäten</h2>

        {data?.recentStats && data.recentStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 font-medium text-slate-600">Zeit</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-600">Status</th>
                  <th className="text-right py-3 px-2 font-medium text-slate-600">Tokens</th>
                  <th className="text-right py-3 px-2 font-medium text-slate-600">Kosten</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-600">IP Hash</th>
                </tr>
              </thead>
              <tbody>
                {data.recentStats.map((stat) => (
                  <tr key={stat.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-2 text-slate-500">
                      {new Date(stat.created_at).toLocaleTimeString('de-DE', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-2">
                      {stat.converted_to_paid ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600">
                          <span>💳</span> Bezahlt
                        </span>
                      ) : stat.is_completed ? (
                        <span className="inline-flex items-center gap-1 text-blue-600">
                          <span>✅</span> Abgeschlossen
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-600">
                          <span>⏸️</span> {stat.step_reached || 'In Progress'}
                        </span>
                      )}
                    </td>
                    <td className="text-right py-3 px-2 font-mono text-xs text-slate-500">
                      {stat.claude_total_tokens?.toLocaleString() || '-'}
                    </td>
                    <td className="text-right py-3 px-2 font-mono text-xs">
                      ${(stat.claude_cost_usd || 0).toFixed(4)}
                    </td>
                    <td className="py-3 px-2 font-mono text-xs text-slate-400">
                      {stat.ip_hash?.substring(0, 8)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500 text-center py-8">Keine Aktivitäten vorhanden</p>
        )}
      </div>

      {/* Cost Estimation */}
      <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-6">
        <h2 className="font-semibold text-slate-900 mb-4">💡 Kosten-Schätzung</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white/70 rounded-lg p-4">
            <p className="text-slate-600 mb-1">Bei aktueller Rate</p>
            <p className="text-xl font-bold text-slate-900">
              ${((today?.total_cost_usd || 0.03) * 30).toFixed(2)}/Monat
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Basierend auf heute ({today?.total_analyses || 1} Analysen)
            </p>
          </div>
          <div className="bg-white/70 rounded-lg p-4">
            <p className="text-slate-600 mb-1">Bei 100 Analysen/Tag</p>
            <p className="text-xl font-bold text-slate-900">
              ${(data?.last30Days?.avgCostPerAnalysis || 0.03) * 100 * 30}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              ~$3/Tag = ~$90/Monat
            </p>
          </div>
          <div className="bg-white/70 rounded-lg p-4">
            <p className="text-slate-600 mb-1">Break-Even</p>
            <p className="text-xl font-bold text-emerald-600">
              {Math.ceil(
                (data?.last30Days?.totalCost || 1) /
                  (19.99 * (data?.last30Days?.conversionRate || 1) / 100)
              )}{' '}
              Verkäufe
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Bei {(data?.last30Days?.conversionRate || 1).toFixed(1)}% Conversion
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

