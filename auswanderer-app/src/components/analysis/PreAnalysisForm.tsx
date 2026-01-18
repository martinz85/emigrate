'use client'

import { useState } from 'react'
import { PRE_ANALYSIS_QUESTIONS } from '@/lib/criteria'
import { useAnalysisStore } from '@/stores'

interface PreAnalysisFormProps {
  onComplete: () => void
}

export function PreAnalysisForm({ onComplete }: PreAnalysisFormProps) {
  const { preAnalysis, setPreAnalysis } = useAnalysisStore()
  const [selectedCountries, setSelectedCountries] = useState<string[]>(
    preAnalysis.countriesOfInterest
  )
  const [specialWishes, setSpecialWishes] = useState(preAnalysis.specialWishes)

  const countriesQuestion = PRE_ANALYSIS_QUESTIONS[0]
  const wishesQuestion = PRE_ANALYSIS_QUESTIONS[1]

  const toggleCountry = (country: string) => {
    setSelectedCountries((prev) =>
      prev.includes(country)
        ? prev.filter((c) => c !== country)
        : [...prev, country]
    )
  }

  const handleContinue = () => {
    setPreAnalysis({
      countriesOfInterest: selectedCountries,
      specialWishes,
    })
    onComplete()
  }

  const handleSkip = () => {
    // Clear any previously saved pre-analysis data when skipping
    setPreAnalysis({
      countriesOfInterest: [],
      specialWishes: '',
    })
    onComplete()
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Countries Question */}
      <div className="card mb-8">
        <h2 className="font-heading text-xl font-bold mb-2">
          {countriesQuestion.question}
        </h2>
        <p className="text-sm text-slate-500 mb-6">Optional - wähle beliebig viele</p>

        <div className="flex flex-wrap gap-2">
          {countriesQuestion.options?.map((country) => (
            <button
              key={country}
              type="button"
              onClick={() => toggleCountry(country)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                selectedCountries.includes(country)
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {country}
            </button>
          ))}
        </div>
      </div>

      {/* Special Wishes Question */}
      <div className="card mb-8">
        <h2 className="font-heading text-xl font-bold mb-2">
          {wishesQuestion.question}
        </h2>
        <p className="text-sm text-slate-500 mb-4">Optional</p>

        <textarea
          value={specialWishes}
          onChange={(e) => setSpecialWishes(e.target.value)}
          placeholder={wishesQuestion.placeholder}
          className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button type="button" onClick={handleContinue} className="btn-cta">
          Weiter zu den Kriterien
        </button>
        <button
          type="button"
          onClick={handleSkip}
          className="text-slate-500 hover:text-slate-700 font-medium"
        >
          Überspringen →
        </button>
      </div>
    </div>
  )
}

