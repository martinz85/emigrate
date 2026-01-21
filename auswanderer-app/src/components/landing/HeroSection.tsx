import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

// Fallback content if database is unavailable
const FALLBACK_CONTENT = {
  headline_part1: 'Finde dein perfektes',
  headline_part2: 'Auswanderungsland',
  subheadline: 'Unser AI analysiert, was DIR wichtig ist - und findet das Land, das perfekt zu dir passt. In nur 5-10 Minuten.',
  cta_primary: 'Kostenlos starten',
  cta_secondary: "So funktioniert's",
  trust_badge_1: 'Auf dich zugeschnitten',
  trust_badge_2: 'AI-gestützte Analyse',
  trust_badge_3: 'Sofortige Vorschau',
  trust_badge_4: 'DSGVO-konform'
}

export async function HeroSection() {
  // Fetch content from database
  let content = FALLBACK_CONTENT
  
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('site_content')
      .select('key, content')
      .eq('section', 'hero')
    
    if (!error && data) {
      const contentMap: Record<string, string> = {}
      data.forEach(item => {
        contentMap[item.key] = item.content
      })
      content = { ...FALLBACK_CONTENT, ...contentMap }
    }
  } catch (error) {
    console.error('Error loading hero content:', error)
    // Use fallback content
  }

  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Headline with inline image */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-6">
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
              {content.headline_part1}{' '}
              <span className="gradient-text">{content.headline_part2}</span>
            </h1>
            
            {/* Goodbye Image - inline next to headline, hidden on mobile for better UX */}
            <div className="flex-shrink-0 hidden md:block">
              <img 
                src="/Images/Goodbye.jpg" 
                alt="Auswandern aus Deutschland - Ortsschild zeigt Abschied von Deutschland und neuen Weg zum Auswandern"
                className="w-56 lg:w-64 h-auto rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                loading="eager"
              />
            </div>
          </div>

          {/* Subheadline */}
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            {content.subheadline}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link href="/analyse" className="btn-cta flex items-center justify-center gap-2">
              <span>🚀</span>
              {content.cta_primary}
            </Link>
            <Link href="/#so-funktionierts" className="btn-secondary flex items-center justify-center gap-2">
              {content.cta_secondary}
              <span>→</span>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              {content.trust_badge_1}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              {content.trust_badge_2}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              {content.trust_badge_3}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              {content.trust_badge_4}
            </div>
          </div>
        </div>

        {/* Preview Image - GIF Animation */}
        <div className="mt-16 relative">
          <div className="card-hover max-w-4xl mx-auto p-2 bg-gradient-to-b from-white to-slate-50">
            <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl overflow-hidden">
              <img 
                src="/Images/download-ezgif.com-optimize.gif" 
                alt="Interaktive Demo des AI-Assistenten"
                className="w-full h-full object-cover"
                loading="lazy"
              />
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

