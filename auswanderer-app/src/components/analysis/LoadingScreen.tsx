'use client'

import { useState, useEffect, useRef } from 'react'
import { Progress } from '@/components/ui/progress'

const FUN_FACTS = [
  '💡 Wusstest du? Portugal hat über 300 Sonnentage pro Jahr.',
  '🏔️ Die Schweiz hat vier offizielle Landessprachen.',
  '🌴 In Thailand kostet ein Mittagessen oft unter 3 Euro.',
  '🇸🇪 Schweden bietet 480 Tage Elternzeit.',
  '🏖️ Spanien ist das Land mit den meisten Expats in Europa.',
  '🦘 Australien hat mehr Kängurus als Menschen.',
  '🇳🇿 Neuseeland war das erste Land mit Frauenwahlrecht.',
  '🇨🇦 Kanada hat die längste Küstenlinie der Welt.',
  '🏝️ Zypern hat im Durchschnitt 340 Sonnentage im Jahr.',
  '🇳🇱 Die Niederlande haben mehr Fahrräder als Einwohner.',
]

interface LoadingScreenProps {
  onComplete?: () => void
  duration?: number
}

export function LoadingScreen({ onComplete, duration = 5000 }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [currentFact, setCurrentFact] = useState(0)
  
  // Use ref to avoid stale callback reference in useEffect
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2
      })
    }, duration / 50)

    // Fun fact rotation
    const factInterval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % FUN_FACTS.length)
    }, 2500)

    // Complete callback - use ref to get latest callback
    const timeout = setTimeout(() => {
      onCompleteRef.current?.()
    }, duration)

    return () => {
      clearInterval(progressInterval)
      clearInterval(factInterval)
      clearTimeout(timeout)
    }
  }, [duration]) // Only depend on duration, not onComplete

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      {/* Animated Globe */}
      <div className="relative mb-8">
        <span className="text-8xl animate-pulse" aria-hidden="true">🌍</span>
        <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-2xl animate-ping" aria-hidden="true" />
      </div>

      {/* Title */}
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-4 text-center">
        Analysiere deine Antworten...
      </h2>

      {/* Progress Bar */}
      <div className="w-full max-w-md mb-8">
        <Progress value={progress} className="h-3" aria-label="Analysefortschritt" />
        <p className="text-center text-sm text-slate-500 mt-2" aria-live="polite">{Math.round(progress)}%</p>
      </div>

      {/* Fun Fact */}
      <div className="bg-primary-50 rounded-xl p-4 max-w-md text-center">
        <p className="text-primary-800 font-medium transition-opacity duration-500" aria-live="polite">
          {FUN_FACTS[currentFact]}
        </p>
      </div>

      {/* Subtitle */}
      <p className="text-slate-500 text-sm mt-8">
        Unsere AI vergleicht dein Profil mit Daten aus über 50 Ländern
      </p>
    </div>
  )
}
