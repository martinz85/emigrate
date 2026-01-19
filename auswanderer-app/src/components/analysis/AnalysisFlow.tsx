'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAnalysisStore } from '@/stores'
import { CRITERIA } from '@/lib/criteria'
import { useQuestionTimer, useSessionTimer } from '@/hooks'
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
  const analyticsSessionId = useRef<string | null>(null)
  
  // Question timing for analytics
  const { startQuestion, endQuestion, questionTimes, averageTime, totalTime } = useQuestionTimer()
  const { duration: sessionDuration } = useSessionTimer()
  
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

  // Start analytics session on mount
  useEffect(() => {
    const startAnalyticsSession = async () => {
      try {
        const res = await fetch('/api/analytics/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'start',
            data: {
              landingPage: window.location.pathname,
              url: window.location.href,
              screenWidth: window.innerWidth,
              screenHeight: window.innerHeight,
            },
          }),
        })
        const data = await res.json()
        if (data.analyticsSessionId) {
          analyticsSessionId.current = data.analyticsSessionId
        }
      } catch (err) {
        // Analytics failure should not block the user
        console.warn('[Analytics] Failed to start session:', err)
      }
    }
    startAnalyticsSession()
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

  // Start timing current question when it changes
  useEffect(() => {
    if (currentStep === 'criteria' && currentCriterion) {
      startQuestion(currentCriterion.id)
    }
  }, [currentStep, currentCriterion, startQuestion])

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
      
      // Send analytics update with question times
      if (analyticsSessionId.current) {
        fetch('/api/analytics/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update',
            data: {
              questionsAnswered: Object.keys(ratings).length,
              questionTimes,
              isCompleted: true,
              countriesOfInterest: preAnalysis.countriesOfInterest,
            },
          }),
        }).catch(() => {}) // Fire and forget
      }
      
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
      
      // Update analytics with analysis result
      if (analyticsSessionId.current && data.analysisId) {
        fetch('/api/analytics/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update',
            data: {
              analysisId: data.analysisId,
              topCountry: data.topCountry,
              topCountryPercentage: data.topCountryPercentage,
              aiProvider: data.aiProvider,
              aiModel: data.aiModel,
            },
          }),
        }).catch(() => {}) // Fire and forget
      }
      
      // Navigate to results page
      router.push(`/ergebnis/${data.analysisId}`)
    } catch (err) {
      console.error('Analysis error:', err)
      setError('Die Analyse konnte nicht erstellt werden. Bitte versuche es erneut.')
      setStep('criteria') // Go back to last question
      setIsSubmitting(false)
      setLoading(false)
    }
  }, [router, setLoading, setStep, isSubmitting, questionTimes])

  const handleRate = useCallback(
    (rating: number) => {
      if (isSubmitting) return // Prevent interaction during submit
      
      // End timing for current question
      endQuestion(currentCriterion.id)
      
      setRating(currentCriterion.id, rating)

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Auto-advance after 300ms
      // Get fresh state in timeout to avoid stale closure
      timeoutRef.current = setTimeout(() => {
        const { currentCriterionIndex } = useAnalysisStore.getState()
        const isLast = currentCriterionIndex >= CRITERIA.length - 1
        
        if (isLast) {
          setStep('loading')
          submitAnalysis()
        } else {
          nextCriterion()
        }
      }, 300)
    },
    [currentCriterion, nextCriterion, setRating, setStep, submitAnalysis, isSubmitting, endQuestion]
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
          <LoadingScreen duration={5000} />
        )}
      </div>
    </div>
  )
}
