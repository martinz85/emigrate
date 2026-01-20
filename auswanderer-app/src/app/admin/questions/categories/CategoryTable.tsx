'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { QuestionCategory } from '@/types/questions'

// ============================================
// Props
// ============================================

interface CategoryWithCount extends QuestionCategory {
  question_count: number
}

interface CategoryTableProps {
  categories: CategoryWithCount[]
}

// ============================================
// Main Component
// ============================================

export function CategoryTable({ categories: initialCategories }: CategoryTableProps) {
  const router = useRouter()
  const [categories, setCategories] = useState(initialCategories)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showNewForm, setShowNewForm] = useState(false)

  // New category form state
  const [newCategory, setNewCategory] = useState({
    name: '',
    name_key: '',
    icon: '',
    description: '',
  })

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    name_key: '',
    icon: '',
    description: '',
  })

  // Create category
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/questions/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategory.name,
          name_key: newCategory.name_key || null,
          icon: newCategory.icon || null,
          description: newCategory.description || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Fehler beim Erstellen')
      }

      setNewCategory({ name: '', name_key: '', icon: '', description: '' })
      setShowNewForm(false)
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Fehler beim Erstellen')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Start editing
  const startEditing = (category: CategoryWithCount) => {
    setEditingId(category.id)
    setEditForm({
      name: category.name,
      name_key: category.name_key || '',
      icon: category.icon || '',
      description: category.description || '',
    })
  }

  // Save edit
  const handleSaveEdit = async (id: string) => {
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/questions/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          name_key: editForm.name_key || null,
          icon: editForm.icon || null,
          description: editForm.description || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Fehler beim Speichern')
      }

      setEditingId(null)
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Fehler beim Speichern')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete category
  const handleDelete = useCallback(async (id: string, questionCount: number) => {
    if (questionCount > 0) {
      alert(`Diese Kategorie hat noch ${questionCount} Fragen. Bitte erst die Fragen verschieben oder löschen.`)
      return
    }

    if (!confirm('Kategorie wirklich löschen?')) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/questions/categories/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Fehler beim Löschen')
      }

      setCategories(prev => prev.filter(c => c.id !== id))
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Fehler beim Löschen')
    } finally {
      setIsSubmitting(false)
    }
  }, [router])

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* New Category Form */}
      {showNewForm && (
        <form onSubmit={handleCreate} className="p-4 border-b border-slate-200 bg-emerald-50">
          <div className="grid grid-cols-4 gap-4">
            <input
              type="text"
              value={newCategory.icon}
              onChange={(e) => setNewCategory(prev => ({ ...prev, icon: e.target.value }))}
              placeholder="🆕"
              className="px-3 py-2 border border-slate-200 rounded-lg text-center text-2xl"
              maxLength={2}
            />
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Name *"
              required
              className="px-3 py-2 border border-slate-200 rounded-lg"
            />
            <input
              type="text"
              value={newCategory.name_key}
              onChange={(e) => setNewCategory(prev => ({ ...prev, name_key: e.target.value }))}
              placeholder="Key (z.B. financial)"
              className="px-3 py-2 border border-slate-200 rounded-lg"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                Erstellen
              </button>
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                ✕
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Add Button */}
      {!showNewForm && (
        <div className="p-4 border-b border-slate-200">
          <button
            onClick={() => setShowNewForm(true)}
            className="px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
          >
            + Neue Kategorie
          </button>
        </div>
      )}

      {/* Table */}
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase w-16">Icon</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Key</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Beschreibung</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Fragen</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase w-16">Pos.</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase w-32">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id} className="border-b border-slate-100 hover:bg-slate-50">
              {editingId === category.id ? (
                // Edit mode
                <>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={editForm.icon}
                      onChange={(e) => setEditForm(prev => ({ ...prev, icon: e.target.value }))}
                      className="w-12 px-2 py-1 border border-slate-200 rounded text-center text-xl"
                      maxLength={2}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-2 py-1 border border-slate-200 rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={editForm.name_key}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name_key: e.target.value }))}
                      className="w-full px-2 py-1 border border-slate-200 rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-2 py-1 border border-slate-200 rounded"
                    />
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-slate-500">
                    {category.question_count}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-slate-500">
                    {category.sort_order}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(category.id)}
                        disabled={isSubmitting}
                        className="px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 rounded"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </>
              ) : (
                // View mode
                <>
                  <td className="px-4 py-3 text-center text-2xl">
                    {category.icon || '📁'}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {category.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 font-mono">
                    {category.name_key || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {category.description || '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-1 text-xs rounded ${
                      category.question_count > 0 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {category.question_count}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-slate-500">
                    {category.sort_order}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(category)}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                        title="Bearbeiten"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(category.id, category.question_count)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Löschen"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Empty State */}
      {categories.length === 0 && (
        <div className="p-8 text-center text-slate-500">
          <p>Keine Kategorien vorhanden.</p>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 text-sm text-slate-500">
        {categories.length} Kategorien
      </div>
    </div>
  )
}

