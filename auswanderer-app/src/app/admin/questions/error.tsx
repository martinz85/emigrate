'use client'

import { useEffect } from 'react'

// ============================================
// Error Boundary für Admin Questions
// Fängt API-Fehler und Rendering-Probleme ab
// ============================================

export default function QuestionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Fehler loggen (optional: an Monitoring-Service senden)
    console.error('Questions Error:', error)
  }, [error])

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Titel */}
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          Ein Fehler ist aufgetreten
        </h2>

        {/* Beschreibung */}
        <p className="text-slate-600 mb-6">
          Beim Laden der Fragen ist ein Problem aufgetreten. 
          Bitte versuche es erneut oder kontaktiere den Support.
        </p>

        {/* Fehlerdetails (nur in Development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-slate-100 rounded-lg text-left">
            <p className="text-xs font-mono text-slate-600 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-slate-400 mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Aktionen */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Erneut versuchen
          </button>
          <a
            href="/admin"
            className="px-6 py-3 text-slate-600 hover:text-slate-800"
          >
            Zum Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}

