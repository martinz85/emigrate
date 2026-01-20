'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Ebook, EbookFormData } from '@/types/ebooks'
import { EBOOK_COLORS, EBOOK_EMOJIS } from '@/types/ebooks'

// ============================================
// Types
// ============================================

interface EbookFormProps {
  ebook?: Ebook
  allEbooks?: Ebook[] // For bundle selection
  initialCoverUrl?: string // Signed URL from server
}

// ============================================
// Main Component
// ============================================

export function EbookForm({ ebook, allEbooks = [], initialCoverUrl }: EbookFormProps) {
  const router = useRouter()
  const isEditing = !!ebook

  // Form state
  const [formData, setFormData] = useState<EbookFormData>({
    slug: ebook?.slug || '',
    title: ebook?.title || '',
    subtitle: ebook?.subtitle || '',
    description: ebook?.description || '',
    long_description: ebook?.long_description || '',
    price: ebook ? ebook.price / 100 : 0, // Convert cents to euros for display
    pages: ebook?.pages || undefined,
    reading_time: ebook?.reading_time || '',
    chapters: ebook?.chapters || [],
    features: ebook?.features || [],
    color: ebook?.color || 'from-teal-500 to-emerald-500',
    emoji: ebook?.emoji || '📚',
    is_bundle: ebook?.is_bundle || false,
    bundle_items: ebook?.bundle_items || [],
    is_active: ebook?.is_active ?? true,
  })

  // File upload state
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [pdfPath, setPdfPath] = useState(ebook?.pdf_path || '')
  const [coverPath, setCoverPath] = useState(ebook?.cover_path || '')
  
  // FIX: Track object URL to prevent memory leak
  const coverObjectUrlRef = useRef<string | null>(null)

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Array field handlers
  const [newChapter, setNewChapter] = useState('')
  const [newFeature, setNewFeature] = useState('')

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[äöüß]/g, char => ({ 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' }[char] || char))
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  // Handle title change and auto-generate slug
  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      // Only auto-generate slug if empty or user hasn't manually edited it
      slug: prev.slug === '' || prev.slug === generateSlug(prev.title) 
        ? generateSlug(title) 
        : prev.slug,
    }))
  }

  // Add chapter
  const addChapter = () => {
    if (newChapter.trim()) {
      setFormData(prev => ({
        ...prev,
        chapters: [...prev.chapters, newChapter.trim()],
      }))
      setNewChapter('')
    }
  }

  // Remove chapter
  const removeChapter = (index: number) => {
    setFormData(prev => ({
      ...prev,
      chapters: prev.chapters.filter((_, i) => i !== index),
    }))
  }

  // Add feature
  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }))
      setNewFeature('')
    }
  }

  // Remove feature
  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }))
  }

  // Toggle bundle item
  const toggleBundleItem = (slug: string) => {
    setFormData(prev => ({
      ...prev,
      bundle_items: prev.bundle_items?.includes(slug)
        ? prev.bundle_items.filter(s => s !== slug)
        : [...(prev.bundle_items || []), slug],
    }))
  }

  // Upload file
  const uploadFile = useCallback(async (ebookId: string, file: File, type: 'pdf' | 'cover') => {
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)
    formDataUpload.append('type', type)
    formDataUpload.append('ebookId', ebookId)

    const response = await fetch('/api/admin/ebooks/upload', {
      method: 'POST',
      body: formDataUpload,
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || `Fehler beim Hochladen (${type})`)
    }

    const data = await response.json()
    return data.path
  }, [])

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Prepare payload (convert price to cents)
      const payload = {
        ...formData,
        price: Math.round(formData.price * 100), // Convert euros to cents
        subtitle: formData.subtitle || null,
        long_description: formData.long_description || null,
        pages: formData.pages || null,
        reading_time: formData.reading_time || null,
        pdf_path: pdfPath || null,
        cover_path: coverPath || null,
      }

      // Create or update ebook
      const url = isEditing 
        ? `/api/admin/ebooks/${ebook.id}`
        : '/api/admin/ebooks'

      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Speichern')
      }

      const savedEbook = data.data
      const ebookId = savedEbook.id

      // Upload files if selected
      if (pdfFile || coverFile) {
        setIsUploading(true)
        
        if (pdfFile) {
          const newPdfPath = await uploadFile(ebookId, pdfFile, 'pdf')
          setPdfPath(newPdfPath)
        }

        if (coverFile) {
          const newCoverPath = await uploadFile(ebookId, coverFile, 'cover')
          setCoverPath(newCoverPath)
        }

        setIsUploading(false)
      }

      // Navigate back to list
      router.push(`/admin/ebooks?updated=${Date.now()}`)
      router.refresh()
    } catch (err) {
      console.error('Submit error:', err)
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern')
    } finally {
      setIsSubmitting(false)
      setIsUploading(false)
    }
  }

  // FIX: Cleanup object URL on unmount or when file changes
  useEffect(() => {
    return () => {
      if (coverObjectUrlRef.current) {
        URL.revokeObjectURL(coverObjectUrlRef.current)
      }
    }
  }, [])

  // Get cover preview URL - using signed URL for private bucket
  const getCoverUrl = useCallback(() => {
    if (coverFile) {
      // Revoke previous object URL to prevent memory leak
      if (coverObjectUrlRef.current) {
        URL.revokeObjectURL(coverObjectUrlRef.current)
      }
      const newUrl = URL.createObjectURL(coverFile)
      coverObjectUrlRef.current = newUrl
      return newUrl
    }
    // FIX: Use signed URL passed from server (private bucket)
    if (initialCoverUrl) {
      return initialCoverUrl
    }
    return null
  }, [coverFile, initialCoverUrl])

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Grundinformationen</h2>
        
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Titel *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="z.B. Der komplette Auswanderer-Guide"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Slug * <span className="text-slate-400 font-normal">(URL-freundlich)</span>
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-sm"
              placeholder="z.B. kompletter-guide"
              pattern="[a-z0-9-]+"
              required
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Untertitel
            </label>
            <input
              type="text"
              value={formData.subtitle || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="z.B. Ausführliche Langversion"
            />
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Kurzbeschreibung * <span className="text-slate-400 font-normal">(für Karten)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              rows={2}
              placeholder="Alles was du wissen musst, von der Entscheidung bis zum Ankommen."
              required
            />
          </div>

          {/* Long Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Ausführliche Beschreibung
            </label>
            <textarea
              value={formData.long_description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, long_description: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              rows={5}
              placeholder="Detaillierte Beschreibung für die Detail-Seite..."
            />
          </div>
        </div>
      </div>

      {/* Pricing & Details */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Preis & Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Preis (€) *
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Pages */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Seitenzahl
            </label>
            <input
              type="number"
              value={formData.pages || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, pages: parseInt(e.target.value) || undefined }))}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              min="1"
            />
          </div>

          {/* Reading Time */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Lesezeit
            </label>
            <input
              type="text"
              value={formData.reading_time || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, reading_time: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="z.B. 6-8 Stunden"
            />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Erscheinungsbild</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Emoji */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Emoji *
            </label>
            <div className="flex gap-2 flex-wrap">
              {EBOOK_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, emoji }))}
                  className={`text-2xl p-2 rounded-lg border-2 transition-colors ${
                    formData.emoji === emoji
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Farbe *
            </label>
            <select
              value={formData.color}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {EBOOK_COLORS.map(color => (
                <option key={color.value} value={color.value}>
                  {color.label}
                </option>
              ))}
            </select>
            <div className={`mt-2 h-8 rounded-lg bg-gradient-to-r ${formData.color}`}></div>
          </div>
        </div>
      </div>

      {/* Chapters */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Kapitel</h2>
        
        <div className="space-y-2 mb-4">
          {formData.chapters.map((chapter, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-slate-400 w-6">{index + 1}.</span>
              <span className="flex-1 text-slate-700">{chapter}</span>
              <button
                type="button"
                onClick={() => removeChapter(index)}
                className="p-1 text-slate-400 hover:text-red-500"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={newChapter}
            onChange={(e) => setNewChapter(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addChapter())}
            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="Neues Kapitel hinzufügen..."
          />
          <button
            type="button"
            onClick={addChapter}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
          >
            +
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Features <span className="text-slate-400 font-normal">(Bullet-Points)</span></h2>
        
        <div className="space-y-2 mb-4">
          {formData.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span>
              <span className="flex-1 text-slate-700">{feature}</span>
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="p-1 text-slate-400 hover:text-red-500"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="Neues Feature hinzufügen..."
          />
          <button
            type="button"
            onClick={addFeature}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
          >
            +
          </button>
        </div>
      </div>

      {/* Files */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Dateien</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PDF Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              PDF-Datei {!isEditing && '*'}
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:border-emerald-300 transition-colors">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                className="hidden"
                id="pdf-upload"
              />
              <label htmlFor="pdf-upload" className="cursor-pointer">
                {pdfFile ? (
                  <div className="text-emerald-600">
                    <span className="text-2xl">📄</span>
                    <p className="mt-2">{pdfFile.name}</p>
                    <p className="text-xs text-slate-400">
                      {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : pdfPath ? (
                  <div className="text-emerald-600">
                    <span className="text-2xl">✓</span>
                    <p className="mt-2">PDF vorhanden</p>
                    <p className="text-xs text-slate-400">Klicken zum Ersetzen</p>
                  </div>
                ) : (
                  <div className="text-slate-400">
                    <span className="text-2xl">📄</span>
                    <p className="mt-2">PDF hochladen</p>
                    <p className="text-xs">Max. 50 MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Cover Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Cover-Bild <span className="text-slate-400">(optional)</span>
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:border-emerald-300 transition-colors">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                className="hidden"
                id="cover-upload"
              />
              <label htmlFor="cover-upload" className="cursor-pointer">
                {getCoverUrl() ? (
                  <div>
                    <img 
                      src={getCoverUrl()!} 
                      alt="Cover" 
                      className="max-h-32 mx-auto rounded"
                    />
                    <p className="text-xs text-slate-400 mt-2">Klicken zum Ersetzen</p>
                  </div>
                ) : (
                  <div className="text-slate-400">
                    <span className="text-2xl">🖼️</span>
                    <p className="mt-2">Cover hochladen</p>
                    <p className="text-xs">JPG, PNG, WebP (max. 5 MB)</p>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Bundle Settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Bundle-Einstellungen</h2>
        
        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            id="is-bundle"
            checked={formData.is_bundle}
            onChange={(e) => setFormData(prev => ({ ...prev, is_bundle: e.target.checked }))}
            className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
          />
          <label htmlFor="is-bundle" className="text-slate-700">
            Dies ist ein Bundle (enthält mehrere E-Books)
          </label>
        </div>

        {formData.is_bundle && (
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-sm text-slate-600 mb-3">
              Wähle die E-Books, die in diesem Bundle enthalten sind:
            </p>
            <div className="space-y-2">
              {allEbooks
                .filter(e => e.id !== ebook?.id && !e.is_bundle)
                .map(e => (
                  <label key={e.id} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.bundle_items?.includes(e.slug) || false}
                      onChange={() => toggleBundleItem(e.slug)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{e.emoji} {e.title}</span>
                  </label>
                ))}
            </div>
            {allEbooks.filter(e => e.id !== ebook?.id && !e.is_bundle).length === 0 && (
              <p className="text-slate-400 text-sm italic">
                Keine anderen E-Books verfügbar. Erstelle zuerst einzelne E-Books.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Status */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Status</h2>
        
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is-active"
            checked={formData.is_active}
            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
            className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
          />
          <label htmlFor="is-active" className="text-slate-700">
            Aktiv (sichtbar für Kunden)
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {(isSubmitting || isUploading) && (
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          )}
          {isSubmitting ? 'Speichern...' : isUploading ? 'Hochladen...' : (isEditing ? 'Speichern' : 'Erstellen')}
        </button>
        <Link
          href="/admin/ebooks"
          className="px-6 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
        >
          Abbrechen
        </Link>
      </div>
    </form>
  )
}

