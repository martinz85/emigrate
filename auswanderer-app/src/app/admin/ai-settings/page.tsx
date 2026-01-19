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

interface CatalogCheck {
  checked_at: string
  status: string
  updates_found: number
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
  const [lastCatalogCheck, setLastCatalogCheck] = useState<CatalogCheck | null>(null)
  const [isCheckingCatalog, setIsCheckingCatalog] = useState(false)

  useEffect(() => {
    fetchSettings()
    fetchCatalogStatus()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/ai-settings')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Laden fehlgeschlagen')
      
      // Ensure unique priorities (fix duplicates)
      const configsWithFixedPriorities = fixDuplicatePriorities(data.configs || [])
      setConfigs(configsWithFixedPriorities)
      setModels(data.models || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden')
    } finally {
      setIsLoading(false)
    }
  }

  const fixDuplicatePriorities = (configs: ProviderConfig[]): ProviderConfig[] => {
    const sorted = [...configs].sort((a, b) => a.priority - b.priority)
    const fixed: ProviderConfig[] = []
    let nextPriority = 1
    
    for (const config of sorted) {
      fixed.push({ ...config, priority: nextPriority })
      nextPriority++
    }
    return fixed
  }

  const fetchCatalogStatus = async () => {
    try {
      const res = await fetch('/api/admin/ai-catalog')
      const data = await res.json()
      if (res.ok && data.lastCheck) {
        setLastCatalogCheck(data.lastCheck)
      }
    } catch {
      // Ignore errors
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
    // Find the provider currently at the new priority
    const existingAtPriority = configs.find(c => c.priority === newPriority && c.id !== config.id)
    
    // Swap: give the existing one our current priority
    if (existingAtPriority) {
      await handleSave(existingAtPriority, { priority: config.priority })
    }
    await handleSave(config, { priority: newPriority })
  }

  const handleSetCatalogAgent = async (config: ProviderConfig) => {
    // First, remove catalog agent from all others
    for (const c of configs) {
      if (c.is_catalog_agent && c.id !== config.id) {
        await handleSave(c, { is_catalog_agent: false })
      }
    }
    // Set this one as catalog agent
    await handleSave(config, { is_catalog_agent: true })
  }

  const handleRunCatalogCheck = async () => {
    setIsCheckingCatalog(true)
    try {
      const res = await fetch('/api/admin/ai-catalog/check', { method: 'POST' })
      if (res.ok) {
        fetchCatalogStatus()
      }
    } catch {
      // Ignore
    } finally {
      setIsCheckingCatalog(false)
    }
  }

  const getModelsForProvider = (provider: string) => {
    return models.filter((m) => m.provider === provider && !m.is_deprecated)
  }

  const sortedConfigs = [...configs].sort((a, b) => a.priority - b.priority)
  const catalogAgent = configs.find(c => c.is_catalog_agent)

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
              {/* Top Row: Priority, Name, Catalog Badge, Test, Toggle */}
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
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold ${provider.color}`}>{provider.name}</h3>
                      {config.is_catalog_agent && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          🤖 Catalog
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{config.model}</p>
                  </div>
                </div>

                {/* Catalog Agent Button */}
                <button
                  onClick={() => handleSetCatalogAgent(config)}
                  disabled={isSaving}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    config.is_catalog_agent
                      ? 'bg-amber-500 text-white'
                      : 'bg-white border border-slate-300 text-slate-500 hover:bg-slate-50'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                  title="Als Catalog Agent setzen (prüft wöchentlich auf neue Modelle)"
                >
                  🤖
                </button>

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

      {/* Catalog Agent Section */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <h3 className="font-semibold text-amber-800">Catalog Agent & Modell-Übersicht</h3>
          </div>
          <button
            onClick={handleRunCatalogCheck}
            disabled={isCheckingCatalog || !catalogAgent}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCheckingCatalog ? 'Prüfe...' : 'Jetzt prüfen'}
          </button>
        </div>
        
        {/* Status Row */}
        <div className="flex items-center gap-4 text-sm mb-4 pb-4 border-b border-amber-200">
          <span className="text-amber-700">
            Agent: <strong>{catalogAgent ? PROVIDERS[catalogAgent.provider]?.name : 'Keiner'}</strong>
          </span>
          <span className="text-amber-600">
            Letzter Check: {lastCatalogCheck?.checked_at ? new Date(lastCatalogCheck.checked_at).toLocaleDateString('de-DE') : 'Noch nie'}
          </span>
          <span className="text-amber-600">
            Modelle: <strong>{models.length}</strong>
          </span>
        </div>

        {/* Models Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-amber-700 border-b border-amber-200">
                <th className="pb-2 font-medium">Provider</th>
                <th className="pb-2 font-medium">Modell</th>
                <th className="pb-2 font-medium text-right">Input/1K</th>
                <th className="pb-2 font-medium text-right">Output/1K</th>
                <th className="pb-2 font-medium text-right">Max Tokens</th>
                <th className="pb-2 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="text-amber-800">
              {models
                .filter(m => !m.is_deprecated)
                .sort((a, b) => {
                  // Sort by provider, then by is_latest
                  if (a.provider !== b.provider) {
                    const order = ['claude', 'openai', 'gemini', 'groq']
                    return order.indexOf(a.provider) - order.indexOf(b.provider)
                  }
                  return b.is_latest ? 1 : -1
                })
                .map((model) => {
                  const providerInfo = PROVIDERS[model.provider]
                  const isActive = configs.some(c => c.model === model.id && c.is_active)
                  
                  return (
                    <tr key={model.id} className="border-b border-amber-100 last:border-0">
                      <td className="py-2">
                        <span className="flex items-center gap-1">
                          <span>{providerInfo?.icon}</span>
                          <span className="text-xs text-amber-600">{providerInfo?.name}</span>
                        </span>
                      </td>
                      <td className="py-2">
                        <span className="flex items-center gap-1">
                          {model.name}
                          {model.is_latest && <span className="text-amber-500">⭐</span>}
                        </span>
                      </td>
                      <td className="py-2 text-right font-mono text-xs">
                        ${model.input_cost_per_1k.toFixed(4)}
                      </td>
                      <td className="py-2 text-right font-mono text-xs">
                        ${model.output_cost_per_1k.toFixed(4)}
                      </td>
                      <td className="py-2 text-right font-mono text-xs">
                        {model.max_tokens.toLocaleString()}
                      </td>
                      <td className="py-2 text-center">
                        {isActive ? (
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full" title="Aktiv" />
                        ) : (
                          <span className="inline-block w-2 h-2 bg-slate-300 rounded-full" title="Inaktiv" />
                        )}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600">
        <p className="font-medium text-slate-700 mb-2">💡 So funktioniert's:</p>
        <ul className="space-y-1">
          <li>• <strong>#1</strong> wird zuerst versucht, bei Fehler kommt <strong>#2</strong>, usw.</li>
          <li>• Klicke <strong>🤖</strong> um einen Provider als Catalog Agent zu setzen</li>
          <li>• <strong>⭐</strong> = Neuestes Modell, <span className="inline-block w-2 h-2 bg-green-500 rounded-full" /> = Aktiv ausgewählt</li>
        </ul>
      </div>
    </div>
  )
}
