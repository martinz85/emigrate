'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CountUpScore } from './CountUpScore'
import { getCountryFlag } from '@/lib/countries'

// Brand colors for confetti animation
const CONFETTI_COLORS = {
  primary: '#0f766e', // Teal-700
  secondary: '#f59e0b', // Amber-500
}

interface CountryRevealProps {
  country: string
  percentage: number
  onRevealComplete?: () => void
}

type RevealPhase = 'suspense' | 'flag' | 'name' | 'score' | 'complete'

export function CountryReveal({ country, percentage, onRevealComplete }: CountryRevealProps) {
  const [phase, setPhase] = useState<RevealPhase>('suspense')
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  const flag = getCountryFlag(country)

  // Handle prefers-reduced-motion with proper SSR support
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const advancePhase = useCallback(() => {
    setPhase((current) => {
      switch (current) {
        case 'suspense': return 'flag'
        case 'flag': return 'name'
        case 'name': return 'score'
        case 'score': return 'complete'
        default: return 'complete'
      }
    })
  }, [])

  useEffect(() => {
    // Skip animation for reduced motion preference
    if (prefersReducedMotion) {
      setPhase('complete')
      return
    }

    // Animation timing sequence
    const timings: Record<RevealPhase, number> = {
      suspense: 1500,  // 0-1.5s: Suspense build
      flag: 1500,      // 1.5-3s: Flag reveal
      name: 1000,      // 3-4s: Name reveal
      score: 2500,     // 4-6.5s: Score count-up
      complete: 0,
    }

    if (phase === 'complete') {
      return // Don't set timeout for complete phase
    }

    const timeout = setTimeout(advancePhase, timings[phase])
    return () => clearTimeout(timeout)
  }, [phase, advancePhase, prefersReducedMotion])

  // Separate effect for calling onRevealComplete to avoid stale closure
  useEffect(() => {
    if (phase === 'complete') {
      onRevealComplete?.()
    }
  }, [phase, onRevealComplete])

  // Reduced motion: show everything immediately
  if (prefersReducedMotion) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl md:text-9xl mb-6">{flag}</div>
        <h2 className="font-heading text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          {country}
        </h2>
        <div className="flex justify-center">
          <CountUpScore targetValue={percentage} duration={0} />
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-[400px] flex flex-col items-center justify-center py-12">
      {/* Suspense Phase - Pulsing circles */}
      <AnimatePresence mode="wait">
        {phase === 'suspense' && (
          <motion.div
            key="suspense"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <motion.div
              className="relative w-40 h-40 mx-auto"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              <div className="absolute inset-0 rounded-full bg-primary-500/20 animate-ping" />
              <div className="absolute inset-4 rounded-full bg-primary-500/30 animate-ping" style={{ animationDelay: '0.2s' }} />
              <div className="absolute inset-8 rounded-full bg-primary-500/40 animate-ping" style={{ animationDelay: '0.4s' }} />
              <div className="absolute inset-0 flex items-center justify-center text-6xl">
                🌍
              </div>
            </motion.div>
            <motion.p
              className="text-slate-500 mt-6 text-lg"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Dein Top-Land wird enthüllt...
            </motion.p>
          </motion.div>
        )}

        {/* Flag Reveal Phase */}
        {phase === 'flag' && (
          <motion.div
            key="flag"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ 
              type: 'spring', 
              stiffness: 200, 
              damping: 15 
            }}
            className="text-center"
          >
            <motion.div
              className="text-8xl md:text-9xl mb-4"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ 
                duration: 0.5, 
                repeat: 2,
                repeatType: 'reverse',
              }}
            >
              {flag}
            </motion.div>
            
            {/* Confetti-like particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                    backgroundColor: i % 2 === 0 ? CONFETTI_COLORS.primary : CONFETTI_COLORS.secondary,
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                  animate={{
                    x: Math.cos(i * 30 * Math.PI / 180) * 150,
                    y: Math.sin(i * 30 * Math.PI / 180) * 150,
                    opacity: [1, 0],
                    scale: [0, 1.5],
                  }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Name Reveal Phase */}
        {phase === 'name' && (
          <motion.div
            key="name"
            className="text-center"
          >
            <motion.div
              className="text-8xl md:text-9xl mb-6"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              {flag}
            </motion.div>
            
            <motion.h2
              className="font-heading text-4xl md:text-5xl font-bold text-slate-900"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              {country}
            </motion.h2>
          </motion.div>
        )}

        {/* Score Phase */}
        {(phase === 'score' || phase === 'complete') && (
          <motion.div
            key="score"
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="text-8xl md:text-9xl mb-6"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              {flag}
            </motion.div>
            
            <motion.h2
              className="font-heading text-4xl md:text-5xl font-bold text-slate-900 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {country}
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <CountUpScore 
                targetValue={percentage} 
                duration={phase === 'complete' ? 0 : 2000}
              />
            </motion.div>

            {/* Glow effect behind score */}
            <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
              <motion.div
                className="w-64 h-64 rounded-full bg-primary-500/10 blur-3xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

