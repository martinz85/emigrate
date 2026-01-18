'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface PurchaseCTAProps {
  analysisId: string
  price?: string
}

// Timeout for checkout API call (10 seconds)
const CHECKOUT_TIMEOUT_MS = 10000

export function PurchaseCTA({ analysisId, price = '29,99€' }: PurchaseCTAProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const isSubmittingRef = useRef(false) // Prevent double-clicks

  const handleCheckout = async () => {
    // FIX: Early return to prevent double-clicks
    if (isLoading || isSubmittingRef.current) return
    isSubmittingRef.current = true
    setIsLoading(true)
    setError(null)

    // FIX: Add timeout to prevent infinite waiting
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), CHECKOUT_TIMEOUT_MS)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId }),
        signal: controller.signal,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Checkout fehlgeschlagen')
      }

      if (data.url) {
        // Redirect to Stripe Checkout (or mock URL in dev)
        router.push(data.url)
      } else {
        throw new Error('Keine Checkout-URL erhalten')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      
      // Handle timeout specifically
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Zeitüberschreitung - bitte versuche es erneut')
      } else {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      }
      setIsLoading(false)
      isSubmittingRef.current = false
    } finally {
      clearTimeout(timeout)
    }
  }

  return (
    <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-8 text-center">
      {/* Headline */}
      <h3 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-4">
        Neugierig, welches Land zu dir passt?
      </h3>

      {/* Benefits */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="text-green-500" aria-hidden="true">✓</span>
          Land sofort enthüllen
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="text-green-500" aria-hidden="true">✓</span>
          Detaillierte Analyse
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="text-green-500" aria-hidden="true">✓</span>
          PDF zum Download
        </div>
      </div>

      {/* Error Message - FIX: Added role="alert" and id for aria-describedby */}
      {error && (
        <div 
          id="checkout-error"
          role="alert"
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
        >
          {error}
        </div>
      )}

      {/* CTA Button - AC: "Jetzt freischalten – 29,99€" in Amber */}
      {/* FIX: Added aria-live for loading state announcement */}
      <button
        onClick={handleCheckout}
        disabled={isLoading}
        className="inline-block bg-gradient-to-r from-amber-500 to-amber-600 text-white px-10 py-5 rounded-xl font-bold text-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-lg shadow-amber-500/30 hover:shadow-xl hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        aria-busy={isLoading}
        aria-live="polite"
        aria-describedby={error ? 'checkout-error' : undefined}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg 
              className="animate-spin h-5 w-5" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
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
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Wird geladen...
          </span>
        ) : (
          `Jetzt freischalten – ${price}`
        )}
      </button>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-6 mt-6 text-sm text-slate-500">
        <div className="flex items-center gap-1">
          <span aria-hidden="true">🔒</span>
          Sichere Zahlung
        </div>
        <div className="flex items-center gap-1">
          <span aria-hidden="true">⚡</span>
          Sofort verfügbar
        </div>
        <div className="flex items-center gap-1">
          <span aria-hidden="true">💳</span>
          Stripe
        </div>
      </div>

      {/* Money-back guarantee */}
      <p className="text-xs text-slate-400 mt-4">
        14 Tage Geld-zurück-Garantie • Keine versteckten Kosten
      </p>
    </div>
  )
}
