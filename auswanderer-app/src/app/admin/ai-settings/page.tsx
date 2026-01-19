'use client'

import { useState, useEffect } from 'react'

interface ProviderConfig {
  id: string
  provider: 'claude' | 'openai' | 'gemini' | 'groq'
  model: string
  is_active: boolean
  priority: number
  is_catalog_agent: boolean
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

const PROVIDERS: Record<string, { name: string; icon: string; color: string; bg: string }> = {
  claude: { name: 'Claude', icon: '🟣', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  openai: { name: 'OpenAI', icon: '🟢', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  gemini: { name: 'Gemini', icon: '🔵', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  groq: { name: 'Groq', icon: '🟠', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
}

export default function AdminAISettingsPage() {
  const [configs, setConfigs] = useState<ProviderConfig[]>([])
  const [models, setModels] = useState<AIModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [editingApiKey, setEditingApiKey] = useState<string | null>(null)
  const [newApiKey, setNewApiKey] = useState('')
  const [testingProvider, setTestingProvider] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, 'success' | 'error' | null>>({})

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/ai-settings')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Laden fehlgeschlagen')
      setConfigs(data.configs || [])
      setModels(data.models || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (config: ProviderConfig, updates: Partial<ProviderConfig & { apiKey?: string }>) => {
    setSavingId(config.id)
    setError(null)

    try {
      const res = await fetch('/api/admin/ai-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: config.id, ...updates }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Speichern fehlgeschlagen')
      }
      fetchSettings()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern')
    } finally {
      setSavingId(null)
      setEditingApiKey(null)
      setNewApiKey('')
    }
  }

  const handleTest = async (config: ProviderConfig) => {
    setTestingProvider(config.id)
    setTestResults((prev) => ({ ...prev, [config.id]: null }))

    try {
      const res = await fetch('/api/admin/ai-settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: config.provider }),
      })
      setTestResults((prev) => ({ ...prev, [config.id]: res.ok ? 'success' : 'error' }))
    } catch {
      setTestResults((prev) => ({ ...prev, [config.id]: 'error' }))
    } finally {
      setTestingProvider(null)
    }
  }

  const handlePriorityChange = async (config: ProviderConfig, newPriority: number) => {
    // Swap priorities with existing provider at that priority
    const existingAtPriority = configs.find(c => c.priority === newPriority && c.id !== config.id)
    if (existingAtPriority) {
      await handleSave(existingAtPriority, { priority: config.priority })
    }
    await handleSave(config, { priority: newPriority })
  }

  const getModelsForProvider = (provider: string) => {
    return models.filter((m) => m.provider === provider && !m.is_deprecated)
  }

  const sortedConfigs = [...configs].sort((a, b) => a.priority - b.priority)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Provider</h1>
        <p className="text-slate-500 mt-1">
          Konfiguriere die KI-Anbieter für die Analyse. Provider #1 wird zuerst verwendet.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Provider Cards */}
      <div className="space-y-4">
        {sortedConfigs.map((config) => {
          const provider = PROVIDERS[config.provider]
          const availableModels = getModelsForProvider(config.provider)
          const isSaving = savingId === config.id
          const isTesting = testingProvider === config.id
          const testResult = testResults[config.id]

          return (
            <div
              key={config.id}
              className={`border-2 rounded-xl p-5 transition-all ${
                config.is_active 
                  ? provider.bg
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              {/* Top Row: Priority, Name, Status, Toggle */}
              <div className="flex items-center gap-4 mb-4">
                {/* Priority Selector */}
                <select
                  value={config.priority}
                  onChange={(e) => handlePriorityChange(config, parseInt(e.target.value))}
                  disabled={isSaving}
                  className="w-16 h-10 text-center font-bold text-lg border-2 border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500"
                >
                  {[1, 2, 3, 4].map((p) => (
                    <option key={p} value={p}>#{p}</option>
                  ))}
                </select>

                {/* Provider Icon & Name */}
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-2xl">{provider.icon}</span>
                  <div>
                    <h3 className={`font-semibold ${provider.color}`}>{provider.name}</h3>
                    <p className="text-xs text-slate-500">{config.model}</p>
                  </div>
                </div>

                {/* Test Button */}
                <button
                  onClick={() => handleTest(config)}
                  disabled={isTesting || !config.has_api_key}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isTesting
                      ? 'bg-slate-200 text-slate-400'
                      : testResult === 'success'
                      ? 'bg-green-500 text-white'
                      : testResult === 'error'
                      ? 'bg-red-500 text-white'
                      : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isTesting ? '...' : testResult === 'success' ? '✓ OK' : testResult === 'error' ? '✗' : 'Test'}
                </button>

                {/* Active Toggle */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.is_active}
                    onChange={(e) => handleSave(config, { is_active: e.target.checked })}
                    disabled={isSaving}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-7 bg-slate-300 peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-sm" />
                </label>
              </div>

              {/* Bottom Row: Model, API Key */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Model Selection */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Modell</label>
                  <select
                    value={config.model}
                    onChange={(e) => handleSave(config, { model: e.target.value })}
                    disabled={isSaving}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    {availableModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name} {model.is_latest && '⭐'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* API Key */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">API Key</label>
                  {editingApiKey === config.id ? (
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={newApiKey}
                        onChange={(e) => setNewApiKey(e.target.value)}
                        placeholder="sk-..."
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSave(config, { apiKey: newApiKey })}
                        disabled={!newApiKey || isSaving}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 disabled:opacity-50"
                      >
                        {isSaving ? '...' : '✓'}
                      </button>
                      <button
                        onClick={() => { setEditingApiKey(null); setNewApiKey('') }}
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
                          : 'border-orange-300 bg-orange-50 text-orange-700'
                      }`}
                    >
                      {config.has_api_key ? '••••••••••••• ✓' : '⚠ Nicht konfiguriert'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Info */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600">
        <p className="font-medium text-slate-700 mb-2">💡 So funktioniert's:</p>
        <ul className="space-y-1">
          <li>• <strong>#1</strong> wird zuerst versucht, bei Fehler kommt <strong>#2</strong>, usw.</li>
          <li>• Aktiviere Provider mit dem Toggle rechts</li>
          <li>• Klicke <strong>Test</strong> um die Verbindung zu prüfen</li>
        </ul>
      </div>
    </div>
  )
}
