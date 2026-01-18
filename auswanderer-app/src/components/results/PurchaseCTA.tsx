'use client'

import Link from 'next/link'

interface PurchaseCTAProps {
  analysisId: string
  price?: string
}

export function PurchaseCTA({ analysisId, price = '29,99€' }: PurchaseCTAProps) {
  // Encode analysisId for safe URL usage
  const encodedId = encodeURIComponent(analysisId)

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

      {/* CTA Button - AC: "Jetzt freischalten – 29,99€" in Amber */}
      <Link
        href={`/checkout?analysisId=${encodedId}`}
        className="inline-block bg-gradient-to-r from-amber-500 to-amber-600 text-white px-10 py-5 rounded-xl font-bold text-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-lg shadow-amber-500/30 hover:shadow-xl hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
      >
        Jetzt freischalten – {price}
      </Link>

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
