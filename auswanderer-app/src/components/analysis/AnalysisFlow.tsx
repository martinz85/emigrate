'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAnalysisStore } from '@/stores'
import { CRITERIA } from '@/lib/criteria'
import { WelcomeScreen } from './WelcomeScreen'
import { PreAnalysisForm } from './PreAnalysisForm'
import { QuestionCard } from './QuestionCard'
import { LoadingScreen } from './LoadingScreen'
import { ProgressHeader } from './ProgressHeader'

export function AnalysisFlow() {
  const router = useRouter()
  const [isHydrated, setIsHydrated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const {
    currentStep,
    currentCriterionIndex,
    ratings,
    setStep,
    setRating,
    nextCriterion,
    previousCriterion,
    setLoading,
  } = useAnalysisStore()

  // Hydration check for Zustand persist
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const currentCriterion = CRITERIA[currentCriterionIndex]
  const totalCriteria = CRITERIA.length
  const isLastQuestion = currentCriterionIndex >= totalCriteria - 1

  const handleStartAnalysis = useCallback(() => {
    setStep('pre-analysis')
  }, [setStep])

  const handlePreAnalysisComplete = useCallback(() => {
    setStep('criteria')
  }, [setStep])

  const submitAnalysis = useCallback(async () => {
    if (isSubmitting) return // Prevent double submit
    
    setIsSubmitting(true)
    setLoading(true)
    setError(null)
    
    try {
      const { preAnalysis, ratings } = useAnalysisStore.getState()
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preAnalysis,
          ratings,
        }),
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const data = await response.json()
      
      // Navigate to results page
      router.push(`/ergebnis/${data.analysisId}`)
    } catch (err) {
      console.error('Analysis error:', err)
      setError('Die Analyse konnte nicht erstellt werden. Bitte versuche es erneut.')
      setStep('criteria') // Go back to last question
      setIsSubmitting(false)
      setLoading(false)
    }
  }, [router, setLoading, setStep, isSubmitting])

  const handleRate = useCallback(
    (rating: number) => {
      if (isSubmitting) return // Prevent interaction during submit
      
      setRating(currentCriterion.id, rating)

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Auto-advance after 300ms
      timeoutRef.current = setTimeout(() => {
        if (isLastQuestion) {
          setStep('loading')
          submitAnalysis()
        } else {
          nextCriterion()
        }
      }, 300)
    },
    [currentCriterion, isLastQuestion, nextCriterion, setRating, setStep, submitAnalysis, isSubmitting]
  )

  const handleBack = useCallback(() => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    if (currentCriterionIndex > 0) {
      previousCriterion()
    } else {
      setStep('pre-analysis')
    }
  }, [currentCriterionIndex, previousCriterion, setStep])

  const handleRetry = useCallback(() => {
    setError(null)
    setStep('loading')
    submitAnalysis()
  }, [setStep, submitAnalysis])

  const handleLoadingComplete = useCallback(() => {
    // Loading complete - navigation happens in submitAnalysis
  }, [])

  // Show loading state until hydration
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-4xl animate-pulse">🌍</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4">
          <span>{error}</span>
          <button
            onClick={handleRetry}
            className="bg-white text-red-500 px-3 py-1 rounded font-medium hover:bg-red-50"
          >
            Erneut versuchen
          </button>
          <button
            onClick={() => setError(null)}
            className="text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Progress Header (only during criteria) */}
      {currentStep === 'criteria' && (
        <ProgressHeader
          current={currentCriterionIndex}
          total={totalCriteria}
          category={currentCriterion?.category}
          onBack={handleBack}
        />
      )}

      {/* Content */}
      <div className="pt-4">
        {currentStep === 'welcome' && (
          <WelcomeScreen onStart={handleStartAnalysis} />
        )}

        {currentStep === 'pre-analysis' && (
          <PreAnalysisForm onComplete={handlePreAnalysisComplete} />
        )}

        {currentStep === 'criteria' && currentCriterion && (
          <QuestionCard
            criterion={currentCriterion}
            questionNumber={currentCriterionIndex + 1}
            totalQuestions={totalCriteria}
            onRate={handleRate}
            selectedRating={ratings[currentCriterion.id]}
          />
        )}

        {currentStep === 'loading' && (
          <LoadingScreen onComplete={handleLoadingComplete} duration={5000} />
        )}
      </div>
    </div>
  )
}
