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

  const handleBuyClick = () => {
    if (onBuy && !hasAccess) {
      onBuy(ebook)
    }
  }

  return (
    <div className="card-hover relative cursor-pointer" onClick={onToggleDetails}>
      {/* Bundle Badge */}
      {ebook.isBundle && (
        <div className="absolute -top-3 -right-3 z-10">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
            🎁 Empfohlen
          </Badge>
        </div>
      )}

      <div className="flex gap-6">
        {/* Book Cover */}
        <div
          className={`w-28 h-40 md:w-32 md:h-44 rounded-lg bg-gradient-to-br ${ebook.color} flex items-center justify-center flex-shrink-0 shadow-lg`}
        >
          <span className="text-5xl md:text-6xl">{ebook.emoji}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-lg md:text-xl font-bold mb-1 truncate">
            {ebook.title}
          </h3>
          <p className="text-sm text-slate-500 mb-2">
            {ebook.subtitle} • {ebook.pages} Seiten
          </p>
          <p className="text-slate-600 text-sm mb-4 line-clamp-2">
            {ebook.description}
          </p>

          {/* Features */}
          <ul className="text-sm space-y-1 mb-4">
            {ebook.features.slice(0, showDetails ? undefined : 3).map((feature) => (
              <li key={feature} className="flex items-center gap-1.5">
                <span className="text-green-500 flex-shrink-0">✓</span>
                <span className="truncate">{feature}</span>
              </li>
            ))}
          </ul>

          {/* Price & CTA */}
          <div className="flex items-center justify-between gap-4">
            {hasAccess ? (
              <>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {isPro ? 'Im PRO-Abo enthalten' : 'Gekauft'}
                </Badge>
                <Link
                  href="/ebooks"
                  className="btn-primary text-sm px-4 py-2 min-h-[48px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  Jetzt lesen
                </Link>
              </>
            ) : (
              <>
                <span className="text-xl md:text-2xl font-bold text-slate-900">
                  {formatEbookPrice(ebook.price)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleBuyClick()
                  }}
                  className="btn-primary text-sm px-4 py-2 min-h-[48px]"
                >
                  Kaufen
                </button>
              </>
            )}
          </div>

          {/* Details Toggle Hint */}
          {onToggleDetails && (
            <button 
              onClick={(e) => {
                e.stopPropagation()
                onToggleDetails()
              }}
              className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium min-h-[48px] flex items-center gap-1"
            >
              {showDetails ? '▲ Weniger anzeigen' : '▼ Details & Inhaltsverzeichnis'}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <h4 className="font-semibold text-sm mb-3">Inhaltsverzeichnis</h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
            {ebook.chapters.map((chapter, index) => (
              <li key={chapter} className="flex items-start gap-2">
                <span className="text-slate-400">{index + 1}.</span>
                {chapter}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-slate-500">
            📖 Lesezeit: ca. {ebook.readingTime}
          </p>
        </div>
      )}
    </div>
  )
}

