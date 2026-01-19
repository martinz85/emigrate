'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')
  const analysisIdFromUrl = searchParams.get('analysisId')
  
  const [countdown, setCountdown] = useState(5)
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // FIX: Track mount state for race condition prevention
  const isMountedRef = useRef(true)

  // Verify session - ALWAYS verify, even if analysisId is in URL
  useEffect(() => {
    isMountedRef.current = true

    if (!sessionId) {
      setError('Keine gültige Session gefunden')
      setIsVerifying(false)
      return
    }

    async function verifySession() {
      try {
        // FIX: Always verify session, don't skip based on URL parameter
        const res = await fetch(`/api/checkout?session_id=${encodeURIComponent(sessionId)}&analysisId=${encodeURIComponent(analysisIdFromUrl || '')}`)
        const data = await res.json()

        if (!isMountedRef.current) return

        if (!res.ok || !data.verified) {
          throw new Error(data.error || 'Verifizierung fehlgeschlagen')
        }

        // Use verified analysisId from API, fallback to URL param, then 'demo'
        setAnalysisId(data.analysisId || analysisIdFromUrl || 'demo')
      } catch (err) {
        if (!isMountedRef.current) return
        console.error('Session verification error:', err)
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      } finally {
        if (isMountedRef.current) {
          setIsVerifying(false)
        }
      }
    }

    verifySession()

    return () => {
      isMountedRef.current = false
    }
  }, [sessionId, analysisIdFromUrl])

  // Auto-redirect countdown - FIX: Proper cleanup to prevent race condition
  useEffect(() => {
    if (isVerifying || error || !analysisId) return

    let localMounted = true

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // FIX: Check mount state before navigation
          if (localMounted && isMountedRef.current) {
            // Security: No ?unlocked=true - payment is verified server-side from Supabase
            router.push(`/ergebnis/${encodeURIComponent(analysisId)}`)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      localMounted = false
      clearInterval(timer)
    }
  }, [analysisId, isVerifying, error, router])

  // Error state
  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-6" aria-hidden="true">😕</div>
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
        <div className="text-6xl mb-6 animate-pulse" aria-hidden="true">⏳</div>
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
        <div className="text-7xl md:text-8xl animate-bounce" aria-hidden="true">🎉</div>
        <div className="absolute -top-2 -right-2 text-4xl animate-ping" aria-hidden="true">✨</div>
        <div className="absolute -bottom-2 -left-2 text-4xl animate-ping" style={{ animationDelay: '0.5s' }} aria-hidden="true">✨</div>
      </div>

      {/* Success Message */}
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-4">
        Danke für deinen Kauf!
      </h1>

      <p className="text-lg text-slate-600 mb-2">
        Deine Zahlung war erfolgreich.
      </p>

      {/* FIX: aria-live and aria-atomic for screen reader announcement */}
      <p 
        className="text-slate-500 mb-8" 
        aria-live="polite" 
        aria-atomic="true"
      >
        Weiterleitung in <span className="font-bold text-primary-500">{countdown}</span> Sekunden...
      </p>

      {/* CTA Button */}
      {/* Security: No ?unlocked=true - payment is verified server-side from Supabase */}
      <a
        href={`/ergebnis/${encodeURIComponent(analysisId || 'demo')}`}
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
              <div className="text-6xl mb-6 animate-pulse" aria-hidden="true">⏳</div>
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
