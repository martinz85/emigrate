'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import type { AnalysisQuestion, QuestionCategory, QuestionType, SelectOption } from '@/types/questions'

// ============================================
// Props
// ============================================

interface QuestionFormProps {
  question?: AnalysisQuestion
  categories: QuestionCategory[]
}

// ============================================
// Question Type Options
// ============================================

const QUESTION_TYPES: { value: QuestionType; label: string; description: string }[] = [
  { value: 'rating', label: 'Rating 1-5', description: 'Skala-Bewertung mit Emojis' },
  { value: 'boolean', label: 'Ja/Nein', description: 'Binäre Auswahl' },
  { value: 'text', label: 'Freitext', description: 'Texteingabe vom User' },
  { value: 'select', label: 'Auswahl', description: 'Dropdown mit Optionen' },
]

// ============================================
// Main Component
// ============================================

export function QuestionForm({ question, categories }: QuestionFormProps) {
  const router = useRouter()
  const isEditing = !!question

  // Debug: Log question data on load
  console.log('[QuestionForm] Loaded question:', question)
  console.log('[QuestionForm] allow_text_input from DB:', question?.allow_text_input)

  // Form state
  const [formData, setFormData] = useState({
    question_text: question?.question_text || '',
    question_key: question?.question_key || '',
    help_text: question?.help_text || '',
    question_type: question?.question_type || 'rating' as QuestionType,
    category_id: question?.category_id || '',
    weight: question?.weight ?? 1.00,
    is_required: question?.is_required ?? true,
    is_active: question?.is_active ?? true,
    select_options: question?.select_options || [] as SelectOption[],
    // Optional text input per question
    allow_text_input: question?.allow_text_input ?? false,
    text_input_label: question?.text_input_label || 'Möchtest du noch etwas hinzufügen?',
    text_input_placeholder: question?.text_input_placeholder || 'Deine Anmerkung...',
  })

  const [imagePath, setImagePath] = useState<string | null>(question?.image_path || null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Image upload with dropzone
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Preview
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)

    // Upload
    const formData = new FormData()
    formData.append('file', file)
    if (question?.id) {
      formData.append('questionId', question.id)
    }

    try {
      const response = await fetch('/api/admin/questions/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload fehlgeschlagen')
      }

      setImagePath(data.path)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload fehlgeschlagen')
      setImagePreview(null)
    }
  }, [question?.id])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 2 * 1024 * 1024, // 2MB
    multiple: false,
  })

  // Remove image
  const handleRemoveImage = async () => {
    if (question?.id && imagePath) {
      try {
        await fetch(`/api/admin/questions/upload?questionId=${question.id}`, {
          method: 'DELETE',
        })
      } catch (err) {
        console.error('Delete image error:', err)
      }
    }
    setImagePath(null)
    setImagePreview(null)
  }

  // Handle select options
  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      select_options: [...prev.select_options, { value: '', label: '' }],
    }))
  }

  const updateOption = (index: number, field: 'value' | 'label', value: string) => {
    setFormData(prev => ({
      ...prev,
      select_options: prev.select_options.map((opt, i) => 
        i === index ? { ...opt, [field]: value } : opt
      ),
    }))
  }

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      select_options: prev.select_options.filter((_, i) => i !== index),
    }))
  }

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const payload = {
        ...formData,
        category_id: formData.category_id || null,
        question_key: formData.question_key || null,
        help_text: formData.help_text || null,
        image_path: imagePath,
        select_options: formData.question_type === 'select' ? formData.select_options : null,
        // Text input fields
        allow_text_input: formData.allow_text_input,
        text_input_label: formData.allow_text_input ? formData.text_input_label : null,
        text_input_placeholder: formData.allow_text_input ? formData.text_input_placeholder : null,
      }

      console.log('[QuestionForm] Submitting payload:', payload)

      const url = isEditing 
        ? `/api/admin/questions/${question.id}`
        : '/api/admin/questions'

      console.log('[QuestionForm] URL:', url, 'Method:', isEditing ? 'PATCH' : 'POST')

      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      console.log('[QuestionForm] Response:', response.status, data)

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Speichern')
      }

      // Navigate with timestamp to bypass client-side cache
      router.push(`/admin/questions?updated=${Date.now()}`)
      router.refresh()
    } catch (err) {
      console.error('Submit error:', err)
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get image URL for preview
  const getImageUrl = () => {
    if (imagePreview) return imagePreview
    if (imagePath) {
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/question-images/${imagePath}`
    }
    return null
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl" data-testid="admin-question-form">
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-200">
        {/* Question Text */}
        <div className="p-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Frage-Text *
          </label>
          <textarea
            value={formData.question_text}
            onChange={(e) => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
            required
            rows={3}
            data-testid="admin-question-text-input"
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            placeholder="Wie wichtig ist es dir, dass..."
          />
        </div>

        {/* Question Key (optional) */}
        <div className="p-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Frage-Key (optional)
          </label>
          <input
            type="text"
            value={formData.question_key}
            onChange={(e) => setFormData(prev => ({ ...prev, question_key: e.target.value }))}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="z.B. living_costs"
          />
          <p className="mt-1 text-xs text-slate-500">
            Eindeutiger Schlüssel für Mapping zu bestehenden Analysen
          </p>
        </div>

        {/* Help Text */}
        <div className="p-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Hilfetext (für ℹ️ Modal)
          </label>
          <textarea
            value={formData.help_text}
            onChange={(e) => setFormData(prev => ({ ...prev, help_text: e.target.value }))}
            rows={2}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            placeholder="Zusätzliche Erklärung für den User..."
          />
        </div>

        {/* Question Type */}
        <div className="p-6">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Fragetyp *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {QUESTION_TYPES.map(type => (
              <div
                key={type.value}
                onClick={() => setFormData(prev => ({ ...prev, question_type: type.value }))}
                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.question_type === type.value
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="question_type"
                  value={type.value}
                  checked={formData.question_type === type.value}
                  onChange={() => {}}
                  className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-800">{type.label}</div>
                  <div className="text-xs text-slate-500">{type.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Select Options (conditional) */}
        {formData.question_type === 'select' && (
          <div className="p-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Auswahloptionen *
            </label>
            <div className="space-y-3">
              {formData.select_options.map((option, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    value={option.value}
                    onChange={(e) => updateOption(index, 'value', e.target.value)}
                    placeholder="Wert (z.B. de)"
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) => updateOption(index, 'label', e.target.value)}
                    placeholder="Anzeige (z.B. Deutschland)"
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addOption}
                className="px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg"
              >
                + Option hinzufügen
              </button>
            </div>
          </div>
        )}

        {/* Category */}
        <div className="p-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Kategorie
          </label>
          <select
            value={formData.category_id}
            onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Keine Kategorie</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Weight */}
        <div className="p-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Gewichtung
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="5"
              step="0.25"
              value={formData.weight}
              onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
              className="flex-1"
            />
            <input
              type="number"
              min="0"
              max="10"
              step="0.25"
              value={formData.weight}
              onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
              className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-center"
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Höhere Gewichtung = stärkerer Einfluss auf AI-Analyse
          </p>
        </div>

        {/* Image Upload */}
        <div className="p-6">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Bild (optional)
          </label>
          
          {getImageUrl() ? (
            <div className="relative inline-block">
              <img
                src={getImageUrl()!}
                alt="Vorschau"
                className="w-48 h-32 object-cover rounded-lg border border-slate-200"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-emerald-500 bg-emerald-50' 
                  : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              <input {...getInputProps()} />
              <div className="text-4xl mb-2">🖼️</div>
              <p className="text-sm text-slate-600">
                {isDragActive 
                  ? 'Bild hier ablegen...' 
                  : 'Bild hierher ziehen oder klicken zum Auswählen'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                JPG, PNG oder WebP, max. 2MB
              </p>
            </div>
          )}
        </div>

        {/* Toggles */}
        <div className="p-6 flex gap-8">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_required}
              onChange={(e) => setFormData(prev => ({ ...prev, is_required: e.target.checked }))}
              className="w-5 h-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
            />
            <span className="text-sm text-slate-700">Pflichtfrage</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="w-5 h-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
            />
            <span className="text-sm text-slate-700">Aktiv (im Frontend sichtbar)</span>
          </label>
        </div>

        {/* Optional Text Input */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                📝 Zusätzliches Textfeld
              </label>
              <p className="text-xs text-slate-500">
                Zeigt ein optionales Textfeld nach der Hauptantwort
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allow_text_input}
                onChange={(e) => setFormData(prev => ({ ...prev, allow_text_input: e.target.checked }))}
                className="sr-only peer"
                data-testid="admin-question-text-input-toggle"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {formData.allow_text_input && (
            <div className="space-y-4 pl-4 border-l-2 border-emerald-200">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Überschrift
                </label>
                <input
                  type="text"
                  value={formData.text_input_label}
                  onChange={(e) => setFormData(prev => ({ ...prev, text_input_label: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  data-testid="admin-question-text-input-label"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Placeholder
                </label>
                <input
                  type="text"
                  value={formData.text_input_placeholder}
                  onChange={(e) => setFormData(prev => ({ ...prev, text_input_placeholder: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  data-testid="admin-question-text-input-placeholder"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          data-testid="admin-question-submit-button"
          className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Speichern...' : isEditing ? 'Änderungen speichern' : 'Frage erstellen'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          data-testid="admin-question-cancel-button"
          className="px-6 py-3 text-slate-600 hover:text-slate-800"
        >
          Abbrechen
        </button>
      </div>
    </form>
  )
}

