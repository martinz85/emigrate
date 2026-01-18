'use client'

import { useEffect, useCallback, useState } from 'react'
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
    setLoading(true)
    
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
    } catch (error) {
      console.error('Analysis error:', error)
      // For now, navigate to a mock result
      router.push('/ergebnis/demo')
    }
  }, [router, setLoading])

  const handleRate = useCallback(
    (rating: number) => {
      setRating(currentCriterion.id, rating)

      // Auto-advance after 300ms
      setTimeout(() => {
        if (isLastQuestion) {
          setStep('loading')
          submitAnalysis()
        } else {
          nextCriterion()
        }
      }, 300)
    },
    [currentCriterion, isLastQuestion, nextCriterion, setRating, setStep, submitAnalysis]
  )

  const handleBack = useCallback(() => {
    if (currentCriterionIndex > 0) {
      previousCriterion()
    } else {
      setStep('pre-analysis')
    }
  }, [currentCriterionIndex, previousCriterion, setStep])

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
