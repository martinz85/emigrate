'use client'

import { useState } from 'react'
import type { QuestionType, SelectOption } from '@/types/questions'

// ============================================
// Vorschau-Komponente für Admin-Bereich
// Zeigt wie die Frage im Frontend aussehen wird
// ============================================

interface QuestionPreviewProps {
  questionText: string
  questionType: QuestionType
  helpText?: string
  selectOptions?: SelectOption[]
  imagePath?: string | null
  categoryIcon?: string
  allowTextInput?: boolean
  textInputLabel?: string
  textInputPlaceholder?: string
}

// Generiere Supabase Storage URL für Vorschau
function getPreviewImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return null
  return `${supabaseUrl}/storage/v1/object/public/question-images/${imagePath}`
}

export function QuestionPreview({
  questionText,
  questionType,
  helpText,
  selectOptions = [],
  imagePath,
  categoryIcon = '❓',
  allowTextInput = false,
  textInputLabel,
  textInputPlaceholder,
}: QuestionPreviewProps) {
  const [demoValue, setDemoValue] = useState<number | string | boolean | null>(null)
  const [showInfo, setShowInfo] = useState(false)
  const [textNote, setTextNote] = useState('')
  
  const imageUrl = getPreviewImageUrl(imagePath)

  // Render Input basierend auf Fragetyp
  const renderInput = () => {
    switch (questionType) {
      case 'boolean':
        return (
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setDemoValue(true)}
              className={`px-6 py-3 rounded-xl text-base font-medium transition-all ${
                demoValue === true
                  ? 'bg-emerald-500 text-white scale-105 shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              ✓ Ja
            </button>
            <button
              onClick={() => setDemoValue(false)}
              className={`px-6 py-3 rounded-xl text-base font-medium transition-all ${
                demoValue === false
                  ? 'bg-slate-600 text-white scale-105 shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              ✗ Nein
            </button>
          </div>
        )

      case 'rating':
        return (
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => setDemoValue(rating)}
                className={`w-12 h-12 rounded-xl text-lg font-semibold transition-all ${
                  demoValue === rating
                    ? 'bg-emerald-500 text-white scale-110 shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        )

      case 'text':
        return (
          <div className="max-w-sm mx-auto">
            <input
              type="text"
              value={typeof demoValue === 'string' ? demoValue : ''}
              onChange={(e) => setDemoValue(e.target.value)}
              placeholder="Deine Antwort..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
        )

      case 'select':
        return (
          <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
            {selectOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setDemoValue(option.value)}
                className={`p-3 rounded-xl text-sm font-medium transition-all text-left ${
                  demoValue === option.value
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )

      default:
        return <p className="text-slate-500 text-sm">Unbekannter Fragetyp</p>
    }
  }

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Vorschau-Header */}
      <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          📱 Live-Vorschau
        </span>
        <button
          onClick={() => {
            setDemoValue(null)
            setTextNote('')
          }}
          className="text-xs text-slate-500 hover:text-slate-700"
        >
          Zurücksetzen
        </button>
      </div>

      {/* Simulated Mobile Frame */}
      <div className="p-6 max-w-md mx-auto">
        {/* Kategorie Badge */}
        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
            <span>{categoryIcon}</span>
            <span>Kategorie</span>
          </span>
        </div>

        {/* Bild */}
        {imageUrl ? (
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Frage-Bild"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
              <span className="text-4xl">{categoryIcon}</span>
            </div>
          </div>
        )}

        {/* Fragetext */}
        <h3 className="text-lg font-semibold text-slate-800 text-center mb-4">
          {questionText || 'Fragetext wird hier angezeigt...'}
        </h3>

        {/* Hilfetext Button */}
        {helpText && (
          <div className="text-center mb-4">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="text-sm text-emerald-600 hover:text-emerald-700 underline"
            >
              ℹ️ Mehr erfahren
            </button>
            {showInfo && (
              <div className="mt-2 p-3 bg-emerald-50 rounded-lg text-sm text-emerald-800 text-left">
                {helpText}
              </div>
            )}
          </div>
        )}

        {/* Input */}
        <div className="mb-6">
          {renderInput()}
        </div>

        {/* Optionales Textfeld */}
        {allowTextInput && demoValue !== null && (
          <div className="mb-6 p-4 bg-slate-50 rounded-xl">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {textInputLabel || 'Möchtest du noch etwas hinzufügen?'}
            </label>
            <textarea
              value={textNote}
              onChange={(e) => setTextNote(e.target.value)}
              placeholder={textInputPlaceholder || 'Deine Anmerkung...'}
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
            />
          </div>
        )}

        {/* Demo Navigation */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <button
            disabled
            className="text-slate-400 text-sm flex items-center gap-1"
          >
            ← Zurück
          </button>
          <button
            disabled={demoValue === null}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              demoValue !== null
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-200 text-slate-400'
            }`}
          >
            Weiter →
          </button>
        </div>

        {/* Demo Status */}
        {demoValue !== null && (
          <div className="mt-4 p-3 bg-emerald-50 rounded-lg text-center">
            <span className="text-xs text-emerald-700">
              ✓ Ausgewählt: <strong>{String(demoValue)}</strong>
              {textNote && ` + Anmerkung`}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

