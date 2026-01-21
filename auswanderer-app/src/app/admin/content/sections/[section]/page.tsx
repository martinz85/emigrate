'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AdminHeader } from '../../../components/AdminHeader'
import { AdminCard } from '../../../components/AdminCard'
import { z } from 'zod'

const contentSchema = z.object({
  content: z.string().min(1, 'Darf nicht leer sein').max(500, 'Maximal 500 Zeichen'),
})

interface ContentItem {
  id: string
  section: string
  key: string
  content: string
  content_type: string
  label: string
  description: string
}

export default function ContentSectionEditPage() {
  const params = useParams()
  const router = useRouter()
  const section = params.section as string

  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchSectionContent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section])

  const fetchSectionContent = async () => {
    try {
      const response = await fetch(`/api/admin/content/sections/${section}`)
      if (response.ok) {
        const data = await response.json()
        setContent(data.content || [])
      } else {
        console.error('Failed to fetch section content')
      }
    } catch (error) {
      console.error('Error fetching section content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleContentChange = (key: string, newContent: string) => {
    setContent(prev =>
      prev.map(item =>
        item.key === key ? { ...item, content: newContent } : item
      )
    )

    // Clear error for this field
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[key]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    content.forEach(item => {
      try {
        contentSchema.parse({ content: item.content })
      } catch (error) {
        if (error instanceof z.ZodError) {
          newErrors[item.key] = error.errors[0].message
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setSaving(true)
    try {
      const updates = content.map(item => ({
        key: item.key,
        content: item.content,
        content_type: item.content_type,
        label: item.label,
        description: item.description,
      }))

      const response = await fetch(`/api/admin/content/sections/${section}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        // Redirect back to sections overview
        router.push('/admin/content/sections')
      } else {
        const errorData = await response.json()
        console.error('Failed to save content:', errorData)
        // Show error to user
        alert(`Fehler beim Speichern: ${errorData.error || 'Unbekannter Fehler'}`)
      }
    } catch (error) {
      console.error('Error saving content:', error)
      alert('Netzwerkfehler beim Speichern. Bitte versuchen Sie es erneut.')
    } finally {
      setSaving(false)
    }
  }

  const getSectionTitle = (section: string) => {
    const titles: Record<string, string> = {
      header: 'Header',
      footer: 'Footer',
      hero: 'Hero Section',
      how_it_works: 'So funktioniert\'s',
      founder_story: 'Gründer Story',
      faq: 'FAQ',
      loading_screen: 'Loading Screen'
    }
    return titles[section] || section
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminHeader
          title={`${getSectionTitle(section)} bearbeiten`}
          description="Texte aktualisieren"
        />
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-slate-200 rounded-lg h-24"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title={`${getSectionTitle(section)} bearbeiten`}
        description="Texte zentral bearbeiten"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Content', href: '/admin/content' },
          { label: 'Sections', href: '/admin/content/sections' },
          { label: getSectionTitle(section) }
        ]}
      />

      <AdminCard>
        <div className="space-y-6">
          {content.map((item) => (
            <div key={item.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-900">
                  {item.label || item.key}
                </label>
                <span className="text-xs text-slate-500">
                  {item.content.length}/500 Zeichen
                </span>
              </div>

              {item.description && (
                <p className="text-sm text-slate-600">{item.description}</p>
              )}

              {item.content_type === 'json' ? (
                <div>
                  <textarea
                    value={
                      (() => {
                        try {
                          return JSON.stringify(JSON.parse(item.content), null, 2)
                        } catch {
                          return item.content
                        }
                      })()
                    }
                    onChange={(e) => {
                      const value = e.target.value
                      try {
                        JSON.parse(value)
                        handleContentChange(item.key, value)
                        setErrors(prev => {
                          const newErrors = { ...prev }
                          delete newErrors[item.key]
                          return newErrors
                        })
                      } catch (jsonError) {
                        handleContentChange(item.key, value)
                        setErrors(prev => ({
                          ...prev,
                          [item.key]: 'Ungültiges JSON-Format'
                        }))
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[200px] font-mono text-sm ${
                      errors[item.key] ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="JSON content"
                  />
                  {item.key === 'items' && (
                    <p className="text-xs text-slate-500 mt-1">
                      Format: [&#123;&quot;question&quot;: &quot;Frage?&quot;, &quot;answer&quot;: &quot;Antwort...&quot;&#125;]
                    </p>
                  )}
                </div>
              ) : (
                <>
                  {item.content.length > 100 ? (
                    <textarea
                      value={item.content}
                      onChange={(e) => handleContentChange(item.key, e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px] ${
                        errors[item.key] ? 'border-red-500' : 'border-slate-300'
                      }`}
                      rows={4}
                    />
                  ) : (
                    <input
                      type="text"
                      value={item.content}
                      onChange={(e) => handleContentChange(item.key, e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors[item.key] ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                  )}
                </>
              )}

              {errors[item.key] && (
                <p className="text-sm text-red-600">{errors[item.key]}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-4 mt-8 pt-6 border-t border-slate-200">
          <button
            onClick={() => router.push('/admin/content/sections')}
            className="btn-secondary"
            disabled={saving}
          >
            Zurück
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? 'Speichere...' : 'Speichern'}
          </button>
        </div>
      </AdminCard>
    </div>
  )
}
