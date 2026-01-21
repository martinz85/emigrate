'use client'

import { Monitor, Image, Play, X } from 'lucide-react'
import { AdminCard } from '../../components/AdminCard'
import { getMediaUrl, isImageMedia, isGifMedia, isVideoMedia } from '@/types/media'
import type { SiteMedia } from '@/types/media'

interface MediaAssignmentProps {
  media: SiteMedia[]
  onAssignmentChanged: () => void
}

export function MediaAssignment({ media, onAssignmentChanged }: MediaAssignmentProps) {
  const getAssignedMedia = (section: 'hero' | 'loading_screen') => {
    return media.find(m => m.usage_section === section && m.is_active)
  }

  const handleUnassign = async (section: 'hero' | 'loading_screen') => {
    const assignedMedia = getAssignedMedia(section)
    if (!assignedMedia) return

    try {
      const response = await fetch(`/api/admin/content/media/${assignedMedia.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usage_section: null }),
      })

      if (response.ok) {
        onAssignmentChanged()
      } else {
        alert('Fehler beim Entfernen der Zuweisung')
      }
    } catch (error) {
      console.error('Unassign error:', error)
      alert('Netzwerkfehler beim Entfernen')
    }
  }

  const getSectionInfo = (section: 'hero' | 'loading_screen') => {
    switch (section) {
      case 'hero':
        return {
          title: 'Hero Section',
          description: 'Wird auf der Startseite als Hauptbild/Video angezeigt',
          icon: Image
        }
      case 'loading_screen':
        return {
          title: 'Loading Screen',
          description: 'Wird während der Analyse als Animation gezeigt',
          icon: Monitor
        }
    }
  }

  const sections: ('hero' | 'loading_screen')[] = ['hero', 'loading_screen']

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {sections.map((section) => {
        const sectionInfo = getSectionInfo(section)
        const assignedMedia = getAssignedMedia(section)
        const Icon = sectionInfo.icon

        return (
          <AdminCard key={section} className="relative">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Icon className="w-6 h-6 text-primary-600" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 mb-1">
                  {sectionInfo.title}
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  {sectionInfo.description}
                </p>

                {assignedMedia ? (
                  <div className="space-y-3">
                    {/* Media Preview */}
                    <div className="relative w-full h-24 bg-slate-100 rounded-lg overflow-hidden">
                      {isVideoMedia(assignedMedia) ? (
                        <div className="relative w-full h-full">
                          <video
                            src={getMediaUrl(assignedMedia.file_path)}
                            className="w-full h-full object-cover"
                            muted
                            preload="metadata"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <Play className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      ) : (
                        <img
                          src={getMediaUrl(assignedMedia.file_path)}
                          alt={assignedMedia.metadata?.original_name || assignedMedia.file_path}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Media Info */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-600">
                        <div className="font-medium">
                          {assignedMedia.metadata?.original_name || assignedMedia.file_path.split('/').pop()}
                        </div>
                        <div className="text-xs">
                          {assignedMedia.file_type.toUpperCase()} • {Math.round(assignedMedia.file_size / 1024)} KB
                        </div>
                      </div>

                      <button
                        onClick={() => handleUnassign(section)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Zuweisung entfernen"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Icon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Noch kein Medium zugewiesen</p>
                    <p className="text-xs mt-1">
                      Verwenden Sie die Media-Bibliothek unten
                    </p>
                  </div>
                )}
              </div>
            </div>
          </AdminCard>
        )
      })}
    </div>
  )
}
