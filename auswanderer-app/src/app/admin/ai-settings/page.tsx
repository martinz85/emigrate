'use client'

import { useState, useEffect } from 'react'
import { ModelUpdatesWidget } from './ModelUpdatesWidget'

interface ProviderConfig {
  id: string
  provider: 'claude' | 'openai' | 'gemini' | 'groq'
  model: string
  is_active: boolean
  priority: number
  is_catalog_agent: boolean  // Für Catalog Agent Funktion
  settings: {
    max_tokens?: number
    temperature?: number
  }
  has_api_key: boolean
  updated_at: string
}

interface AIModel {
  id: string
  provider: string
  name: string
  input_cost_per_1k: number
  output_cost_per_1k: number
  max_tokens: number
  is_latest: boolean
  is_deprecated: boolean
}

const PROVIDER_LABELS: Record<string, { name: string; icon: string; color: string }> = {
  claude: { name: 'Claude (Anthropic)', icon: '🟣', color: 'bg-purple-100 text-purple-700' },
  openai: { name: 'OpenAI', icon: '🟢', color: 'bg-green-100 text-green-700' },
  gemini: { name: 'Google Gemini', icon: '🔵', color: 'bg-blue-100 text-blue-700' },
  groq: { name: 'Groq (Ultra-Fast)', icon: '🟠', color: 'bg-orange-100 text-orange-700' },
}

export default function AdminAISettingsPage() {
  const [configs, setConfigs] = useState<ProviderConfig[]>([])
  const [models, setModels] = useState<AIModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [editingApiKey, setEditingApiKey] = useState<string | null>(null)
  const [newApiKey, setNewApiKey] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/ai-settings')
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Laden fehlgeschlagen')
      }

      setConfigs(data.configs || [])
      setModels(data.models || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (config: ProviderConfig, updates: Partial<ProviderConfig>) => {
    setSavingId(config.id)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/admin/ai-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: config.id,
          ...updates,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Speichern fehlgeschlagen')
      }

      setSuccess('Einstellung gespeichert')
      setTimeout(() => setSuccess(null), 3000)

      // Refresh data
      fetchSettings()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern')
    } finally {
      setSavingId(null)
      setEditingApiKey(null)
      setNewApiKey('')
    }
  }

  const getModelsForProvider = (provider: string) => {
    return models.filter((m) => m.provider === provider && !m.is_deprecated)
  }

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(4)}/1K`
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
        <h1 className="text-2xl font-bold text-slate-900">AI-Einstellungen</h1>
        <p className="text-slate-600 mt-1">
          Provider konfigurieren, Modelle auswählen und Fallback-Reihenfolge festlegen
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

      {/* Priority Ordering */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">🎯 Prioritäts-Reihenfolge</h2>
        <p className="text-sm text-slate-600 mb-4">
          Ziehe die Provider in die gewünschte Reihenfolge oder verwende die Pfeile. 
          Provider 1 wird zuerst versucht, bei Fehler kommt Provider 2, usw.
        </p>
        <div className="space-y-2">
          {[...configs]
            .sort((a, b) => a.priority - b.priority)
            .map((config, index) => {
              const providerInfo = PROVIDER_LABELS[config.provider]
              const isSaving = savingId === config.id

              return (
                <div
                  key={config.id}
                  className={`flex items-center gap-4 p-3 rounded-lg ${
                    config.is_active ? 'bg-slate-50' : 'bg-slate-100 opacity-60'
                  }`}
                >
                  {/* Priority Arrows */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => {
                        if (index === 0) return
                        const newPriority = configs[index - 1]?.priority - 1 || 0
                        handleSave(config, { priority: newPriority })
                      }}
                      disabled={index === 0 || isSaving}
                      className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                      title="Nach oben"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => {
                        if (index === configs.length - 1) return
                        const nextConfig = [...configs].sort((a, b) => a.priority - b.priority)[index + 1]
                        handleSave(config, { priority: nextConfig.priority + 1 })
                      }}
                      disabled={index === configs.length - 1 || isSaving}
                      className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                      title="Nach unten"
                    >
                      ▼
                    </button>
                  </div>

                  {/* Priority Number */}
                  <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold">
                    {index + 1}
                  </div>

                  {/* Provider Info */}
                  <span className="text-xl">{providerInfo.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{providerInfo.name}</span>
                      {config.is_catalog_agent && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          🤖 Catalog Agent
                        </span>
                      )}
                      {!config.is_active && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-500">
                          Deaktiviert
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-slate-500">{config.model}</span>
                  </div>

                  {/* API Key Status */}
                  <span className={`px-2 py-1 rounded text-xs ${
                    config.has_api_key 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {config.has_api_key ? '✓ Key' : '✗ Kein Key'}
                  </span>

                  {/* Catalog Agent Toggle */}
                  <button
                    onClick={() => handleSave(config, { is_catalog_agent: !config.is_catalog_agent })}
                    disabled={isSaving}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      config.is_catalog_agent
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title="Als Catalog Agent verwenden (für wöchentliche Model-Checks)"
                  >
                    🤖 Agent
                  </button>
                </div>
              )
            })}
        </div>
      </div>

      {/* Provider Cards */}
      <div className="grid gap-6">
        {[...configs]
          .sort((a, b) => a.priority - b.priority)
          .map((config, index) => {
          const providerInfo = PROVIDER_LABELS[config.provider]
          const availableModels = getModelsForProvider(config.provider)
          const currentModel = models.find((m) => m.id === config.model)
          const isSaving = savingId === config.id

          return (
            <div
              key={config.id}
              className={`bg-white rounded-xl border-2 p-6 ${
                config.is_active ? 'border-slate-200' : 'border-slate-100 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{providerInfo.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">
                        #{index + 1} - {providerInfo.name}
                      </h3>
                      {config.is_catalog_agent && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          🤖 Catalog Agent
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">{config.model}</p>
                  </div>
                </div>

                {/* Active Toggle */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.is_active}
                    onChange={(e) => handleSave(config, { is_active: e.target.checked })}
                    disabled={isSaving}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                  <span className="ml-2 text-sm text-slate-600">
                    {config.is_active ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Model Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Modell
                  </label>
                  <select
                    value={config.model}
                    onChange={(e) => handleSave(config, { model: e.target.value })}
                    disabled={isSaving}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {availableModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name} {model.is_latest && '(Latest)'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* API Key */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    API Key
                  </label>
                  {editingApiKey === config.id ? (
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={newApiKey}
                        onChange={(e) => setNewApiKey(e.target.value)}
                        placeholder="sk-..."
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                      <button
                        onClick={() => handleSave(config, { apiKey: newApiKey })}
                        disabled={!newApiKey || isSaving}
                        className="px-3 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 disabled:opacity-50"
                      >
                        {isSaving ? '...' : '✓'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingApiKey(null)
                          setNewApiKey('')
                        }}
                        className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingApiKey(config.id)}
                      className={`w-full px-3 py-2 border rounded-lg text-left text-sm ${
                        config.has_api_key
                          ? 'border-green-300 bg-green-50 text-green-700'
                          : 'border-amber-300 bg-amber-50 text-amber-700'
                      }`}
                    >
                      {config.has_api_key ? '••••••••••••• (konfiguriert)' : '⚠️ Nicht konfiguriert'}
                    </button>
                  )}
                </div>

                {/* Cost Info */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Kosten
                  </label>
                  <div className="px-3 py-2 bg-slate-50 rounded-lg text-sm">
                    {currentModel ? (
                      <>
                        <span className="text-slate-600">In: </span>
                        <span className="font-medium">{formatCost(currentModel.input_cost_per_1k)}</span>
                        <span className="text-slate-400 mx-2">|</span>
                        <span className="text-slate-600">Out: </span>
                        <span className="font-medium">{formatCost(currentModel.output_cost_per_1k)}</span>
                      </>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      value={config.settings?.max_tokens || 4096}
                      onChange={(e) =>
                        handleSave(config, {
                          settings: { ...config.settings, max_tokens: parseInt(e.target.value) },
                        })
                      }
                      disabled={isSaving}
                      className="w-full px-2 py-1 border border-slate-200 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Temperature
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      value={config.settings?.temperature || 0.7}
                      onChange={(e) =>
                        handleSave(config, {
                          settings: { ...config.settings, temperature: parseFloat(e.target.value) },
                        })
                      }
                      disabled={isSaving}
                      className="w-full px-2 py-1 border border-slate-200 rounded text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <span className="text-xs text-slate-400">
                      Aktualisiert: {new Date(config.updated_at).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Model Updates Widget */}
      <ModelUpdatesWidget />

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Hinweise</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Provider #1 wird zuerst versucht, bei Fehler kommt #2, usw.</li>
          <li>• Verwende die Pfeile um die Reihenfolge zu ändern</li>
          <li>• API Keys werden AES-256 verschlüsselt in der DB gespeichert</li>
          <li>• <strong>🤖 Catalog Agent:</strong> Der markierte Provider prüft wöchentlich auf neue Modelle</li>
          <li>• Empfehlung: Gemini oder Groq als Catalog Agent (kostenloses Kontingent)</li>
          <li>• <strong>🟠 Groq:</strong> Ultra-schnell (10-20x), nutzt Llama 3.1 & Mixtral - kostenloser Tier!</li>
          <li>• Preise sind in USD pro 1.000 Tokens angegeben</li>
        </ul>
      </div>
    </div>
  )
}

