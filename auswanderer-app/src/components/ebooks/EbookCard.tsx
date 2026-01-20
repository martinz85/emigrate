'use client'

import { Ebook, formatEbookPrice } from '@/lib/ebooks'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface EbookCardProps {
  ebook: Ebook
  isPro?: boolean
  hasPurchased?: boolean
  onBuy?: (ebook: Ebook) => void
  showDetails?: boolean
  onToggleDetails?: () => void
}

export function EbookCard({
  ebook,
  isPro = false,
  hasPurchased = false,
  onBuy,
  showDetails = false,
  onToggleDetails,
}: EbookCardProps) {
  const hasAccess = isPro || hasPurchased

  const handleBuyClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (onBuy && !hasAccess) {
      onBuy(ebook)
    }
  }

  const handleToggleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onToggleDetails?.()
  }

  return (
    // FIXED: Removed onClick from card container to prevent double-handling
    // Only the explicit toggle button should control details visibility
    <div className="card-hover relative flex flex-col h-full">
      {/* Bundle Badge */}
      {ebook.isBundle && (
        <div className="absolute -top-3 -right-3 z-10">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
            🎁 Empfohlen
          </Badge>
        </div>
      )}

      {/* Book Cover - Centered */}
      <div className="flex justify-center mb-5">
        <div
          className={`w-24 h-32 sm:w-28 sm:h-36 rounded-lg bg-gradient-to-br ${ebook.color} flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform`}
        >
          <span className="text-4xl sm:text-5xl">{ebook.emoji}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <h3 className="font-heading text-lg font-bold mb-1 text-center">
          {ebook.title}
        </h3>
        <p className="text-sm text-slate-500 mb-4 text-center">
          {/* FIX: Handle null values properly */}
          {ebook.subtitle}
          {ebook.subtitle && ebook.pages ? ' • ' : ''}
          {ebook.pages ? `${ebook.pages} Seiten` : ''}
        </p>

        {/* Features - show all, no truncation */}
        <ul className="text-sm space-y-2 mb-4 flex-1">
          {ebook.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
              <span className="text-slate-600">{feature}</span>
            </li>
          ))}
        </ul>

        {/* Price & CTA */}
        <div className="mt-auto pt-4 border-t border-slate-100">
          {hasAccess ? (
            <div className="flex flex-col items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {isPro ? 'Im PRO-Abo enthalten' : 'Gekauft'}
              </Badge>
              <Link
                href="/ebooks"
                className="btn-primary w-full text-center py-2.5"
              >
                Jetzt lesen
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <span className="text-2xl font-bold text-slate-900">
                {formatEbookPrice(ebook.price)}
              </span>
              <button
                type="button"
                onClick={handleBuyClick}
                className="btn-primary px-5 py-2.5"
              >
                Kaufen
              </button>
            </div>
          )}
        </div>

        {/* Details Toggle - Clear button with explicit action */}
        {onToggleDetails && (
          <button 
            type="button"
            onClick={handleToggleClick}
            className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center gap-1 w-full py-2 hover:bg-slate-50 rounded transition-colors"
            aria-expanded={showDetails}
            aria-controls={`ebook-details-${ebook.slug}`}
          >
            <span className="transition-transform duration-200" style={{ transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              ▼
            </span>
            <span>{showDetails ? 'Weniger anzeigen' : 'Inhaltsverzeichnis'}</span>
          </button>
        )}
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div 
          id={`ebook-details-${ebook.slug}`}
          className="mt-4 pt-4 border-t border-slate-200 animate-in slide-in-from-top-2 duration-200"
        >
          <h4 className="font-semibold text-sm mb-3">Inhaltsverzeichnis</h4>
          <ul className="space-y-1.5 text-sm text-slate-600">
            {ebook.chapters.map((chapter, index) => (
              <li key={chapter} className="flex items-start gap-2">
                <span className="text-slate-400 text-xs mt-0.5">{index + 1}.</span>
                <span>{chapter}</span>
              </li>
            ))}
          </ul>
          {/* FIX: Only show reading time if available */}
          {ebook.readingTime && (
            <p className="mt-4 text-sm text-slate-500 text-center">
              📖 Lesezeit: ca. {ebook.readingTime}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
