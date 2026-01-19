'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

/**
 * Hook to track time spent on each question
 *
 * Usage:
 * const { startQuestion, endQuestion, questionTimes, averageTime } = useQuestionTimer()
 *
 * // When showing a new question:
 * startQuestion('q1_lebenshaltungskosten')
 *
 * // When user answers:
 * endQuestion('q1_lebenshaltungskosten')
 */

interface UseQuestionTimerReturn {
  /** Start timing a question */
  startQuestion: (questionId: string) => void
  /** End timing a question and record the duration */
  endQuestion: (questionId: string) => void
  /** Get all recorded question times */
  questionTimes: Record<string, number>
  /** Average time per question in ms */
  averageTime: number
  /** Total time spent on all questions in ms */
  totalTime: number
  /** Current question being timed */
  currentQuestion: string | null
  /** Reset all times */
  reset: () => void
}

export function useQuestionTimer(): UseQuestionTimerReturn {
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({})
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null)
  const startTimeRef = useRef<number | null>(null)

  /**
   * Start timing a question
   */
  const startQuestion = useCallback((questionId: string) => {
    // End previous question if any
    if (currentQuestion && startTimeRef.current) {
      const duration = Date.now() - startTimeRef.current
      setQuestionTimes((prev) => ({
        ...prev,
        [currentQuestion]: duration,
      }))
    }

    // Start new question
    setCurrentQuestion(questionId)
    startTimeRef.current = Date.now()
  }, [currentQuestion])

  /**
   * End timing a question
   */
  const endQuestion = useCallback((questionId: string) => {
    if (!startTimeRef.current || currentQuestion !== questionId) {
      return
    }

    const duration = Date.now() - startTimeRef.current
    setQuestionTimes((prev) => ({
      ...prev,
      [questionId]: duration,
    }))

    setCurrentQuestion(null)
    startTimeRef.current = null
  }, [currentQuestion])

  /**
   * Reset all times
   */
  const reset = useCallback(() => {
    setQuestionTimes({})
    setCurrentQuestion(null)
    startTimeRef.current = null
  }, [])

  /**
   * Calculate average time
   */
  const times = Object.values(questionTimes)
  const averageTime = times.length > 0
    ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
    : 0

  /**
   * Calculate total time
   */
  const totalTime = times.reduce((a, b) => a + b, 0)

  /**
   * End timing on unmount
   */
  useEffect(() => {
    return () => {
      if (currentQuestion && startTimeRef.current) {
        // Timer cleanup - state can't be updated here
        // Analytics are already sent via endQuestion()
      }
    }
  }, [currentQuestion])

  return {
    startQuestion,
    endQuestion,
    questionTimes,
    averageTime,
    totalTime,
    currentQuestion,
    reset,
  }
}

/**
 * Hook to track overall session duration
 */
export function useSessionTimer() {
  const startTimeRef = useRef<number>(Date.now())
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(Date.now() - startTimeRef.current)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const reset = useCallback(() => {
    startTimeRef.current = Date.now()
    setDuration(0)
  }, [])

  return {
    duration,
    startTime: startTimeRef.current,
    reset,
    formattedDuration: formatDuration(duration),
  }
}

/**
 * Format duration in mm:ss
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

