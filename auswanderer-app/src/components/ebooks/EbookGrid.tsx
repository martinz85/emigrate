'use client'

import { useState } from 'react'
import { Ebook, getBundleSavings, formatEbookPrice } from '@/lib/ebooks'
import { EbookCard } from './EbookCard'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface EbookGridProps {
  ebooks: Ebook[] // All ebooks (excluding bundles)
  bundle?: Ebook | null // Bundle ebook
  isPro?: boolean
  purchasedEbooks?: string[] // IDs of purchased ebooks
}

export function EbookGrid({ 
  ebooks, 
  bundle, 
  isPro = false, 
  purchasedEbooks = [] 
}: EbookGridProps) {
  const router = useRouter()
  const [expandedEbook, setExpandedEbook] = useState<string | null>(null)
  const [loadingEbookId, setLoadingEbookId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Calculate bundle savings
  const bundleSavings = bundle ? calculateBundleSavings(ebooks, bundle) : getBundleSavings()
  const { originalPrice, savingsPercent } = bundleSavings

  // Check if user has access to all ebooks (via bundle or individual purchases)
  const hasAllEbooks = isPro || 
    (bundle && purchasedEbooks.includes(bundle.id)) ||
    ebooks.every(ebook => purchasedEbooks.includes(ebook.id))

  const handleToggleDetails = (ebookId: string) => {
    setExpandedEbook(prev => prev === ebookId ? null : ebookId)
  }

  const handleBuy = async (ebook: Ebook) => {
    // PRO users already have access
    if (isPro) {
      router.push('/ebooks')
      return
    }

    // Already purchased
    if (purchasedEbooks.includes(ebook.id)) {
      router.push('/ebooks')
      return
    }

    setError(null)
    setLoadingEbookId(ebook.id)

    try {
      const response = await fetch('/api/ebooks/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ebookId: ebook.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Checkout fehlgeschlagen')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else if (data.redirectUrl) {
        // For free ebooks
        router.push(data.redirectUrl)
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setLoadingEbookId(null)
    }
  }

  return (
    <div className="space-y-12">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* E-Books Grid - responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {ebooks.map((ebook) => (
          <div key={ebook.id} className="relative">
            {loadingEbookId === ebook.id && (
              <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            )}
            <EbookCard
              ebook={ebook}
              isPro={isPro}
              hasPurchased={purchasedEbooks.includes(ebook.id)}
              onBuy={handleBuy}
              showDetails={expandedEbook === ebook.id}
              onToggleDetails={() => handleToggleDetails(ebook.id)}
            />
          </div>
        ))}
      </div>

      {/* Bundle Offer - only show if user doesn't have all ebooks and bundle exists */}
      {!hasAllEbooks && bundle && (
        <div className="relative">
          {loadingEbookId === bundle.id && (
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-xl">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
            </div>
          )}
          <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative text-center py-4">
              <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                🎁 Spar-Angebot • {savingsPercent}% günstiger
              </div>
              
              <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">
                {bundle.title}
              </h2>
              
              <p className="text-white/80 mb-6 max-w-xl mx-auto">
                Statt {formatEbookPrice(originalPrice)} einzeln – spare über {savingsPercent}% mit dem kompletten Paket.
              </p>

              <div className="flex items-center justify-center gap-4 mb-6">
                <span className="text-lg line-through text-white/50">
                  {formatEbookPrice(originalPrice)}
                </span>
                <span className="text-3xl md:text-4xl font-bold">
                  {formatEbookPrice(bundle.price)}
                </span>
              </div>

              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {ebooks.map((ebook) => (
                  <span
                    key={ebook.id}
                    className="text-2xl"
                    title={ebook.title}
                  >
                    {ebook.emoji}
                  </span>
                ))}
              </div>

              <button
                onClick={() => handleBuy(bundle)}
                disabled={loadingEbookId === bundle.id}
                className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-bold hover:bg-slate-100 transition-colors min-h-[48px] disabled:opacity-50"
              >
                {loadingEbookId === bundle.id ? 'Wird geladen...' : 'Bundle kaufen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRO Upsell */}
      {!isPro && (
        <div className="card text-center bg-slate-50">
          <span className="text-4xl mb-4 block">💡</span>
          <h3 className="font-heading text-xl md:text-2xl font-bold mb-2">
            Noch besser: Auswanderer PRO
          </h3>
          <p className="text-slate-600 mb-6 max-w-xl mx-auto">
            Für nur <strong>14,99 €/Monat</strong> bekommst du <strong>alle E-Books</strong>,
            unbegrenzte AI-Analysen, das Projekt-Dashboard und alle Tools.
          </p>
          <Link href="/#preise" className="btn-cta inline-block">
            PRO werden ⭐
          </Link>
        </div>
      )}
    </div>
  )
}

/**
 * Calculate bundle savings from ebook list and bundle
 */
function calculateBundleSavings(ebooks: Ebook[], bundle: Ebook) {
  const originalPrice = ebooks.reduce((sum, e) => sum + e.price, 0)
  const savings = originalPrice - bundle.price
  const savingsPercent = originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0
  return { originalPrice, savings, savingsPercent }
}
