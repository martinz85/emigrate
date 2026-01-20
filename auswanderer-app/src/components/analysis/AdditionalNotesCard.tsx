'use client'

import { useState } from 'react'

interface AdditionalNotesSettings {
  enabled: boolean
  label: string
  placeholder: string
  required: boolean
}

interface AdditionalNotesCardProps {
  settings: AdditionalNotesSettings
  onSubmit: (notes: string) => void
  onSkip: () => void
  onBack?: () => void
}

export function AdditionalNotesCard({ settings, onSubmit, onSkip, onBack }: AdditionalNotesCardProps) {
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (settings.required && !notes.trim()) {
      setError('Bitte fülle dieses Feld aus')
      return
    }
    onSubmit(notes)
  }

  const handleSkip = () => {
    if (settings.required) {
      setError('Dieses Feld ist ein Pflichtfeld')
      return
    }
    onSkip()
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="card">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <span className="text-6xl">💬</span>
        </div>

        {/* Title */}
        <h2 className="font-heading text-2xl font-bold text-center text-slate-900 mb-2">
          {settings.label}
        </h2>

        <p className="text-slate-500 text-center mb-6">
          {settings.required ? 'Pflichtfeld' : 'Optional - du kannst diesen Schritt auch überspringen'}
        </p>

        {/* Textarea */}
        <div className="mb-6">
          <textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value)
              setError('')
            }}
            placeholder={settings.placeholder}
            rows={5}
            data-testid="analysis-notes-textarea"
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none ${
              error ? 'border-red-500' : 'border-slate-300'
            }`}
          />
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>

        {/* Character count */}
        <div className="text-right text-sm text-slate-400 mb-6">
          {notes.length} Zeichen
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSubmit}
            className="flex-1 btn-cta py-4"
            data-testid="analysis-notes-submit-button"
          >
            {notes.trim() ? 'Weiter zur Analyse 🚀' : 'Ohne Anmerkung fortfahren'}
          </button>
          
          {!settings.required && (
            <button
              onClick={handleSkip}
              className="px-6 py-4 text-slate-500 hover:text-slate-700 transition-colors"
              data-testid="analysis-notes-skip-button"
            >
              Überspringen →
            </button>
          )}
        </div>

        {/* Back Button */}
        {onBack && (
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <button
              onClick={onBack}
              className="text-slate-500 hover:text-slate-700 transition-colors inline-flex items-center gap-2"
              data-testid="analysis-notes-back-button"
            >
              <span>←</span>
              <span>Zurück zur letzten Frage</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

