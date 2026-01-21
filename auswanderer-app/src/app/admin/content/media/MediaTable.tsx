'use client'

import { useState } from 'react'
import { Play, Trash2, AlertTriangle, Loader2, Image, Video, FileImage } from 'lucide-react'
import { formatFileSize, getMediaUrl, isImageMedia, isGifMedia, isVideoMedia } from '@/types/media'
import type { SiteMedia } from '@/types/media'

interface MediaTableProps {
  media: SiteMedia[]
  loading: boolean
  onMediaDeleted: (id: string) => void
  onAssignmentChanged: () => void
}

export function MediaTable({ media, loading, onMediaDeleted, onAssignmentChanged }: MediaTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (mediaItem: SiteMedia) => {
    if (!confirm(`Möchten Sie "${mediaItem.metadata?.original_name || mediaItem.file_path}" wirklich löschen?`)) {
      return
    }

    setDeletingId(mediaItem.id)

    try {
      const response = await fetch(`/api/admin/content/media/${mediaItem.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onMediaDeleted(mediaItem.id)
      } else {
        alert('Fehler beim Löschen der Datei')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Netzwerkfehler beim Löschen')
    } finally {
      setDeletingId(null)
    }
  }

  const handleAssignmentChange = async (mediaItem: SiteMedia, newSection: 'hero' | 'loading_screen' | null) => {
    try {
      const response = await fetch(`/api/admin/content/media/${mediaItem.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usage_section: newSection }),
      })

      if (response.ok) {
        onAssignmentChanged()
      } else {
        alert('Fehler beim Zuweisen der Section')
      }
    } catch (error) {
      console.error('Assignment error:', error)
      alert('Netzwerkfehler beim Zuweisen')
    }
  }

  const getTypeIcon = (mediaItem: SiteMedia) => {
    if (isVideoMedia(mediaItem)) return <Video className="w-4 h-4" />
    if (isGifMedia(mediaItem)) return <FileImage className="w-4 h-4" />
    if (isImageMedia(mediaItem)) return <Image className="w-4 h-4" />
    return <FileImage className="w-4 h-4" />
  }

  const getSectionLabel = (section: string | null) => {
    switch (section) {
      case 'hero': return 'Hero Section'
      case 'loading_screen': return 'Loading Screen'
      default: return 'Nicht zugewiesen'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center gap-4 p-4 border border-slate-200 rounded-lg">
            <div className="w-16 h-16 bg-slate-200 rounded"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-3 bg-slate-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (media.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <FileImage className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Noch keine Medien hochgeladen</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {media.map((mediaItem) => (
        <div key={mediaItem.id} className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          {/* Thumbnail/Preview */}
          <div className="relative w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
            {isVideoMedia(mediaItem) ? (
              <div className="relative w-full h-full">
                <video
                  src={getMediaUrl(mediaItem.file_path)}
                  className="w-full h-full object-cover"
                  muted
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Play className="w-6 h-6 text-white" />
                </div>
              </div>
            ) : (
              <img
                src={getMediaUrl(mediaItem.file_path)}
                alt={mediaItem.metadata?.original_name || mediaItem.file_path}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            )}
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {getTypeIcon(mediaItem)}
              <h4 className="font-medium text-slate-900 truncate">
                {mediaItem.metadata?.original_name || mediaItem.file_path.split('/').pop()}
              </h4>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span>{mediaItem.file_type.toUpperCase()}</span>
              <span>{formatFileSize(mediaItem.file_size)}</span>
              <span>{new Date(mediaItem.uploaded_at).toLocaleDateString('de-DE')}</span>
            </div>
          </div>

          {/* Section Assignment */}
          <div className="min-w-[140px]">
            <select
              value={mediaItem.usage_section || ''}
              onChange={(e) => handleAssignmentChange(mediaItem, e.target.value as any || null)}
              className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">Nicht zugewiesen</option>
              <option value="hero">Hero Section</option>
              <option value="loading_screen">Loading Screen</option>
            </select>
            <div className="text-xs text-slate-500 mt-1">
              {getSectionLabel(mediaItem.usage_section)}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {mediaItem.usage_section && (
              <div className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
                Aktiv
              </div>
            )}

            <button
              onClick={() => handleDelete(mediaItem)}
              disabled={deletingId === mediaItem.id}
              className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
              title="Löschen"
            >
              {deletingId === mediaItem.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
