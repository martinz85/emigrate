'use client'

import { useState } from 'react'
import { CountryReveal } from './CountryReveal'
import { RevealedCountry } from './RevealedCountry'
import { PdfDownloadButton } from './PdfDownloadButton'

interface RankingItem {
  rank: number
  country: string
  percentage: number
  strengths?: string[]
  considerations?: string[]
}

interface UnlockedResult {
  topCountry: string
  matchPercentage: number
  rankings: RankingItem[]
}

interface ResultUnlockedProps {
  analysisId: string
  result: UnlockedResult
}

export function ResultUnlocked({ analysisId, result }: ResultUnlockedProps) {
  const [revealComplete, setRevealComplete] = useState(false)

  const handleRevealComplete = () => {
    setRevealComplete(true)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Success Badge */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
          <span className="text-xl" aria-hidden="true">🎉</span>
          Analyse freigeschaltet!
        </div>
      </div>

      {/* Main Heading */}
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-center text-slate-900 mb-8">
        Dein Top-Match
      </h1>

      {/* Reveal Animation or Full Result */}
      {!revealComplete ? (
        <CountryReveal
          country={result.topCountry}
          percentage={result.matchPercentage}
          onRevealComplete={handleRevealComplete}
        />
      ) : (
        <>
          <RevealedCountry
            topCountry={result.topCountry}
            percentage={result.matchPercentage}
            rankings={result.rankings}
          />

          {/* PDF Download Section */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-8">
              <h3 className="font-heading text-xl font-bold text-slate-900 mb-4">
                Dein persönlicher Report
              </h3>
              <p className="text-slate-600 mb-6">
                Lade deine vollständige Analyse als PDF herunter – 
                mit allen Details zu deinen Top-Ländern.
              </p>
              <PdfDownloadButton analysisId={analysisId} />
            </div>
          </div>

          {/* Additional Actions */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <span aria-hidden="true">🏠</span>
              Zur Startseite
            </a>
            <a
              href="/analyse"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <span aria-hidden="true">🔄</span>
              Neue Analyse
            </a>
          </div>
        </>
      )}
    </div>
  )
}

