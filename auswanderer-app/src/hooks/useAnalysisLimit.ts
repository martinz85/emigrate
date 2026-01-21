'use client'

/**
 * useAnalysisLimit Hook
 * Story 8.5: Tägliches Analyse-Limit für PRO-User
 * 
 * Provides analysis limit information for the current user.
 */

import { useState, useEffect, useCallback } from 'react'

interface AnalysisLimitData {
  isPro: boolean
  hasLimit: boolean
  allowed: boolean
  remaining: number
  limit: number
  usedToday: number
  resetAt: string
}

interface UseAnalysisLimitReturn {
  data: AnalysisLimitData | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  timeUntilReset: string | null
}

/**
 * Format time until reset in human-readable format
 */
function formatTimeUntilReset(resetAt: string): string {
  const now = new Date()
  const reset = new Date(resetAt)
  const diffMs = reset.getTime() - now.getTime()
  
  if (diffMs <= 0) return 'Jetzt'
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h ${minutes}min`
  }
  return `${minutes} Minuten`
}

export function useAnalysisLimit(): UseAnalysisLimitReturn {
  const [data, setData] = useState<AnalysisLimitData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeUntilReset, setTimeUntilReset] = useState<string | null>(null)

  const fetchLimit = useCallback(async () => {
    try {
      const response = await fetch('/api/analysis-limit')
      
      if (!response.ok) {
        throw new Error('Failed to fetch limit')
      }

      const limitData = await response.json()
      setData(limitData)
      
      if (limitData.resetAt) {
        setTimeUntilReset(formatTimeUntilReset(limitData.resetAt))
      }
      
      setError(null)
    } catch (err) {
      console.error('Analysis limit fetch error:', err)
      setError('Limit konnte nicht geladen werden')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchLimit()
  }, [fetchLimit])

  // Update time until reset every minute
  useEffect(() => {
    if (!data?.resetAt) return

    const interval = setInterval(() => {
      setTimeUntilReset(formatTimeUntilReset(data.resetAt))
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [data?.resetAt])

  return {
    data,
    isLoading,
    error,
    refetch: fetchLimit,
    timeUntilReset,
  }
}

