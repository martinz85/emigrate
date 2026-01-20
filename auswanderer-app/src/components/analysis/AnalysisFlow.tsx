'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAnalysisStore } from '@/stores'
import { CRITERIA } from '@/lib/criteria'
import { useQuestionTimer, useSessionTimer } from '@/hooks'
import { useTestHelpers } from '@/lib/test-helpers'
import { WelcomeScreen } from './WelcomeScreen'
import { PreAnalysisForm } from './PreAnalysisForm'
import { QuestionCard } from './QuestionCard'
import { DynamicQuestionCard } from './DynamicQuestionCard'
import { AdditionalNotesCard } from './AdditionalNotesCard'
import { LoadingScreen } from './LoadingScreen'
import { ProgressHeader } from './ProgressHeader'
import type { AnalysisQuestionWithCategory } from '@/types/questions'

interface AdditionalNotesSettings {
  enabled: boolean
  label: string
  placeholder: string
  required: boolean
}

interface AnalysisSettings {
  additional_notes_field?: AdditionalNotesSettings
}

interface AnalysisFlowProps {
  /** Questions loaded from database (SSR) */
  initialQuestions?: AnalysisQuestionWithCategory[]
  /** Settings loaded from database (SSR) */
  initialSettings?: AnalysisSettings
}

export function AnalysisFlow({ initialQuestions, initialSettings }: AnalysisFlowProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isHydrated, setIsHydrated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [showNotesStep, setShowNotesStep] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const analyticsSessionId = useRef<string | null>(null)
  
  // Initialize test helpers in development
  useTestHelpers()
  
  // Additional notes settings
  const notesSettings = initialSettings?.additional_notes_field || {
    enabled: false,
    label: 'Möchtest du uns noch etwas mitteilen?',
    placeholder: 'z.B. Besondere Anforderungen, Hobbys, Familie...',
    required: false,
  }
  
  // Question timing for analytics
  const { startQuestion, endQuestion, questionTimes, averageTime, totalTime } = useQuestionTimer()
  const { duration: sessionDuration } = useSessionTimer()
  
  const {
    currentStep,
    currentCriterionIndex,
    ratings,
    textNotes,
    setStep,
    setRating,
    nextCriterion,
    previousCriterion,
    setLoading,
    reset,
  } = useAnalysisStore()

  // Reset store if ?reset=1 query param is present
  useEffect(() => {
    if (searchParams.get('reset') === '1') {
      reset()
      // Remove the query param from URL
      router.replace('/analyse')
    }
  }, [searchParams, reset, router])

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

  // Use DB questions if available, fallback to hardcoded CRITERIA
  const useDbQuestions = initialQuestions && initialQuestions.length > 0
  const questions = useDbQuestions ? initialQuestions : null
  const totalQuestions = useDbQuestions ? initialQuestions.length : CRITERIA.length
  
  // Current question (DB or legacy)
  const currentDbQuestion = questions?.[currentCriterionIndex]
  const currentCriterion = !useDbQuestions ? CRITERIA[currentCriterionIndex] : null
  const isLastQuestion = currentCriterionIndex >= totalQuestions - 1

  // Get question ID for tracking
  const currentQuestionId = useDbQuestions 
    ? (currentDbQuestion?.question_key || currentDbQuestion?.id || '')
    : (currentCriterion?.id || '')

  // Start timing current question when it changes
  useEffect(() => {
    if (currentStep === 'criteria' && currentQuestionId) {
      startQuestion(currentQuestionId)
    }
  }, [currentStep, currentQuestionId, startQuestion])

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
          preAnalysis: {
            ...preAnalysis,
            additionalNotes: additionalNotes || undefined,
          },
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

  // Handle answer (works for both DB questions and legacy CRITERIA)
  const handleAnswer = useCallback(
    (value: number | string | boolean | string[], textNote?: string) => {
      if (isSubmitting) return // Prevent interaction during submit
      
      // End timing for current question
      endQuestion(currentQuestionId)
      
      // Store the rating/answer
      // For DB questions, use question_key if available, otherwise id
      const questionKey = useDbQuestions
        ? (currentDbQuestion?.question_key || currentDbQuestion?.id || '')
        : (currentCriterion?.id || '')
      
      // Store the answer with optional text note
      setRating(questionKey, value, textNote)

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Advance immediately (user clicked "Weiter")
      const { currentCriterionIndex } = useAnalysisStore.getState()
      const isLast = currentCriterionIndex >= totalQuestions - 1
      
      if (isLast) {
        // Show additional notes step if enabled
        if (notesSettings.enabled) {
          setShowNotesStep(true)
        } else {
          setStep('loading')
          submitAnalysis()
        }
      } else {
        nextCriterion()
      }
    },
    [currentQuestionId, currentDbQuestion, currentCriterion, useDbQuestions, totalQuestions, nextCriterion, setRating, setStep, submitAnalysis, isSubmitting, endQuestion, notesSettings.enabled]
  )

  // Legacy handler for old QuestionCard
  const handleRate = useCallback(
    (rating: number) => handleAnswer(rating),
    [handleAnswer]
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

  // Handle additional notes submission
  const handleNotesSubmit = useCallback((notes: string) => {
    setAdditionalNotes(notes)
    setShowNotesStep(false)
    setStep('loading')
    // Small delay to ensure state is updated before submit
    setTimeout(() => submitAnalysis(), 50)
  }, [setStep, submitAnalysis])

  const handleNotesSkip = useCallback(() => {
    setAdditionalNotes('')
    setShowNotesStep(false)
    setStep('loading')
    setTimeout(() => submitAnalysis(), 50)
  }, [setStep, submitAnalysis])

  // Go back from notes to last question
  const handleNotesBack = useCallback(() => {
    setShowNotesStep(false)
    // Stay on criteria step, user can navigate from there
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
          total={totalQuestions}
          category={(useDbQuestions ? currentDbQuestion?.category?.name_key : currentCriterion?.category) ?? undefined}
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

        {currentStep === 'criteria' && !showNotesStep && (
          useDbQuestions && currentDbQuestion ? (
            // Dynamic questions from database
            <DynamicQuestionCard
              question={currentDbQuestion}
              questionNumber={currentCriterionIndex + 1}
              totalQuestions={totalQuestions}
              onAnswer={handleAnswer}
              onBack={handleBack}
              currentValue={ratings[currentDbQuestion.question_key || currentDbQuestion.id]}
              currentTextNote={textNotes[currentDbQuestion.question_key || currentDbQuestion.id]}
            />
          ) : currentCriterion ? (
            // Legacy hardcoded questions (fallback)
            <QuestionCard
              criterion={currentCriterion}
              questionNumber={currentCriterionIndex + 1}
              totalQuestions={totalQuestions}
              onRate={handleRate}
              selectedRating={typeof ratings[currentCriterion.id] === 'number' ? ratings[currentCriterion.id] as number : undefined}
            />
          ) : null
        )}

        {/* Additional Notes Step */}
        {showNotesStep && notesSettings.enabled && (
          <AdditionalNotesCard
            settings={notesSettings}
            onSubmit={handleNotesSubmit}
            onSkip={handleNotesSkip}
            onBack={handleNotesBack}
          />
        )}

        {currentStep === 'loading' && (
          <LoadingScreen duration={5000} />
        )}
      </div>
    </div>
  )
}
