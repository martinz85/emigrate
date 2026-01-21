'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminHeader } from '../../components/AdminHeader'
import { AdminCard } from '../../components/AdminCard'
import { MediaUpload } from './MediaUpload'
import { MediaTable } from './MediaTable'
import { MediaAssignment } from './MediaAssignment'
import type { SiteMedia } from '@/types/media'

export default function MediaManagementPage() {
  const [media, setMedia] = useState<SiteMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'image' | 'gif' | 'video'>('all')

  // Fetch all media
  const fetchMedia = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.set('type', filter)
      }

      const response = await fetch(`/api/admin/content/media?${params}`)
      if (response.ok) {
        const data = await response.json()
        setMedia(data.media || [])
      } else {
        console.error('Failed to fetch media')
      }
    } catch (error) {
      console.error('Error fetching media:', error)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  // Handle successful upload
  const handleUploadSuccess = () => {
    fetchMedia() // Refresh the list
  }

  // Handle media deletion
  const handleMediaDeleted = (deletedId: string) => {
    setMedia(prev => prev.filter(item => item.id !== deletedId))
  }

  // Handle media assignment change
  const handleAssignmentChanged = () => {
    fetchMedia() // Refresh to show updated assignments
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Media Management"
        description="GIF, MP4 und Bilder hochladen und verwalten"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Content', href: '/admin/content' },
          { label: 'Media' }
        ]}
      />

      {/* Upload Section */}
      <AdminCard>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Neue Datei hochladen
          </h3>
          <p className="text-sm text-slate-600">
            Unterstützte Formate: GIF (max. 10MB), MP4 (max. 20MB), Bilder (max. 5MB)
          </p>
        </div>
        <MediaUpload onSuccess={handleUploadSuccess} />
      </AdminCard>

      {/* Section Assignment Overview */}
      <MediaAssignment
        media={media}
        onAssignmentChanged={handleAssignmentChanged}
      />

      {/* Media Library */}
      <AdminCard>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Media-Bibliothek
            </h3>
            <p className="text-sm text-slate-600">
              {media.length} Dateien • {media.filter(m => m.usage_section).length} zugewiesen
            </p>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-1 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Alle Typen</option>
              <option value="image">Bilder</option>
              <option value="gif">GIFs</option>
              <option value="video">Videos</option>
            </select>
          </div>
        </div>

        <MediaTable
          media={media}
          loading={loading}
          onMediaDeleted={handleMediaDeleted}
          onAssignmentChanged={handleAssignmentChanged}
        />
      </AdminCard>
    </div>
  )
}
