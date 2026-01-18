'use client'

import { CountUpScore } from './CountUpScore'
import { LockedCountry } from './LockedCountry'
import { PurchaseCTA } from './PurchaseCTA'

interface AnalysisResult {
  topCountry: string
  matchPercentage: number
  rankings: Array<{
    rank: number
    country: string
    percentage: number
  }>
}

interface ResultTeaserProps {
  analysisId: string
  result: AnalysisResult
}

export function ResultTeaser({ analysisId, result }: ResultTeaserProps) {
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
        <div className="relative">
          <CountUpScore 
            targetValue={result.matchPercentage} 
            duration={2500}
          />
        </div>
      </div>

      {/* Locked Country */}
      <div className="mb-12">
        <LockedCountry countryName={result.topCountry} />
      </div>

      {/* Teaser Info */}
      <div className="bg-slate-50 rounded-xl p-6 mb-12">
        <h2 className="font-heading text-xl font-bold text-slate-900 mb-4 text-center">
          Dein Ranking
        </h2>
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
                {index === 0 ? (
                  <span className="text-slate-400 font-medium">🔒 Versteckt</span>
                ) : (
                  <span className="font-medium text-slate-600">🔒 Versteckt</span>
                )}
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
        <p className="text-center text-slate-500 text-sm mt-4">
          + {Math.max(0, result.rankings.length - 3)} weitere Länder in der vollständigen Analyse
        </p>
      </div>

      {/* Purchase CTA */}
      <PurchaseCTA analysisId={analysisId} />

      {/* What's included */}
      <div className="mt-12 grid md:grid-cols-3 gap-6">
        <div className="text-center p-6">
          <div className="text-4xl mb-3">🌍</div>
          <h3 className="font-bold text-slate-900 mb-2">Land enthüllen</h3>
          <p className="text-sm text-slate-600">
            Erfahre sofort, welches Land am besten zu dir passt
          </p>
        </div>
        <div className="text-center p-6">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="font-bold text-slate-900 mb-2">Detailanalyse</h3>
          <p className="text-sm text-slate-600">
            Alle 28 Kriterien im Detail für jedes Land
          </p>
        </div>
        <div className="text-center p-6">
          <div className="text-4xl mb-3">📄</div>
          <h3 className="font-bold text-slate-900 mb-2">PDF-Report</h3>
          <p className="text-sm text-slate-600">
            Deine persönliche Analyse zum Download
          </p>
        </div>
      </div>
    </div>
  )
}

