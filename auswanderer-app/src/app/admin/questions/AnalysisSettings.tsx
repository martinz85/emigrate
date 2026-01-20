'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AdditionalNotesSettings {
  enabled: boolean
  label: string
  placeholder: string
  required: boolean
}

interface SettingsProps {
  initialSettings: {
    additional_notes_field?: AdditionalNotesSettings
  }
}

export function AnalysisSettings({ initialSettings }: SettingsProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState<AdditionalNotesSettings>(
    initialSettings.additional_notes_field || {
      enabled: true,
      label: 'Möchtest du uns noch etwas mitteilen?',
      placeholder: 'z.B. Besondere Anforderungen, Hobbys, Familie...',
      required: false,
    }
  )

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'additional_notes_field',
          value: settings,
        }),
      })

      if (!response.ok) {
        throw new Error('Fehler beim Speichern')
      }

      router.refresh()
      setIsOpen(false)
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggle = async () => {
    const newSettings = { ...settings, enabled: !settings.enabled }
    setSettings(newSettings)
    
    // Auto-save on toggle
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'additional_notes_field',
          value: newSettings,
        }),
      })
      router.refresh()
    } catch (error) {
      console.error('Error toggling setting:', error)
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-slate-800 flex items-center gap-2">
            📝 Zusätzliches Textfeld
            <span className={`text-xs px-2 py-0.5 rounded ${settings.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              {settings.enabled ? 'Aktiv' : 'Inaktiv'}
            </span>
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Optionales Textfeld am Ende der Analyse für zusätzliche User-Eingaben
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-sm text-slate-600 hover:text-slate-800"
            data-testid="admin-settings-notes-edit-button"
          >
            ⚙️ Bearbeiten
          </button>
          <button
            onClick={handleToggle}
            data-testid="admin-settings-notes-toggle"
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.enabled ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Überschrift
            </label>
            <input
              type="text"
              value={settings.label}
              onChange={(e) => setSettings({ ...settings, label: e.target.value })}
              data-testid="admin-settings-notes-label-input"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Placeholder-Text
            </label>
            <input
              type="text"
              value={settings.placeholder}
              onChange={(e) => setSettings({ ...settings, placeholder: e.target.value })}
              data-testid="admin-settings-notes-placeholder-input"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="required"
              checked={settings.required}
              onChange={(e) => setSettings({ ...settings, required: e.target.checked })}
              data-testid="admin-settings-notes-required-checkbox"
              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
            />
            <label htmlFor="required" className="text-sm text-slate-700">
              Pflichtfeld (muss ausgefüllt werden)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-slate-600 hover:text-slate-800"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              data-testid="admin-settings-notes-save-button"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSaving ? 'Speichern...' : 'Speichern'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

