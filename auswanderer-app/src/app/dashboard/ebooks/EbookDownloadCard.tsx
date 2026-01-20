'use client'

import { useState } from 'react'
import type { Ebook as DbEbook } from '@/types/ebooks'

interface EbookDownloadCardProps {
  ebook: DbEbook
  isPro: boolean
  purchasedAt?: string
}

export function EbookDownloadCard({ ebook, isPro, purchasedAt }: EbookDownloadCardProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    if (!ebook.pdf_path) {
      setError('PDF noch nicht verfügbar')
      return
    }

    setError(null)
    setIsDownloading(true)

    try {
      const response = await fetch(`/api/ebooks/${ebook.id}/download`)

      if (!response.ok) {
        // Try to parse error message from JSON
        try {
          const data = await response.json()
          throw new Error(data.error || 'Download fehlgeschlagen')
        } catch {
          throw new Error('Download fehlgeschlagen')
        }
      }

      // Response is the PDF file - convert to blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      // Create temporary link and click it to trigger download
      const link = document.createElement('a')
      link.href = url
      link.download = `${ebook.slug}.pdf`
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download error:', err)
      setError(err instanceof Error ? err.message : 'Download fehlgeschlagen')
    } finally {
      setIsDownloading(false)
    }
  }

  const formattedDate = purchasedAt
    ? new Date(purchasedAt).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : null

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header with gradient */}
      <div className={`h-24 bg-gradient-to-br ${ebook.color} flex items-center justify-center`}>
        <span className="text-5xl">{ebook.emoji}</span>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-lg text-slate-800 mb-1">
          {ebook.title}
        </h3>
        {ebook.subtitle && (
          <p className="text-sm text-slate-500 mb-3">
            {ebook.subtitle}
          </p>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap gap-3 text-xs text-slate-400 mb-4">
          {ebook.pages && (
            <span className="flex items-center gap-1">
              📄 {ebook.pages} Seiten
            </span>
          )}
          {ebook.reading_time && (
            <span className="flex items-center gap-1">
              ⏱️ {ebook.reading_time}
            </span>
          )}
        </div>

        {/* Access info */}
        <div className="text-xs text-slate-500 mb-4">
          {isPro ? (
            <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-600 px-2 py-1 rounded-full">
              ⭐ PRO-Zugang
            </span>
          ) : formattedDate ? (
            <span>Gekauft am {formattedDate}</span>
          ) : null}
        </div>

        {/* Error message */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded mb-3">
            {error}
          </div>
        )}

        {/* Download button */}
        <button
          onClick={handleDownload}
          disabled={isDownloading || !ebook.pdf_path}
          className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 disabled:opacity-50"
        >
          {isDownloading ? (
            <>
              <span className="animate-spin">⏳</span>
              Wird geladen...
            </>
          ) : !ebook.pdf_path ? (
            <>
              <span>🔒</span>
              Bald verfügbar
            </>
          ) : (
            <>
              <span>📥</span>
              PDF herunterladen
            </>
          )}
        </button>
      </div>
    </div>
  )
}

