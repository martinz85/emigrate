'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { RatingButtons } from './RatingButtons'
import type { AnalysisQuestionWithCategory } from '@/types/questions'

// Generiere Supabase Storage URL für Frage-Bild (Client-sicher)
function getQuestionImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return null
  return `${supabaseUrl}/storage/v1/object/public/question-images/${imagePath}`
}

// ============================================
// Props
// ============================================

interface DynamicQuestionCardProps {
  question: AnalysisQuestionWithCategory
  questionNumber: number
  totalQuestions: number
  onAnswer: (value: number | string | boolean | string[], textNote?: string) => void
  onBack?: () => void
  currentValue?: number | string | boolean | string[]
  currentTextNote?: string
}

// ============================================
// Main Component - Redesigned
// ============================================

export function DynamicQuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onBack,
  currentValue,
  currentTextNote,
}: DynamicQuestionCardProps) {
  const [showInfo, setShowInfo] = useState(false)
  const [selectedValue, setSelectedValue] = useState<number | string | boolean | string[] | null>(
    currentValue ?? null
  )
  const [textNote, setTextNote] = useState(currentTextNote || '')
  
  const isFirstQuestion = questionNumber === 1
  const hasTextInput = question.allow_text_input
  const categoryIcon = question.category?.icon || '❓'
  const imageUrl = getQuestionImageUrl(question.image_path)
  
  // State zurücksetzen wenn Frage wechselt
  useEffect(() => {
    setSelectedValue(currentValue ?? null)
    setTextNote(currentTextNote || '')
  }, [question.id, currentValue, currentTextNote])
  
  // Handle selection (doesn't submit yet)
  const handleSelect = (value: number | string | boolean | string[]) => {
    setSelectedValue(value)
  }
  
  // Handle "Weiter" button
  const handleNext = () => {
    if (selectedValue === null) return
    onAnswer(selectedValue, textNote.trim() || undefined)
  }
  
  // Kann fortfahren wenn ein Wert ausgewählt ist
  const canProceed = selectedValue !== null

  // ============================================
  // Render Input based on question type
  // ============================================
  
  const renderInput = () => {
    switch (question.question_type) {
      case 'boolean':
        return (
          <div className="flex justify-center gap-4">
            <button
              onClick={() => handleSelect(true)}
              data-testid="analysis-boolean-yes"
              className={`px-8 py-4 rounded-xl text-lg font-medium transition-all ${
                selectedValue === true
                  ? 'bg-emerald-500 text-white scale-105 shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              ✓ Ja
            </button>
            <button
              onClick={() => handleSelect(false)}
              data-testid="analysis-boolean-no"
              className={`px-8 py-4 rounded-xl text-lg font-medium transition-all ${
                selectedValue === false
                  ? 'bg-slate-600 text-white scale-105 shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              ✕ Nein
            </button>
          </div>
        )

      case 'text':
        return (
          <div className="max-w-md mx-auto">
            <textarea
              value={(selectedValue as string) || ''}
              onChange={(e) => setSelectedValue(e.target.value)}
              placeholder={question.help_text || 'Deine Antwort...'}
              rows={3}
              data-testid="analysis-text-input"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>
        )

      case 'select':
        if (!question.select_options || question.select_options.length === 0) {
          return <p className="text-red-500">Keine Optionen konfiguriert</p>
        }
        return (
          <div className="max-w-md mx-auto space-y-2">
            {question.select_options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                data-testid={`analysis-select-option-${option.value}`}
                className={`w-full px-4 py-3 text-left rounded-xl transition-all ${
                  selectedValue === option.value
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )

      case 'rating':
      default:
        return (
          <div className="max-w-sm mx-auto">
            <RatingButtons 
              onSelect={handleSelect} 
              selectedValue={selectedValue as number | undefined} 
            />
            <div className="flex justify-between text-xs text-slate-400 mt-3 px-1">
              <span>egal</span>
              <span>sehr wichtig</span>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="py-6 px-4" data-testid="analysis-question-card">
      {/* Question Image (if available) */}
      {imageUrl && (
        <div className="mb-6 max-w-md mx-auto">
          <img
            src={imageUrl}
            alt=""
            className="w-full h-48 object-cover rounded-xl shadow-md"
          />
        </div>
      )}

      {/* Question Text */}
      <div className="text-center mb-8">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-3 max-w-2xl mx-auto">
          {question.question_text}
        </h2>
        
        {/* Info Button (if help_text available) */}
        {question.help_text && (
          <button
            type="button"
            onClick={() => setShowInfo(true)}
            aria-label="Mehr Informationen"
            data-testid="analysis-question-info-button"
            className="text-slate-400 hover:text-emerald-500 transition-colors inline-flex items-center gap-1 text-sm"
          >
            <span>ℹ️</span>
            <span>Mehr erfahren</span>
          </button>
        )}
      </div>

      {/* Main Input */}
      <div className="mb-8">
        {renderInput()}
      </div>

      {/* Optional Text Input (shown if enabled for this question) */}
      {hasTextInput && (
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <label className="block text-sm font-medium text-slate-600 mb-2">
              {question.text_input_label || '📝 Möchtest du etwas hinzufügen? (optional)'}
            </label>
            <textarea
              value={textNote}
              onChange={(e) => setTextNote(e.target.value)}
              placeholder={question.text_input_placeholder || 'Deine Anmerkung...'}
              rows={2}
              data-testid="analysis-question-text-note"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none bg-white text-sm"
            />
          </div>
        </div>
      )}

      {/* Weight indicator (subtle) */}
      {question.weight !== 1 && (
        <div className="text-center text-xs text-slate-400 mb-6">
          Gewichtung: {question.weight.toFixed(1)}x
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="max-w-md mx-auto">
        <div className="flex gap-3">
          {/* Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              data-testid="analysis-question-back-button"
              className="flex-1 py-3 px-4 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <span>←</span>
              <span>{isFirstQuestion ? 'Zurück' : 'Zurück'}</span>
            </button>
          )}
          
          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={!canProceed}
            data-testid="analysis-question-next-button"
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              canProceed
                ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md hover:shadow-lg'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>{questionNumber === totalQuestions ? 'Abschließen' : 'Weiter'}</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Info Modal */}
      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>{categoryIcon}</span>
              {question.question_key || 'Information'}
            </DialogTitle>
            <DialogDescription className="pt-4 text-base text-slate-600">
              {question.help_text}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <button
              onClick={() => setShowInfo(false)}
              className="w-full py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
            >
              Verstanden
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
