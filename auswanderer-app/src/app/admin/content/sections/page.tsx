'use client'

import { useEffect, useState } from 'react'
import { AdminHeader } from '../../components/AdminHeader'
import { AdminCard } from '../../components/AdminCard'
import Link from 'next/link'

interface ContentSection {
  section: string
  label: string
  description: string
  itemCount: number
}

export default function ContentSectionsPage() {
  const [sections, setSections] = useState<ContentSection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSections()
  }, [])

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/admin/content/sections')
      if (response.ok) {
        const data = await response.json()
        setSections(data.sections || [])
      }
    } catch (error) {
      console.error('Error fetching sections:', error)
    } finally {
      setLoading(false)
    }
  }

  const contentSections: ContentSection[] = [
    {
      section: 'header',
      label: 'Header',
      description: 'Logo, Navigation und CTA-Button Texte',
      itemCount: sections.find(s => s.section === 'header')?.itemCount || 0
    },
    {
      section: 'footer',
      label: 'Footer',
      description: 'Links, Copyright und rechtliche Hinweise',
      itemCount: sections.find(s => s.section === 'footer')?.itemCount || 0
    },
    {
      section: 'hero',
      label: 'Hero Section',
      description: 'Hauptüberschrift, Subheadline und CTA-Buttons',
      itemCount: sections.find(s => s.section === 'hero')?.itemCount || 0
    },
    {
      section: 'how_it_works',
      label: 'So funktioniert\'s',
      description: '4-Schritte Erklärung der Funktionsweise',
      itemCount: sections.find(s => s.section === 'how_it_works')?.itemCount || 0
    },
    {
      section: 'founder_story',
      label: 'Gründer Story',
      description: 'Persönliche Geschichte des Gründers',
      itemCount: sections.find(s => s.section === 'founder_story')?.itemCount || 0
    },
    {
      section: 'faq',
      label: 'FAQ',
      description: 'Häufig gestellte Fragen und Antworten',
      itemCount: sections.find(s => s.section === 'faq')?.itemCount || 0
    },
    {
      section: 'loading_screen',
      label: 'Loading Screen',
      description: 'Ladebildschirm mit Fun Facts',
      itemCount: sections.find(s => s.section === 'loading_screen')?.itemCount || 0
    }
  ]

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Content Management"
        description="Frontend-Texte zentral bearbeiten"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Content', href: '/admin/content' },
          { label: 'Sections' }
        ]}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-slate-200 rounded-lg h-32"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contentSections.map((section) => (
            <AdminCard key={section.section} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 mb-1">
                    {section.label}
                  </h3>
                  <p className="text-sm text-slate-600 mb-2">
                    {section.description}
                  </p>
                  <div className="text-xs text-slate-500">
                    {section.itemCount || 0} Einträge
                  </div>
                </div>
                <div className="text-2xl">
                  📝
                </div>
              </div>

              <Link
                href={`/admin/content/sections/${section.section}`}
                className="w-full btn-primary text-center block"
              >
                Bearbeiten
              </Link>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  )
}
