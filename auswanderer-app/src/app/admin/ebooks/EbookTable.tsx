'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
import type { Ebook } from '@/types/ebooks'

// ============================================
// Types
// ============================================

interface EbookTableProps {
  ebooks: Ebook[]
}

// ============================================
// Sortable Row Component
// ============================================

interface SortableRowProps {
  ebook: Ebook
  onToggleActive: (id: string, isActive: boolean) => void
  onDelete: (id: string) => void
  isUpdating: boolean
}

function SortableRow({ ebook, onToggleActive, onDelete, isUpdating }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ebook.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(2).replace('.', ',') + ' €'
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-slate-100 hover:bg-slate-50 ${isDragging ? 'bg-slate-100' : ''}`}
    >
      {/* Drag Handle */}
      <td className="py-3 px-4 w-12">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600"
          title="Zum Sortieren ziehen"
        >
          ⠿
        </button>
      </td>

      {/* Emoji & Title */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{ebook.emoji}</span>
          <div>
            <div className="font-medium text-slate-800">{ebook.title}</div>
            {ebook.subtitle && (
              <div className="text-sm text-slate-500">{ebook.subtitle}</div>
            )}
            <div className="text-xs text-slate-400 mt-0.5">/{ebook.slug}</div>
          </div>
        </div>
      </td>

      {/* Price */}
      <td className="py-3 px-4">
        <span className="font-medium text-slate-700">
          {formatPrice(ebook.price)}
        </span>
      </td>

      {/* Type */}
      <td className="py-3 px-4">
        {ebook.is_bundle ? (
          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
            Bundle
          </span>
        ) : (
          <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
            E-Book
          </span>
        )}
      </td>

      {/* Status */}
      <td className="py-3 px-4">
        <button
          onClick={() => onToggleActive(ebook.id, !ebook.is_active)}
          disabled={isUpdating}
          className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
            ebook.is_active
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          {ebook.is_active ? '✓ Aktiv' : 'Inaktiv'}
        </button>
      </td>

      {/* PDF Status */}
      <td className="py-3 px-4">
        {ebook.pdf_path ? (
          <span className="text-emerald-600" title={ebook.pdf_path}>✓ PDF</span>
        ) : (
          <span className="text-amber-500" title="Kein PDF hochgeladen">⚠ Fehlt</span>
        )}
      </td>

      {/* Stripe */}
      <td className="py-3 px-4">
        {ebook.stripe_price_id ? (
          <span className="text-emerald-600" title={ebook.stripe_price_id}>✓ Stripe</span>
        ) : (
          <span className="text-amber-500" title="Nicht mit Stripe verknüpft">⚠ Fehlt</span>
        )}
      </td>

      {/* Actions */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/ebooks/${ebook.id}`}
            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
            title="Bearbeiten"
          >
            ✏️
          </Link>
          <button
            onClick={() => {
              if (confirm(`E-Book "${ebook.title}" wirklich löschen?`)) {
                onDelete(ebook.id)
              }
            }}
            disabled={isUpdating}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Löschen"
          >
            🗑️
          </button>
        </div>
      </td>
    </tr>
  )
}

// ============================================
// Main Table Component
// ============================================

export function EbookTable({ ebooks: initialEbooks }: EbookTableProps) {
  const router = useRouter()
  const [ebooks, setEbooks] = useState(initialEbooks)
  const [isUpdating, setIsUpdating] = useState(false)

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle drag end
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    setIsUpdating(true)

    const oldIndex = ebooks.findIndex(e => e.id === active.id)
    const newIndex = ebooks.findIndex(e => e.id === over.id)

    // Optimistic update
    const newOrder = arrayMove(ebooks, oldIndex, newIndex)
    setEbooks(newOrder)

    try {
      const items = newOrder.map((ebook, index) => ({
        id: ebook.id,
        sort_order: index,
      }))

      const response = await fetch('/api/admin/ebooks/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })

      if (!response.ok) {
        throw new Error('Reorder failed')
      }

      router.refresh()
    } catch (error) {
      console.error('Reorder error:', error)
      // Revert on error
      setEbooks(initialEbooks)
      alert('Fehler beim Sortieren. Bitte erneut versuchen.')
    } finally {
      setIsUpdating(false)
    }
  }, [ebooks, initialEbooks, router])

  // Toggle active status
  const handleToggleActive = useCallback(async (id: string, isActive: boolean) => {
    setIsUpdating(true)

    // Optimistic update
    setEbooks(prev => prev.map(e => 
      e.id === id ? { ...e, is_active: isActive } : e
    ))

    try {
      const response = await fetch(`/api/admin/ebooks/${id}`, {
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
      setEbooks(prev => prev.map(e => 
        e.id === id ? { ...e, is_active: !isActive } : e
      ))
      alert('Fehler beim Aktualisieren. Bitte erneut versuchen.')
    } finally {
      setIsUpdating(false)
    }
  }, [router])

  // Delete ebook
  const handleDelete = useCallback(async (id: string) => {
    setIsUpdating(true)

    try {
      const response = await fetch(`/api/admin/ebooks/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Delete failed')
      }

      setEbooks(prev => prev.filter(e => e.id !== id))
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Fehler beim Löschen. Bitte erneut versuchen.')
    } finally {
      setIsUpdating(false)
    }
  }, [router])

  if (ebooks.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <div className="text-4xl mb-4">📚</div>
        <h3 className="text-lg font-medium text-slate-800 mb-2">
          Noch keine E-Books
        </h3>
        <p className="text-slate-500 mb-4">
          Erstelle dein erstes E-Book, um loszulegen.
        </p>
        <Link
          href="/admin/ebooks/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <span>+</span>
          <span>Neues E-Book erstellen</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase w-12">
                #
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase">
                E-Book
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase">
                Preis
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase">
                Typ
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase">
                Status
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase">
                PDF
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase">
                Stripe
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase w-24">
                Aktionen
              </th>
            </tr>
          </thead>
          <tbody>
            <SortableContext
              items={ebooks.map(e => e.id)}
              strategy={verticalListSortingStrategy}
            >
              {ebooks.map((ebook) => (
                <SortableRow
                  key={ebook.id}
                  ebook={ebook}
                  onToggleActive={handleToggleActive}
                  onDelete={handleDelete}
                  isUpdating={isUpdating}
                />
              ))}
            </SortableContext>
          </tbody>
        </table>
      </DndContext>

      {isUpdating && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
          <div className="bg-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
            <div className="animate-spin h-5 w-5 border-2 border-emerald-600 border-t-transparent rounded-full"></div>
            <span>Wird aktualisiert...</span>
          </div>
        </div>
      )}
    </div>
  )
}

