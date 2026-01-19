'use client'

import { useState, useRef } from 'react'

interface PdfDownloadButtonProps {
  analysisId: string
}

// Timeout for report generation (30 seconds)
const REPORT_TIMEOUT_MS = 30000

type DownloadStatus = 'idle' | 'loading' | 'success' | 'error'

export function PdfDownloadButton({ analysisId }: PdfDownloadButtonProps) {
  const [status, setStatus] = useState<DownloadStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const isDownloadingRef = useRef(false)

  const handleDownload = async () => {
    // Prevent double-clicks
    if (status === 'loading' || isDownloadingRef.current) return
    isDownloadingRef.current = true
    setStatus('loading')
    setError(null)

    // Timeout controller
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REPORT_TIMEOUT_MS)

    try {
      const response = await fetch(`/api/pdf/${encodeURIComponent(analysisId)}`, {
        signal: controller.signal,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Download fehlgeschlagen')
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
      
      // Show success status
      setStatus('success')
      
      // Reset to idle after 3 seconds
      setTimeout(() => {
        setStatus('idle')
      }, 3000)
    } catch (err) {
      console.error('Report download error:', err)
      
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Zeitüberschreitung - die Erstellung dauert zu lange. Bitte versuche es erneut.')
      } else {
        setError(err instanceof Error ? err.message : 'Download fehlgeschlagen')
      }
      setStatus('error')
    } finally {
      clearTimeout(timeout)
      isDownloadingRef.current = false
    }
  }

  const isLoading = status === 'loading'

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={handleDownload}
        disabled={isLoading}
        className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 text-white rounded-xl font-bold text-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-busy={isLoading}
        aria-describedby="download-status"
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
            Report wird erstellt...
          </>
        ) : (
          <>
            <span aria-hidden="true">📄</span>
            {/* MVP: Text-Report, später PDF */}
            Report herunterladen
          </>
        )}
      </button>

      {/* Separate status element for screen readers (better a11y than aria-live on button) */}
      <div 
        id="download-status"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {status === 'loading' && 'Report wird erstellt, bitte warten...'}
        {status === 'success' && 'Report wurde erfolgreich heruntergeladen.'}
        {status === 'error' && `Fehler: ${error}`}
      </div>

      {/* Success toast */}
      {status === 'success' && (
        <div 
          className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm max-w-md text-center flex items-center gap-2 animate-fade-in"
          role="status"
        >
          <span aria-hidden="true">✅</span>
          <span>Report wurde erfolgreich heruntergeladen!</span>
        </div>
      )}

      {/* Error message with retry */}
      {status === 'error' && error && (
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
