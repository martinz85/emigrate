'use client'

import { useState, useEffect } from 'react'
import { AdminCard } from '../components'

interface Setting {
  key: string
  value: Record<string, number>
  description: string
  updated_at: string
}

interface SettingConfig {
  key: string
  label: string
  description: string
  fields: {
    name: string
    label: string
    type: 'number' | 'percent'
    min?: number
    max?: number
    step?: number
    suffix?: string
  }[]
}

const SETTINGS_CONFIG: SettingConfig[] = [
  // Story 8.5: PRO Daily Analysis Limit
  {
    key: 'pro_daily_analysis_limit',
    label: '👑 PRO Analyse-Limit (täglich)',
    description: 'Maximale Analysen pro Tag für PRO-User (0 = unbegrenzt)',
    fields: [
      { name: 'value', label: 'Limit', type: 'number', min: 0, max: 100, suffix: 'Analysen/Tag' },
    ],
  },
  {
    key: 'rate_limit_ip_daily',
    label: 'IP Rate Limit (täglich)',
    description: 'Maximale Analysen pro IP-Adresse pro Tag',
    fields: [
      { name: 'limit', label: 'Limit', type: 'number', min: 1, max: 100, suffix: 'Analysen/Tag' },
    ],
  },
  {
    key: 'rate_limit_session_total',
    label: 'Session Rate Limit',
    description: 'Maximale Analysen pro Browser-Session (gesamt)',
    fields: [
      { name: 'limit', label: 'Limit', type: 'number', min: 1, max: 100, suffix: 'Analysen/Session' },
    ],
  },
  {
    key: 'rate_limit_global_daily',
    label: 'Globales Tageslimit',
    description: 'Maximale Gesamtanalysen pro Tag (alle User)',
    fields: [
      { name: 'limit', label: 'Limit', type: 'number', min: 10, max: 10000, suffix: 'Analysen/Tag' },
    ],
  },
  {
    key: 'budget_daily_usd',
    label: 'Tagesbudget (USD)',
    description: 'Maximales Claude API Budget pro Tag',
    fields: [
      { name: 'limit', label: 'Budget', type: 'number', min: 1, max: 1000, step: 0.01, suffix: 'USD/Tag' },
      { name: 'warning_percent', label: 'Warnung bei', type: 'percent', min: 50, max: 99, suffix: '%' },
    ],
  },
  {
    key: 'budget_monthly_usd',
    label: 'Monatsbudget (USD)',
    description: 'Maximales Claude API Budget pro Monat',
    fields: [
      { name: 'limit', label: 'Budget', type: 'number', min: 10, max: 10000, step: 0.01, suffix: 'USD/Monat' },
      { name: 'warning_percent', label: 'Warnung bei', type: 'percent', min: 50, max: 99, suffix: '%' },
    ],
  },
  {
    key: 'claude_cost_per_1k_input',
    label: 'Claude Input Kosten',
    description: 'Kosten pro 1.000 Input-Tokens (Claude 3.5 Sonnet)',
    fields: [
      { name: 'cost', label: 'Kosten', type: 'number', min: 0.001, max: 1, step: 0.001, suffix: 'USD/1K' },
    ],
  },
  {
    key: 'claude_cost_per_1k_output',
    label: 'Claude Output Kosten',
    description: 'Kosten pro 1.000 Output-Tokens (Claude 3.5 Sonnet)',
    fields: [
      { name: 'cost', label: 'Kosten', type: 'number', min: 0.001, max: 1, step: 0.001, suffix: 'USD/1K' },
    ],
  },
]

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, Setting>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editedValues, setEditedValues] = useState<Record<string, Record<string, number>>>({})

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Laden fehlgeschlagen')
      }

      const settingsMap: Record<string, Setting> = {}
      data.settings.forEach((s: Setting) => {
        settingsMap[s.key] = s
      })
      setSettings(settingsMap)

      // Initialize edited values
      const initial: Record<string, Record<string, number>> = {}
      data.settings.forEach((s: Setting) => {
        initial[s.key] = { ...s.value }
      })
      setEditedValues(initial)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (key: string) => {
    setIsSaving(key)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          value: editedValues[key],
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Speichern fehlgeschlagen')
      }

      setSuccess(`${key} gespeichert`)
      
      // Update local state
      setSettings(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          value: editedValues[key],
          updated_at: new Date().toISOString(),
        },
      }))

      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern')
    } finally {
      setIsSaving(null)
    }
  }

  const handleValueChange = (key: string, field: string, value: number) => {
    setEditedValues(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }))
  }

  const hasChanges = (key: string): boolean => {
    const original = settings[key]?.value || {}
    const edited = editedValues[key] || {}
    return JSON.stringify(original) !== JSON.stringify(edited)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System-Einstellungen</h1>
        <p className="text-slate-600 mt-1">
          Rate Limits, Budgets und API-Kosten konfigurieren
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminCard
          title="IP Limit"
          value={`${settings['rate_limit_ip_daily']?.value?.limit || 3}/Tag`}
          icon="🔒"
        />
        <AdminCard
          title="Session Limit"
          value={`${settings['rate_limit_session_total']?.value?.limit || 5} gesamt`}
          icon="📊"
        />
        <AdminCard
          title="Global Limit"
          value={`${settings['rate_limit_global_daily']?.value?.limit || 100}/Tag`}
          icon="🌐"
        />
      </div>

      {/* Settings Form */}
      <div className="grid gap-6">
        {SETTINGS_CONFIG.map((config) => {
          const currentValues = editedValues[config.key] || {}
          const isChanged = hasChanges(config.key)
          const saving = isSaving === config.key

          return (
            <div
              key={config.key}
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{config.label}</h3>
                  <p className="text-sm text-slate-500">{config.description}</p>
                </div>
                {isChanged && (
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                    Ungespeichert
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {config.fields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {field.label}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={currentValues[field.name] ?? 0}
                        onChange={(e) =>
                          handleValueChange(config.key, field.name, parseFloat(e.target.value) || 0)
                        }
                        min={field.min}
                        max={field.max}
                        step={field.step || 1}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      {field.suffix && (
                        <span className="text-sm text-slate-500 whitespace-nowrap">
                          {field.suffix}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => handleSave(config.key)}
                  disabled={!isChanged || saving}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isChanged
                      ? 'bg-primary-500 text-white hover:bg-primary-600'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Speichern...
                    </span>
                  ) : (
                    'Speichern'
                  )}
                </button>
              </div>

              {settings[config.key]?.updated_at && (
                <p className="mt-2 text-xs text-slate-400 text-right">
                  Zuletzt geändert: {new Date(settings[config.key].updated_at).toLocaleString('de-DE')}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Hinweise</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• IP-Limits basieren auf gehashten IPs (DSGVO-konform)</li>
          <li>• Session-Limits gelten pro Browser-Session (Cookie-basiert)</li>
          <li>• Globale Limits schützen vor Traffic-Spikes</li>
          <li>• Budget-Warnungen werden einmal täglich per E-Mail gesendet</li>
          <li>• Kosten basieren auf Claude 3.5 Sonnet Preisen (Stand 2025)</li>
        </ul>
      </div>
    </div>
  )
}

