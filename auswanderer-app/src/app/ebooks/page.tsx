import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'E-Books für Auswanderer | Auswanderer-Plattform',
  description: 'Expertenwissen für deinen Neustart im Ausland. 4 E-Books von erfahrenen Auswanderern.',
}

const ebooks = [
  {
    id: 'complete',
    title: 'Der komplette Auswanderer-Guide',
    subtitle: 'Ausführlicher Leitfaden',
    pages: '250+ Seiten',
    price: 1999,
    description: 'Alles was du wissen musst, von der Entscheidung bis zum Ankommen. Checklisten, Länderprofile, Erfahrungsberichte.',
    features: [
      '25 ausführliche Kapitel',
      'Länderprofile für 20+ Länder',
      'Druckbare Checklisten',
      'Steuer- und Visa-Guide',
    ],
    color: 'from-red-500 to-orange-500',
    emoji: '📕',
  },
  {
    id: 'short',
    title: 'Quick Start Guide',
    subtitle: 'Für Eilige',
    pages: '80 Seiten',
    price: 999,
    description: 'Die 20% der Informationen, die 80% des Erfolgs ausmachen. Perfekt für schnelle Entscheider.',
    features: [
      '10 kritische Schritte',
      'Entscheidungsbäume',
      'Quick-Reference Tabellen',
      'Die 5 größten Fehler',
    ],
    color: 'from-green-500 to-teal-500',
    emoji: '📗',
  },
  {
    id: 'tips',
    title: 'Tips & Tricks',
    subtitle: 'Insider-Wissen',
    pages: '120 Seiten',
    price: 1499,
    description: 'Erprobte Hacks von erfahrenen Expats. Geld sparen, Bürokratie umgehen, schneller ankommen.',
    features: [
      '50+ praktische Hacks',
      'Geld-Spar-Strategien',
      'Bürokratie-Shortcuts',
      'Netzwerk-Tipps',
    ],
    color: 'from-blue-500 to-indigo-500',
    emoji: '📘',
  },
  {
    id: 'dummies',
    title: 'Auswandern für Dummies',
    subtitle: 'Einsteigerfreundlich',
    pages: '100 Seiten',
    price: 1299,
    description: 'Kein Vorwissen nötig. Alles einfach erklärt, Schritt für Schritt.',
    features: [
      'Einfache Sprache',
      'Schritt-für-Schritt',
      'Häufige Fragen beantwortet',
      'Checklisten für Anfänger',
    ],
    color: 'from-yellow-500 to-amber-500',
    emoji: '📙',
  },
]

export default function EbooksPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Header />
      
      <div className="pt-24 pb-12">
        {/* Hero */}
        <div className="max-w-7xl mx-auto px-4 text-center mb-16">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            E-Books für Auswanderer
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Expertenwissen von Menschen, die es selbst gemacht haben. 
            Spar dir teure Fehler und Jahre an Recherche.
          </p>
        </div>

        {/* E-Books Grid */}
        <div className="max-w-7xl mx-auto px-4 mb-16">
          <div className="grid md:grid-cols-2 gap-8">
            {ebooks.map((ebook) => (
              <div key={ebook.id} className="card-hover">
                <div className="flex gap-6">
                  {/* Book Cover */}
                  <div className={`w-32 h-44 rounded-lg bg-gradient-to-br ${ebook.color} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-6xl">{ebook.emoji}</span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="font-heading text-xl font-bold mb-1">{ebook.title}</h3>
                    <p className="text-sm text-slate-500 mb-2">{ebook.subtitle} • {ebook.pages}</p>
                    <p className="text-slate-600 text-sm mb-4">{ebook.description}</p>
                    
                    <ul className="text-sm space-y-1 mb-4">
                      {ebook.features.map((f) => (
                        <li key={f} className="flex items-center gap-1">
                          <span className="text-green-500">✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">
                        {(ebook.price / 100).toFixed(2).replace('.', ',')} EUR
                      </span>
                      <Link
                        href={`/checkout?product=ebook_${ebook.id}`}
                        className="btn-primary text-sm"
                      >
                        Kaufen
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bundle Offer */}
        <div className="max-w-4xl mx-auto px-4 mb-16">
          <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1 rounded-full text-sm font-medium mb-4">
                🎁 Spar-Angebot
              </div>
              <h2 className="font-heading text-3xl font-bold mb-4">
                Alle 4 E-Books im Bundle
              </h2>
              <p className="text-white/80 mb-6 max-w-xl mx-auto">
                Statt 57,96 EUR einzeln – spare über 30% mit dem kompletten Paket.
              </p>
              
              <div className="flex items-center justify-center gap-4 mb-6">
                <span className="text-lg line-through text-white/50">57,96 EUR</span>
                <span className="text-4xl font-bold">39,99 EUR</span>
              </div>
              
              <Link
                href="/checkout?product=ebook_bundle"
                className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-bold hover:bg-slate-100 transition-colors"
              >
                Bundle kaufen
              </Link>
            </div>
          </div>
        </div>

        {/* PRO Upsell */}
        <div className="max-w-4xl mx-auto px-4">
          <div className="card text-center">
            <span className="text-4xl mb-4 block">💡</span>
            <h3 className="font-heading text-2xl font-bold mb-2">
              Noch besser: Auswanderer PRO
            </h3>
            <p className="text-slate-600 mb-6 max-w-xl mx-auto">
              Für nur <strong>14,99 EUR/Monat</strong> bekommst du <strong>alle E-Books</strong>, 
              unbegrenzte AI-Analysen, das Projekt-Dashboard und alle Tools.
            </p>
            <Link href="/checkout?product=pro" className="btn-cta inline-block">
              PRO werden ⭐
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}

