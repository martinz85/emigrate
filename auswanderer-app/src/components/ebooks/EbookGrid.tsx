'use client'

import { useState } from 'react'
import { Ebook, EBOOKS, EBOOK_BUNDLE, getBundleSavings, formatEbookPrice } from '@/lib/ebooks'
import { EbookCard } from './EbookCard'
import Link from 'next/link'

interface EbookGridProps {
  isPro?: boolean
  purchasedEbooks?: string[] // slugs of purchased ebooks
  onBuy?: (ebook: Ebook) => void
}

export function EbookGrid({ isPro = false, purchasedEbooks = [], onBuy }: EbookGridProps) {
  const { originalPrice, savingsPercent } = getBundleSavings()
  const [expandedEbook, setExpandedEbook] = useState<string | null>(null)

  // Check if user has access to all ebooks (via bundle or individual purchases)
  const hasAllEbooks = isPro || 
    purchasedEbooks.includes('bundle') ||
    EBOOKS.every(ebook => purchasedEbooks.includes(ebook.slug))

  const handleToggleDetails = (ebookId: string) => {
    setExpandedEbook(prev => prev === ebookId ? null : ebookId)
  }

  return (
    <div className="space-y-12">
      {/* E-Books Grid - responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {EBOOKS.map((ebook) => (
          <EbookCard
            key={ebook.id}
            ebook={ebook}
            isPro={isPro}
            hasPurchased={purchasedEbooks.includes(ebook.slug) || purchasedEbooks.includes('bundle')}
            onBuy={onBuy}
            showDetails={expandedEbook === ebook.id}
            onToggleDetails={() => handleToggleDetails(ebook.id)}
          />
        ))}
      </div>

      {/* Bundle Offer - only show if user doesn't have all ebooks */}
      {!hasAllEbooks && (
        <div className="relative">
          <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative text-center py-4">
              <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                🎁 Spar-Angebot • {savingsPercent}% günstiger
              </div>
              
              <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">
                Alle 4 E-Books im Bundle
              </h2>
              
              <p className="text-white/80 mb-6 max-w-xl mx-auto">
                Statt {formatEbookPrice(originalPrice)} einzeln – spare über {savingsPercent}% mit dem kompletten Paket.
              </p>

              <div className="flex items-center justify-center gap-4 mb-6">
                <span className="text-lg line-through text-white/50">
                  {formatEbookPrice(originalPrice)}
                </span>
                <span className="text-3xl md:text-4xl font-bold">
                  {formatEbookPrice(EBOOK_BUNDLE.price)}
                </span>
              </div>

              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {EBOOKS.map((ebook) => (
                  <span
                    key={ebook.id}
                    className="text-2xl"
                    title={ebook.title}
                  >
                    {ebook.emoji}
                  </span>
                ))}
              </div>

              {onBuy ? (
                <button
                  onClick={() => onBuy(EBOOK_BUNDLE)}
                  className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-bold hover:bg-slate-100 transition-colors min-h-[48px]"
                >
                  Bundle kaufen
                </button>
              ) : (
                <Link
                  href="/checkout?product=ebook_bundle"
                  className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-bold hover:bg-slate-100 transition-colors min-h-[48px]"
                >
                  Bundle kaufen
                </Link>
              )}
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

