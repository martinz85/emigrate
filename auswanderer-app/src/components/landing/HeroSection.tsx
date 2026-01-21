import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Headline */}
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Finde dein perfektes{' '}
            <span className="gradient-text">Auswanderungsland</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Unser AI analysiert, was <strong>DIR</strong> wichtig ist - 
            und findet das Land, das perfekt zu dir passt. In nur 5-10 Minuten.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link href="/analyse" className="btn-cta flex items-center justify-center gap-2">
              <span>🚀</span>
              Kostenlos starten
            </Link>
            <Link href="/#so-funktionierts" className="btn-secondary flex items-center justify-center gap-2">
              So funktioniert&apos;s
              <span>→</span>
            </Link>
          </div>

          {/* Social proof (professional, non-gimmicky) */}
          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Auf dich zugeschnitten
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
          
          {/* Floating badge */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
            <div className="bg-white rounded-full px-4 py-2 shadow-lg text-sm font-medium flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              Personalisierte Analyse
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mt-20 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Testimonial 1 - Ana */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <p className="text-slate-700 text-base leading-relaxed mb-4">
                "Die Analyse hat genau die richtigen Fragen gestellt. Jetzt haben wir Klarheit."
              </p>
              
              <div className="flex items-center gap-1 mb-3 text-sm">
                <span className="text-amber-400">⭐⭐⭐⭐⭐</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
                  A
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Ana</div>
                  <div className="text-xs text-slate-500">Schweden</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 - Levi */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <p className="text-slate-700 text-base leading-relaxed mb-4">
                "Hat Spaß gemacht - und war schneller als gedacht."
              </p>
              
              <div className="flex items-center gap-1 mb-3 text-sm">
                <span className="text-amber-400">⭐⭐⭐⭐⭐</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-semibold text-sm">
                  L
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Levi</div>
                  <div className="text-xs text-slate-500">Entwickler</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 - Joelle */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <p className="text-slate-700 text-base leading-relaxed mb-4">
                "Die Auswertung hat mir Länder gezeigt, an die ich nie gedacht hätte."
              </p>
              
              <div className="flex items-center gap-1 mb-3 text-sm">
                <span className="text-amber-400">⭐⭐⭐⭐⭐</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-secondary-100 text-secondary-700 flex items-center justify-center font-semibold text-sm">
                  J
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Joelle</div>
                  <div className="text-xs text-slate-500">Fotografin</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

