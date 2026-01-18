'use client'

import { CountUpScore } from './CountUpScore'
import { LockedCountry } from './LockedCountry'
import { PurchaseCTA } from './PurchaseCTA'

/**
 * Secure result interface - does NOT include country names for unpaid users
 */
interface TeaserResult {
  matchPercentage: number
  topCountryNameLength: number // Only length, not actual name
  rankings: Array<{
    rank: number
    percentage: number
    // Note: country name NOT included for security
  }>
}

interface ResultTeaserProps {
  analysisId: string
  result: TeaserResult
}

export function ResultTeaser({ analysisId, result }: ResultTeaserProps) {
  const hasRankings = result.rankings && result.rankings.length > 0
  const additionalCountries = Math.max(0, result.rankings.length - 3)

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Success Badge */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
          <span className="text-xl">🎉</span>
          Deine Analyse ist fertig!
        </div>
      </div>

      {/* Main Heading */}
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">
        Dein Top-Match
      </h1>

      {/* Score Display */}
      <div className="flex justify-center mb-12">
        <CountUpScore 
          targetValue={result.matchPercentage} 
          duration={2500}
        />
      </div>

      {/* Locked Country - only receives name length, not actual name */}
      <div className="mb-12">
        <LockedCountry 
          nameLength={result.topCountryNameLength} 
          analysisId={analysisId}
        />
      </div>

      {/* Teaser Info */}
      <div className="bg-slate-50 rounded-xl p-6 mb-12">
        <h2 className="font-heading text-xl font-bold text-slate-900 mb-4 text-center">
          Dein Ranking
        </h2>
        
        {hasRankings ? (
          <>
            <div className="space-y-3">
              {result.rankings.slice(0, 3).map((ranking, index) => (
                <div 
                  key={ranking.rank}
                  className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-slate-400' : 'bg-amber-600'
                  }`}>
                    {ranking.rank}
                  </div>
                  <div className="flex-1">
                    <span className="text-slate-400 font-medium" aria-label="Land versteckt">
                      🔒 Versteckt
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold ${
                      ranking.percentage >= 80 ? 'text-green-600' : 
                      ranking.percentage >= 60 ? 'text-yellow-600' : 'text-orange-600'
                    }`}>
                      {ranking.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {additionalCountries > 0 && (
              <p className="text-center text-slate-500 text-sm mt-4">
                + {additionalCountries} weitere Länder in der vollständigen Analyse
              </p>
            )}
          </>
        ) : (
          <p className="text-center text-slate-500">
            Keine Ergebnisse verfügbar. Bitte versuche es erneut.
          </p>
        )}
      </div>

      {/* Purchase CTA */}
      <PurchaseCTA analysisId={analysisId} />

      {/* What's included */}
      <div className="mt-12 grid md:grid-cols-3 gap-6">
        <div className="text-center p-6">
          <div className="text-4xl mb-3" aria-hidden="true">🌍</div>
          <h3 className="font-bold text-slate-900 mb-2">Land enthüllen</h3>
          <p className="text-sm text-slate-600">
            Erfahre sofort, welches Land am besten zu dir passt
          </p>
        </div>
        <div className="text-center p-6">
          <div className="text-4xl mb-3" aria-hidden="true">📊</div>
          <h3 className="font-bold text-slate-900 mb-2">Detailanalyse</h3>
          <p className="text-sm text-slate-600">
            Alle 28 Kriterien im Detail für jedes Land
          </p>
        </div>
        <div className="text-center p-6">
          <div className="text-4xl mb-3" aria-hidden="true">📄</div>
          <h3 className="font-bold text-slate-900 mb-2">PDF-Report</h3>
          <p className="text-sm text-slate-600">
            Deine persönliche Analyse zum Download
          </p>
        </div>
      </div>
    </div>
  )
}
