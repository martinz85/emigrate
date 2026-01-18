'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function ErrorBoundary({ 
  error, 
  reset 
}: { 
  error: Error & { digest?: string }
  reset: () => void 
}) {
  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20">
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          {/* Error Icon */}
          <div className="text-6xl mb-6">😕</div>
          
          {/* Heading */}
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-4">
            Etwas ist schiefgelaufen
          </h1>
          
          {/* Message */}
          <p className="text-slate-600 mb-8">
            Dein Ergebnis konnte nicht geladen werden. 
            Bitte versuche es erneut oder starte eine neue Analyse.
          </p>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Erneut versuchen
            </button>
            <a
              href="/analyse"
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              Neue Analyse starten
            </a>
          </div>

          {/* Error details (dev only) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-8 text-left bg-red-50 p-4 rounded-lg">
              <summary className="text-red-700 font-medium cursor-pointer">
                Fehlerdetails (Development)
              </summary>
              <pre className="mt-2 text-xs text-red-600 overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

