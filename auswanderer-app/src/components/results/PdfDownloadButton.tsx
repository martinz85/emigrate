'use client'

import { useState, useRef } from 'react'

interface PdfDownloadButtonProps {
  analysisId: string
}

// Timeout for PDF generation (30 seconds)
const PDF_TIMEOUT_MS = 30000

export function PdfDownloadButton({ analysisId }: PdfDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isDownloadingRef = useRef(false)

  const handleDownload = async () => {
    // Prevent double-clicks
    if (isLoading || isDownloadingRef.current) return
    isDownloadingRef.current = true
    setIsLoading(true)
    setError(null)

    // Timeout controller
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), PDF_TIMEOUT_MS)

    try {
      const response = await fetch(`/api/pdf/${encodeURIComponent(analysisId)}`, {
        signal: controller.signal,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'PDF-Download fehlgeschlagen')
      }

      // Get blob and create download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      // Extract filename from Content-Disposition or use default
      // Note: API currently returns .txt (MVP workaround), will be .pdf in production
      const disposition = response.headers.get('Content-Disposition')
      const contentType = response.headers.get('Content-Type') || ''
      const extension = contentType.includes('pdf') ? 'pdf' : 'txt'
      const filename = disposition?.match(/filename="(.+)"/)?.[1] 
        || `auswanderer-analyse-${new Date().toISOString().split('T')[0]}.${extension}`

      // Trigger download
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Cleanup
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF download error:', err)
      
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Zeitüberschreitung - die PDF-Erstellung dauert zu lange. Bitte versuche es erneut.')
      } else {
        setError(err instanceof Error ? err.message : 'PDF-Download fehlgeschlagen')
      }
    } finally {
      clearTimeout(timeout)
      setIsLoading(false)
      isDownloadingRef.current = false
    }
  }

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={handleDownload}
        disabled={isLoading}
        className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 text-white rounded-xl font-bold text-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-busy={isLoading}
        aria-live="polite"
      >
        {isLoading ? (
          <>
            <svg 
              className="animate-spin h-5 w-5" 
              viewBox="0 0 24 24" 
              aria-hidden="true"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4" 
                fill="none"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            PDF wird erstellt...
          </>
        ) : (
          <>
            <span aria-hidden="true">📄</span>
            PDF herunterladen
          </>
        )}
      </button>

      {error && (
        <div 
          className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm max-w-md text-center" 
          role="alert"
        >
          <p className="mb-2">{error}</p>
          <button
            type="button"
            onClick={handleDownload}
            className="text-red-800 underline hover:no-underline font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
          >
            Erneut versuchen
          </button>
        </div>
      )}
    </div>
  )
}

