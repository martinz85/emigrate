import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            Jetzt kostenlos testen
          </div>

          {/* Headline */}
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Finde dein perfektes{' '}
            <span className="gradient-text">Auswanderungsland</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Unser AI-Assistent analysiert <strong>26 personalisierte Kriterien</strong> und 
            findet das Land, das perfekt zu dir passt. In nur 10-15 Minuten.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/analyse" className="btn-cta flex items-center justify-center gap-2">
              <span>🚀</span>
              Kostenlos starten
            </Link>
            <Link href="#so-funktionierts" className="btn-secondary flex items-center justify-center gap-2">
              So funktioniert&apos;s
              <span>→</span>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              26 Kriterien
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              AI-gestützte Analyse
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Sofortige Vorschau
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              DSGVO-konform
            </div>
          </div>
        </div>

        {/* Preview Image */}
        <div className="mt-16 relative">
          <div className="card-hover max-w-4xl mx-auto p-2 bg-gradient-to-b from-white to-slate-50">
            <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <span className="text-6xl mb-4 block">📊</span>
                <p className="text-slate-400">Interaktive Demo des AI-Assistenten</p>
              </div>
            </div>
          </div>
          
          {/* Floating stats */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
            <div className="bg-white rounded-full px-4 py-2 shadow-lg text-sm font-medium flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              10.000+ Analysen
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

