'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface CountUpScoreProps {
  targetValue: number
  duration?: number
  suffix?: string
}

export function CountUpScore({ targetValue, duration = 2500, suffix = '%' }: CountUpScoreProps) {
  const [currentValue, setCurrentValue] = useState(0)
  const [isAnimating, setIsAnimating] = useState(true)
  const startTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  // Get color based on score
  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-green-500'
    if (value >= 60) return 'text-yellow-500'
    return 'text-orange-500'
  }

  // Get background gradient based on score
  const getScoreGradient = (value: number) => {
    if (value >= 80) return 'from-green-500/20 to-emerald-500/20'
    if (value >= 60) return 'from-yellow-500/20 to-amber-500/20'
    return 'from-orange-500/20 to-red-500/20'
  }

  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp
    }

    const elapsed = timestamp - startTimeRef.current
    const progress = Math.min(elapsed / duration, 1)

    // Easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4)
    const value = Math.round(easeOutQuart * targetValue)

    setCurrentValue(value)

    if (progress < 1) {
      rafRef.current = requestAnimationFrame(animate)
    } else {
      setIsAnimating(false)
    }
  }, [duration, targetValue])

  useEffect(() => {
    // Start animation
    rafRef.current = requestAnimationFrame(animate)

    // Pause animation when tab is not visible
    const handleVisibilityChange = () => {
      if (document.hidden && rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      } else if (!document.hidden && isAnimating) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [animate, isAnimating])

  return (
    <div className="text-center relative">
      <div 
        className={`inline-flex items-center justify-center w-48 h-48 md:w-56 md:h-56 rounded-full bg-gradient-to-br ${getScoreGradient(currentValue)} border-4 border-white shadow-2xl`}
      >
        <div className="text-center">
          {/* Only announce final value to screen readers */}
          <span 
            className={`text-6xl md:text-7xl font-bold ${getScoreColor(currentValue)} transition-colors duration-500`}
            aria-live={isAnimating ? 'off' : 'polite'}
          >
            {currentValue}
          </span>
          <span className={`text-3xl md:text-4xl font-bold ${getScoreColor(currentValue)}`}>
            {suffix}
          </span>
          <p className="text-slate-500 text-sm mt-1">Match</p>
        </div>
      </div>
      
      {/* Pulse animation while counting - now properly positioned */}
      {isAnimating && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-48 md:w-56 md:h-56 rounded-full animate-ping opacity-20 bg-primary-500" />
        </div>
      )}
    </div>
  )
}
