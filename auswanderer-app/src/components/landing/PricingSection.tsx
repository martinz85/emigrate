'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { PriceDisplay } from '@/components/ui/PriceDisplay'

interface PriceData {
  name: string
  description: string
  regularPrice: number
  currentPrice: number
  campaignActive: boolean
  campaignName: string | null
  currency: string
  savings: number
  savingsPercent: number
}

interface PricesResponse {
  analysis?: PriceData
  ebook?: PriceData
  pro_monthly?: PriceData
  pro_yearly?: PriceData
}

// Fallback prices in case API fails
const FALLBACK_PRICES: PricesResponse = {
  analysis: {
    name: 'Auswanderer-Analyse (PDF)',
    description: 'Vollständige Analyse',
    regularPrice: 2999,
    currentPrice: 2999,
    campaignActive: false,
    campaignName: null,
    currency: 'eur',
    savings: 0,
    savingsPercent: 0,
  },
  pro_monthly: {
    name: 'PRO Abo (Monatlich)',
    description: 'Unbegrenzte Analysen',
    regularPrice: 1499,
    currentPrice: 1499,
    campaignActive: false,
    campaignName: null,
    currency: 'eur',
    savings: 0,
    savingsPercent: 0,
  },
}

export function PricingSection() {
  const [prices, setPrices] = useState<PricesResponse>(FALLBACK_PRICES)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch('/api/prices')
        if (res.ok) {
          const data = await res.json()
          setPrices(data)
        }
      } catch (error) {
        console.error('Failed to fetch prices:', error)
        // Keep fallback prices
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrices()
  }, [])

  // Get dynamic PDF price (use analysis product)
  const pdfPrice = prices.analysis || FALLBACK_PRICES.analysis!
  const proPrice = prices.pro_monthly || FALLBACK_PRICES.pro_monthly!

  const plans = [
    {
      name: 'Free',
      priceDisplay: (
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold">0</span>
          <span className="text-slate-500">EUR</span>
        </div>
      ),
      description: 'Perfekt zum Ausprobieren',
      features: [
        'AI-Analyse starten',
        'Persönliche Kriterien gewichten',
        '2-Seiten Vorschau',
        'Top 3 Länder sehen',
      ],
      cta: 'Kostenlos starten',
      ctaLink: '/analyse',
      highlighted: false,
    },
    {
      name: 'Einzel-PDF',
      priceDisplay: (
        <div className="flex flex-col items-center gap-1">
          <PriceDisplay
            regularPrice={pdfPrice.regularPrice}
            currentPrice={pdfPrice.currentPrice}
            campaignActive={pdfPrice.campaignActive}
            campaignName={pdfPrice.campaignName}
            size="xl"
            showSavings={true}
          />
          <span className="text-slate-500 text-sm">einmalig</span>
        </div>
      ),
      description: 'Vollständige Analyse',
      features: [
        'Alles aus Free',
        'Vollständige PDF (5+ Seiten)',
        'Detailmatrix aller Kriterien',
        'Persönliche Empfehlung',
        'Konkrete nächste Schritte',
      ],
      cta: 'PDF kaufen',
      ctaLink: '/analyse',
      highlighted: false,
    },
    {
      name: 'PRO',
      priceDisplay: (
        <div className="flex flex-col items-center gap-1">
          <PriceDisplay
            regularPrice={proPrice.regularPrice}
            currentPrice={proPrice.currentPrice}
            campaignActive={proPrice.campaignActive}
            campaignName={proPrice.campaignName}
            size="xl"
            showSavings={true}
          />
          <span className="text-slate-500 text-sm">pro Monat</span>
        </div>
      ),
      badge: 'Beliebt',
      description: 'Für ernsthafte Auswanderer',
      features: [
        'Unbegrenzte AI-Analysen',
        'Alle PDFs inklusive',
        'Alle 4 E-Books inklusive',
        'Projekt-Dashboard',
        'Checklisten & Timeline',
        'Länder-Vergleich Tool',
        'Visa-Navigator',
        'Kosten-Rechner',
        'Basis-Support',
      ],
      cta: 'PRO werden ⭐',
      ctaLink: '/pro',
      highlighted: true,
    },
  ]

  return (
    <section id="preise" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">Transparente Preise</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Starte kostenlos und upgrade wenn du bereit bist
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`card relative ${
                plan.highlighted
                  ? 'border-2 border-primary-500 shadow-xl shadow-primary-500/20'
                  : ''
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-sm font-semibold px-4 py-1 rounded-full">
                  {plan.badge}
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-6">
                <h3 className="font-heading text-xl font-bold mb-2">{plan.name}</h3>
                {isLoading ? (
                  <div className="h-12 flex items-center justify-center">
                    <div className="w-20 h-8 bg-slate-200 animate-pulse rounded" />
                  </div>
                ) : (
                  plan.priceDisplay
                )}
                <p className="text-slate-600 text-sm mt-2">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.ctaLink}
                className={`block text-center py-3 rounded-lg font-semibold transition-all ${
                  plan.highlighted
                    ? 'bg-primary-500 text-white hover:bg-primary-600'
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
