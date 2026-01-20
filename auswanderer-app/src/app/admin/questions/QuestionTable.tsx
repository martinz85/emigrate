'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { AnalysisQuestionWithCategory, QuestionCategory } from '@/types/questions'

// ============================================
// Props
// ============================================

interface QuestionTableProps {
  questions: AnalysisQuestionWithCategory[]
  categories: QuestionCategory[]
}

// ============================================
// Question Type Labels
// ============================================

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  boolean: { label: 'Ja/Nein', color: 'bg-blue-100 text-blue-700' },
  rating: { label: 'Rating 1-5', color: 'bg-emerald-100 text-emerald-700' },
  text: { label: 'Freitext', color: 'bg-amber-100 text-amber-700' },
  select: { label: 'Auswahl', color: 'bg-purple-100 text-purple-700' },
}

// ============================================
// Sortable Row Component
// ============================================

interface SortableRowProps {
  question: AnalysisQuestionWithCategory
  onToggleActive: (id: string, isActive: boolean) => void
  onDelete: (id: string) => void
  isUpdating: boolean
}

function SortableRow({ question, onToggleActive, onDelete, isUpdating }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const typeInfo = TYPE_LABELS[question.question_type] || TYPE_LABELS.rating

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-slate-100 hover:bg-slate-50 ${
        !question.is_active ? 'bg-slate-50 opacity-60' : ''
      }`}
    >
      {/* Drag Handle */}
      <td className="px-4 py-3 w-10">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600"
          title="Zum Sortieren ziehen"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>
      </td>

      {/* Sort Order */}
      <td className="px-4 py-3 w-16 text-center text-sm text-slate-500">
        {question.sort_order}
      </td>

      {/* Question Text */}
      <td className="px-4 py-3">
        <div className="max-w-md">
          <p className="text-sm text-slate-800 line-clamp-2">
            {question.question_text}
          </p>
          {question.help_text && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-1">
              ℹ️ {question.help_text}
            </p>
          )}
        </div>
      </td>

      {/* Category */}
      <td className="px-4 py-3">
        {question.category ? (
          <span className="inline-flex items-center gap-1 text-sm text-slate-600">
            <span>{question.category.icon}</span>
            <span>{question.category.name}</span>
          </span>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        )}
      </td>

      {/* Type */}
      <td className="px-4 py-3">
        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${typeInfo.color}`}>
          {typeInfo.label}
        </span>
      </td>

      {/* Weight */}
      <td className="px-4 py-3 text-center">
        <span className="text-sm font-medium text-slate-700">
          {question.weight.toFixed(2)}
        </span>
      </td>

      {/* Image */}
      <td className="px-4 py-3 text-center">
        {question.image_path ? (
          <span className="text-emerald-500" title="Bild vorhanden">✓</span>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>

      {/* Active Toggle */}
      <td className="px-4 py-3 text-center">
        <button
          onClick={() => onToggleActive(question.id, !question.is_active)}
          disabled={isUpdating}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            question.is_active ? 'bg-emerald-500' : 'bg-slate-300'
          } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={question.is_active ? 'Deaktivieren' : 'Aktivieren'}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              question.is_active ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/questions/${question.id}`}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
            title="Bearbeiten"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Link>
          <button
            onClick={() => {
              if (confirm('Frage wirklich löschen?')) {
                onDelete(question.id)
              }
            }}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="Löschen"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  )
}

// ============================================
// Main Component
// ============================================

export function QuestionTable({ questions: initialQuestions, categories }: QuestionTableProps) {
  const router = useRouter()
  const [questions, setQuestions] = useState(initialQuestions)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [filter, setFilter] = useState<string>('all') // 'all' | 'active' | 'inactive' | category_id

  // Fetch fresh data on mount to ensure latest data is displayed
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/admin/questions', {
          cache: 'no-store'
        })
        if (response.ok) {
          const json = await response.json()
          if (json.data) {
            setQuestions(json.data)
          }
        }
      } catch (err) {
        console.error('Failed to fetch questions:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchQuestions()
  }, []) // Only run on mount

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    if (filter === 'all') return true
    if (filter === 'active') return q.is_active
    if (filter === 'inactive') return !q.is_active
    return q.category_id === filter
  })

  // Handle drag end - reorder
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = questions.findIndex(q => q.id === active.id)
    const newIndex = questions.findIndex(q => q.id === over.id)

    const newQuestions = arrayMove(questions, oldIndex, newIndex)
    
    // Update sort_order for all affected items
    const updatedQuestions = newQuestions.map((q, index) => ({
      ...q,
      sort_order: index + 1,
    }))

    setQuestions(updatedQuestions)
    setIsUpdating(true)

    try {
      const response = await fetch('/api/admin/questions/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: updatedQuestions.map(q => ({
            id: q.id,
            sort_order: q.sort_order,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Reorder failed')
      }

      router.refresh()
    } catch (error) {
      console.error('Reorder error:', error)
      // Revert on error
      setQuestions(initialQuestions)
      alert('Fehler beim Sortieren. Bitte erneut versuchen.')
    } finally {
      setIsUpdating(false)
    }
  }, [questions, initialQuestions, router])

  // Toggle active status
  const handleToggleActive = useCallback(async (id: string, isActive: boolean) => {
    setIsUpdating(true)

    // Optimistic update
    setQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, is_active: isActive } : q
    ))

    try {
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive }),
      })

      if (!response.ok) {
        throw new Error('Update failed')
      }

      router.refresh()
    } catch (error) {
      console.error('Toggle error:', error)
      // Revert on error
      setQuestions(prev => prev.map(q => 
        q.id === id ? { ...q, is_active: !isActive } : q
      ))
      alert('Fehler beim Aktualisieren. Bitte erneut versuchen.')
    } finally {
      setIsUpdating(false)
    }
  }, [router])

  // Delete question
  const handleDelete = useCallback(async (id: string) => {
    setIsUpdating(true)

    try {
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Delete failed')
      }

      setQuestions(prev => prev.filter(q => q.id !== id))
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Fehler beim Löschen. Bitte erneut versuchen.')
    } finally {
      setIsUpdating(false)
    }
  }, [router])

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Filter Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-4">
          <label className="text-sm text-slate-600">Filter:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Alle Fragen</option>
            <option value="active">Nur aktive</option>
            <option value="inactive">Nur inaktive</option>
            <optgroup label="Nach Kategorie">
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </optgroup>
          </select>
          
          {isUpdating && (
            <span className="text-sm text-slate-500 flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Speichern...
            </span>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-emerald-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="ml-3 text-slate-600">Lade Fragen...</span>
        </div>
      )}

      {/* Table */}
      {!isLoading && (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase w-10"></th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase w-16">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Frage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Kategorie</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Typ</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Gewicht</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Bild</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Aktiv</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase w-24">Aktionen</th>
              </tr>
            </thead>
            <SortableContext
              items={filteredQuestions.map(q => q.id)}
              strategy={verticalListSortingStrategy}
            >
              <tbody>
                {filteredQuestions.map((question) => (
                  <SortableRow
                    key={question.id}
                    question={question}
                    onToggleActive={handleToggleActive}
                    onDelete={handleDelete}
                    isUpdating={isUpdating}
                  />
                ))}
              </tbody>
            </SortableContext>
          </table>
        </div>
      </DndContext>
      )}

      {/* Empty State */}
      {!isLoading && filteredQuestions.length === 0 && (
        <div className="p-8 text-center text-slate-500">
          <p>Keine Fragen gefunden.</p>
          <Link
            href="/admin/questions/new"
            className="inline-block mt-4 px-4 py-2 text-emerald-600 hover:text-emerald-700"
          >
            + Erste Frage erstellen
          </Link>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 text-sm text-slate-500">
        {filteredQuestions.length} von {questions.length} Fragen
        {filter !== 'all' && (
          <button
            onClick={() => setFilter('all')}
            className="ml-4 text-emerald-600 hover:text-emerald-700"
          >
            Filter zurücksetzen
          </button>
        )}
      </div>
    </div>
  )
}

