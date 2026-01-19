'use client'

import { getCountryFlag } from '@/lib/countries'

interface RankingItem {
  rank: number
  country: string
  percentage: number
  strengths?: string[]
  considerations?: string[]
}

interface RevealedCountryProps {
  topCountry: string
  percentage: number
  rankings: RankingItem[]
}

export function RevealedCountry({ topCountry, percentage, rankings }: RevealedCountryProps) {
  const flag = getCountryFlag(topCountry)

  // Get score color based on percentage
  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-green-600'
    if (value >= 60) return 'text-yellow-600'
    return 'text-orange-600'
  }

  const getBadgeColor = (value: number) => {
    if (value >= 80) return 'bg-green-100 text-green-700'
    if (value >= 60) return 'bg-yellow-100 text-yellow-700'
    return 'bg-orange-100 text-orange-700'
  }

  return (
    <div
      className="max-w-3xl mx-auto"
    >
      {/* Top Country Hero */}
      <div 
        className="text-center mb-12"
      >
        <div className="text-7xl md:text-8xl mb-4" aria-hidden="true">
          {flag}
        </div>
        <span className="sr-only">Flagge von {topCountry}</span>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-2">
          {topCountry}
        </h2>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getBadgeColor(percentage)}`}>
          <span className="font-bold text-xl">{percentage}%</span>
          <span className="text-sm font-medium">Match</span>
        </div>
      </div>

      {/* Full Ranking */}
      <div 
        className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
      >
        <h3 className="font-heading text-xl font-bold text-slate-900 mb-6 text-center">
          Dein vollständiges Ranking
        </h3>

        <div className="space-y-4">
          {rankings.map((item, index) => {
            const itemFlag = getCountryFlag(item.country)
            
            return (
              <div
                key={item.rank}
                className={`rounded-xl p-4 ${index === 0 ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200' : 'bg-slate-50'}`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank Badge */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 ${
                    index === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-500' : 
                    index === 1 ? 'bg-slate-400' : 
                    index === 2 ? 'bg-amber-600' : 'bg-slate-300'
                  }`}>
                    {item.rank}
                  </div>

                  {/* Flag */}
                  <div className="text-3xl shrink-0" aria-hidden="true">
                    {itemFlag}
                  </div>

                  {/* Country Name */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {item.country}
                    </p>
                  </div>

                  {/* Percentage */}
                  <div className="text-right shrink-0">
                    <span className={`font-bold text-lg ${getScoreColor(item.percentage)}`}>
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                {/* Strengths & Considerations for top 3 */}
                {index < 3 && (item.strengths?.length || item.considerations?.length) && (
                  <div className="mt-3 pt-3 border-t border-slate-200/50">
                    {item.strengths && item.strengths.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {item.strengths.slice(0, 3).map((strength, i) => (
                          <span 
                            key={i} 
                            className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full"
                          >
                            <span aria-hidden="true">✓</span>
                            {strength}
                          </span>
                        ))}
                      </div>
                    )}
                    {item.considerations && item.considerations.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {item.considerations.slice(0, 2).map((consideration, i) => (
                          <span 
                            key={i} 
                            className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full"
                          >
                            <span aria-hidden="true">⚠️</span>
                            {consideration}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

