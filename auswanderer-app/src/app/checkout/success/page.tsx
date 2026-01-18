'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')
  const analysisIdFromUrl = searchParams.get('analysisId')
  
  const [countdown, setCountdown] = useState(5)
  const [analysisId, setAnalysisId] = useState<string | null>(analysisIdFromUrl)
  const [isVerifying, setIsVerifying] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Verify session and get analysisId
  useEffect(() => {
    if (!sessionId) {
      setError('Keine gültige Session gefunden')
      setIsVerifying(false)
      return
    }

    async function verifySession() {
      try {
        // If we already have analysisId from URL (mock mode), skip verification
        if (analysisIdFromUrl) {
          setAnalysisId(analysisIdFromUrl)
          setIsVerifying(false)
          return
        }

        const res = await fetch(`/api/checkout?session_id=${sessionId}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Verifizierung fehlgeschlagen')
        }

        if (data.analysisId) {
          setAnalysisId(data.analysisId)
        } else {
          // Fallback to demo if no analysisId
          setAnalysisId('demo')
        }
      } catch (err) {
        console.error('Session verification error:', err)
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      } finally {
        setIsVerifying(false)
      }
    }

    verifySession()
  }, [sessionId, analysisIdFromUrl])

  // Auto-redirect countdown
  useEffect(() => {
    if (isVerifying || error || !analysisId) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push(`/ergebnis/${analysisId}?unlocked=true`)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [analysisId, isVerifying, error, router])

  // Error state
  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-6">😕</div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-4">
          Etwas ist schiefgelaufen
        </h1>
        <p className="text-slate-600 mb-8">{error}</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Zur Startseite
        </a>
      </div>
    )
  }

  // Loading state
  if (isVerifying) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-6 animate-pulse">⏳</div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-4">
          Zahlung wird verifiziert...
        </h1>
        <p className="text-slate-600">Bitte warte einen Moment.</p>
      </div>
    )
  }

  // Success state
  return (
    <div className="text-center py-20">
      {/* Success Animation */}
      <div className="relative inline-block mb-8">
        <div className="text-7xl md:text-8xl animate-bounce">🎉</div>
        <div className="absolute -top-2 -right-2 text-4xl animate-ping">✨</div>
        <div className="absolute -bottom-2 -left-2 text-4xl animate-ping" style={{ animationDelay: '0.5s' }}>✨</div>
      </div>

      {/* Success Message */}
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-4">
        Danke für deinen Kauf!
      </h1>

      <p className="text-lg text-slate-600 mb-2">
        Deine Zahlung war erfolgreich.
      </p>

      <p className="text-slate-500 mb-8">
        Weiterleitung in <span className="font-bold text-primary-500">{countdown}</span> Sekunden...
      </p>

      {/* CTA Button */}
      <a
        href={`/ergebnis/${analysisId}?unlocked=true`}
        className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 text-white rounded-xl font-bold text-lg hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        Ergebnis ansehen
        <span aria-hidden="true">→</span>
      </a>

      {/* What's next */}
      <div className="mt-12 max-w-md mx-auto">
        <h2 className="font-semibold text-slate-900 mb-4">Was dich erwartet:</h2>
        <div className="space-y-3 text-left">
          <div className="flex items-start gap-3">
            <span className="text-green-500 mt-1" aria-hidden="true">✓</span>
            <span className="text-slate-600">Dein Top-Land wird enthüllt</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-500 mt-1" aria-hidden="true">✓</span>
            <span className="text-slate-600">Detaillierte Analyse aller 28 Kriterien</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-500 mt-1" aria-hidden="true">✓</span>
            <span className="text-slate-600">PDF-Download für deine Unterlagen</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-20">
        <div className="max-w-xl mx-auto px-4">
          <Suspense fallback={
            <div className="text-center py-20">
              <div className="text-6xl mb-6 animate-pulse">⏳</div>
              <p className="text-slate-600">Laden...</p>
            </div>
          }>
            <SuccessContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  )
}
