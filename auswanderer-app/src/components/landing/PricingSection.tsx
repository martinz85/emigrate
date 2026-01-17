import Link from 'next/link'

export function PricingSection() {
  const plans = [
    {
      name: 'Free',
      price: '0',
      period: '',
      description: 'Perfekt zum Ausprobieren',
      features: [
        'AI-Analyse starten',
        '26 Kriterien gewichten',
        '2-Seiten Vorschau',
        'Top 3 Länder sehen',
      ],
      cta: 'Kostenlos starten',
      ctaLink: '/analyse',
      highlighted: false,
    },
    {
      name: 'Einzel-PDF',
      price: '39',
      period: 'einmalig',
      description: 'Vollständige Analyse',
      features: [
        'Alles aus Free',
        'Vollständige PDF (5+ Seiten)',
        'Detailmatrix aller 26 Kriterien',
        'Persönliche Empfehlung',
        'Konkrete nächste Schritte',
      ],
      cta: 'PDF kaufen',
      ctaLink: '/analyse',
      highlighted: false,
    },
    {
      name: 'PRO',
      price: '14,99',
      period: 'pro Monat',
      description: 'Für ernsthafte Auswanderer',
      badge: 'Beliebt',
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
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-slate-500">EUR</span>
                  {plan.period && (
                    <span className="text-slate-500 text-sm">/ {plan.period}</span>
                  )}
                </div>
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

        {/* Money back guarantee */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 text-sm text-slate-600">
            <span className="text-xl">🔒</span>
            14 Tage Geld-zurück-Garantie bei PRO
          </div>
        </div>
      </div>
    </section>
  )
}

