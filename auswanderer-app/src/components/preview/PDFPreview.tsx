'use client'

import { useState } from 'react'
import Link from 'next/link'

export function PDFPreview() {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 5
  const previewPages = 2

  // Mock data - would come from analysis
  const rankings = [
    { rank: 1, country: 'Portugal', flag: '🇵🇹', percentage: 92, color: 'bg-yellow-400' },
    { rank: 2, country: 'Spanien', flag: '🇪🇸', percentage: 87, color: 'bg-gray-300' },
    { rank: 3, country: 'Zypern', flag: '🇨🇾', percentage: 81, color: 'bg-amber-600' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <span className="text-xl">🎉</span>
          Deine Analyse ist fertig!
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
          Dein persönliches Länder-Ranking
        </h1>
        <p className="text-slate-600 max-w-xl mx-auto">
          Basierend auf deinen persönlichen Kriterien haben wir die besten Länder für dich analysiert.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* PDF Preview */}
        <div className="lg:col-span-2">
          <div className="card p-4 bg-white">
            {/* Page navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded hover:bg-slate-100 disabled:opacity-50"
              >
                ◄ Zurück
              </button>
              <span className="text-sm text-slate-600">
                Seite {currentPage} von {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= previewPages}
                className="p-2 rounded hover:bg-slate-100 disabled:opacity-50"
              >
                Weiter ►
              </button>
            </div>

            {/* PDF Content */}
            <div className="aspect-[210/297] bg-white border border-slate-200 rounded-lg overflow-hidden relative">
              {currentPage <= previewPages ? (
                // Visible pages
                <div className="p-8 h-full overflow-auto">
                  {currentPage === 1 && (
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-primary-500 mb-2">
                        AUSWANDERUNGSANALYSE 2026
                      </h2>
                      <p className="text-slate-500 mb-8">Personalisiert für dich</p>
                      
                      <div className="bg-slate-50 rounded-xl p-6 mb-8">
                        <h3 className="font-bold mb-4">DEIN RANKING</h3>
                        <div className="space-y-4">
                          {rankings.map((r) => (
                            <div key={r.rank} className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
                              <div className={`w-10 h-10 ${r.color} rounded-full flex items-center justify-center font-bold`}>
                                {r.rank}
                              </div>
                              <span className="text-2xl">{r.flag}</span>
                              <span className="font-semibold flex-1">{r.country}</span>
                              <span className="text-green-600 font-bold text-xl">{r.percentage}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {currentPage === 2 && (
                    <div>
                      <h2 className="text-xl font-bold text-primary-500 mb-4 flex items-center gap-2">
                        <span className="text-2xl">🥇</span>
                        TOP-EMPFEHLUNG: Portugal
                      </h2>
                      
                      <p className="text-slate-600 mb-6">
                        Basierend auf deinen Prioritäten ist Portugal die optimale Wahl. 
                        Es bietet die perfekte Kombination aus niedrigen Kosten, exzellentem 
                        Klima und EU-Vorteilen.
                      </p>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <h4 className="font-bold text-green-800 mb-2">✅ Stärken</h4>
                        <ul className="text-sm space-y-1 text-green-700">
                          <li>• Niedrige Lebenshaltungskosten</li>
                          <li>• Über 3.000 Sonnenstunden/Jahr</li>
                          <li>• EU-Freizügigkeit</li>
                          <li>• Große Expat-Community</li>
                        </ul>
                      </div>
                      
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h4 className="font-bold text-amber-800 mb-2">⚠️ Beachte</h4>
                        <ul className="text-sm space-y-1 text-amber-700">
                          <li>• Portugiesisch lernen empfohlen</li>
                          <li>• Immobilienpreise steigen</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Blurred pages
                <div className="h-full flex items-center justify-center bg-slate-100 relative">
                  <div className="absolute inset-0 backdrop-blur-md bg-white/70" />
                  <div className="relative z-10 text-center p-8">
                    <span className="text-5xl mb-4 block">🔒</span>
                    <h3 className="font-bold text-xl mb-2">Inhalt gesperrt</h3>
                    <p className="text-slate-600 text-sm mb-4">
                      Diese Seite ist in der Vorschau nicht sichtbar.
                    </p>
                    <Link href="/checkout" className="btn-primary inline-block">
                      Jetzt freischalten
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Page indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => i < previewPages && setCurrentPage(i + 1)}
                  className={`w-3 h-3 rounded-full ${
                    i + 1 === currentPage
                      ? 'bg-primary-500'
                      : i < previewPages
                        ? 'bg-slate-300'
                        : 'bg-slate-200'
                  } ${i >= previewPages ? 'opacity-50' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - CTA */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h3 className="font-heading text-xl font-bold mb-4">
              Vollständige Analyse
            </h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm">Detailmatrix aller Kriterien</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm">Analyse aller Top 5 Länder</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm">Persönliche Empfehlung</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm">Konkrete nächste Schritte</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm">Visa-Informationen</span>
              </div>
            </div>

            <Link
              href="/checkout?product=pdf"
              className="btn-cta w-full text-center block mb-3"
            >
              PDF kaufen - 39 EUR
            </Link>

            <div className="text-center text-slate-500 text-sm mb-4">oder</div>

            <Link
              href="/checkout?product=pro"
              className="btn-secondary w-full text-center block"
            >
              PRO werden - 14,99€/Monat
            </Link>

            <p className="text-xs text-slate-500 mt-4 text-center">
              Im PRO-Abo: Unbegrenzte Analysen + alle E-Books
            </p>

            <div className="border-t border-slate-200 mt-6 pt-4">
              <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                <span>🔒</span>
                Sichere Zahlung mit Stripe
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

