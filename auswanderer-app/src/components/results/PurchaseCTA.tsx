'use client'

import Link from 'next/link'

interface PurchaseCTAProps {
  analysisId: string
  price?: string
}

export function PurchaseCTA({ analysisId, price = '29,99€' }: PurchaseCTAProps) {
  return (
    <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-8 text-center">
      {/* Headline */}
      <h3 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-4">
        Neugierig, welches Land zu dir passt?
      </h3>

      {/* Benefits */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="text-green-500">✓</span>
          Land sofort enthüllen
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="text-green-500">✓</span>
          Detaillierte Analyse
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="text-green-500">✓</span>
          PDF zum Download
        </div>
      </div>

      {/* CTA Button */}
      <Link
        href={`/checkout?analysisId=${analysisId}`}
        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white px-10 py-5 rounded-xl font-bold text-xl hover:from-secondary-600 hover:to-secondary-700 transition-all duration-200 shadow-lg shadow-secondary-500/30 hover:shadow-xl hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2"
      >
        <span>Jetzt freischalten</span>
        <span className="bg-white/20 px-3 py-1 rounded-lg text-lg">{price}</span>
      </Link>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-6 mt-6 text-sm text-slate-500">
        <div className="flex items-center gap-1">
          <span>🔒</span>
          Sichere Zahlung
        </div>
        <div className="flex items-center gap-1">
          <span>⚡</span>
          Sofort verfügbar
        </div>
        <div className="flex items-center gap-1">
          <span>💳</span>
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

