'use client'

import { useState, useEffect } from 'react'

interface ModelUpdate {
  id: string
  update_type: 'new_model' | 'price_change' | 'deprecated'
  provider: string
  model_id: string
  suggested_data: Record<string, unknown>
  change_summary: string
  confidence: number
  checked_at: string
  status: string
}

interface CatalogCheck {
  id: string
  checked_at: string
  trigger_type: string
  status: string
  updates_found: number
  ai_cost_usd: number
}

const UPDATE_TYPE_LABELS = {
  new_model: { label: 'Neues Modell', icon: '➕', color: 'bg-green-100 text-green-700' },
  price_change: { label: 'Preisänderung', icon: '💰', color: 'bg-amber-100 text-amber-700' },
  deprecated: { label: 'Deprecated', icon: '⚠️', color: 'bg-red-100 text-red-700' },
}

export function ModelUpdatesWidget() {
  const [updates, setUpdates] = useState<ModelUpdate[]>([])
  const [lastCheck, setLastCheck] = useState<CatalogCheck | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/ai-catalog')
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Laden fehlgeschlagen')
      }

      setUpdates(data.pendingUpdates || [])
      setLastCheck(data.lastCheck || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden')
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualCheck = async () => {
    setIsChecking(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/ai-catalog/check', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Check fehlgeschlagen')
      }

      // Refresh data
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Check')
    } finally {
      setIsChecking(false)
    }
  }

  const handleApply = async (updateId: string) => {
    try {
      const res = await fetch('/api/admin/ai-catalog/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updateId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Anwenden fehlgeschlagen')
      }

      // Remove from list
      setUpdates((prev) => prev.filter((u) => u.id !== updateId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler')
    }
  }

  const handleDismiss = async (updateId: string) => {
    try {
      const res = await fetch('/api/admin/ai-catalog/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updateId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Ablehnen fehlgeschlagen')
      }

      // Remove from list
      setUpdates((prev) => prev.filter((u) => u.id !== updateId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler')
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Heute'
    if (diffDays === 1) return 'Gestern'
    if (diffDays < 7) return `vor ${diffDays} Tagen`

    return date.toLocaleDateString('de-DE')
  }

  const getNextCheckDate = () => {
    const now = new Date()
    const nextSunday = new Date(now)
    nextSunday.setDate(now.getDate() + ((7 - now.getDay()) % 7 || 7))
    nextSunday.setHours(3, 0, 0, 0)
    return nextSunday.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit' })
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="animate-pulse flex items-center gap-2">
          <div className="h-4 w-4 bg-slate-200 rounded" />
          <div className="h-4 w-32 bg-slate-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <h3 className="font-semibold text-slate-900">AI Modell-Updates</h3>
          {updates.length > 0 && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
              {updates.length} pending
            </span>
          )}
        </div>
        <button
          onClick={handleManualCheck}
          disabled={isChecking}
          className="px-3 py-1.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-50 flex items-center gap-2"
        >
          {isChecking ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Prüfe...
            </>
          ) : (
            'Jetzt prüfen'
          )}
        </button>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-slate-50 text-sm text-slate-600 flex items-center justify-between">
        <span>
          Letzter Check:{' '}
          {lastCheck ? (
            <>
              {formatDate(lastCheck.checked_at)}
              {lastCheck.ai_cost_usd && (
                <span className="text-slate-400 ml-2">
                  (~${lastCheck.ai_cost_usd.toFixed(4)})
                </span>
              )}
            </>
          ) : (
            'Noch nie'
          )}
        </span>
        <span>Nächster Check: {getNextCheckDate()}</span>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {/* Updates List */}
      <div className="divide-y divide-slate-100">
        {updates.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <span className="text-3xl block mb-2">✅</span>
            Keine ausstehenden Updates
          </div>
        ) : (
          updates.map((update) => {
            const typeInfo = UPDATE_TYPE_LABELS[update.update_type]
            const suggestedData = update.suggested_data as Record<string, any>

            return (
              <div key={update.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className={`px-2 py-1 rounded text-sm ${typeInfo.color}`}>
                      {typeInfo.icon} {typeInfo.label}
                    </span>
                    <div>
                      <p className="font-medium text-slate-900">{update.model_id}</p>
                      <p className="text-sm text-slate-600">{update.change_summary}</p>
                      {suggestedData.inputCostPer1k && (
                        <p className="text-xs text-slate-400 mt-1">
                          Input: ${suggestedData.inputCostPer1k}/1K | Output: ${suggestedData.outputCostPer1k}/1K
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {Math.round(update.confidence * 100)}% sicher
                    </span>
                    <button
                      onClick={() => handleApply(update.id)}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                    >
                      Anwenden
                    </button>
                    <button
                      onClick={() => handleDismiss(update.id)}
                      className="px-3 py-1 bg-slate-100 text-slate-600 rounded text-sm hover:bg-slate-200"
                    >
                      Ablehnen
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

