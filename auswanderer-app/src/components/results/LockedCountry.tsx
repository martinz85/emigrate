'use client'

import { useState, useEffect } from 'react'

interface LockedCountryProps {
  countryName?: string // Hidden, but used for length
}

export function LockedCountry({ countryName = 'Portugal' }: LockedCountryProps) {
  const [shimmerPosition, setShimmerPosition] = useState(0)

  // Shimmer animation
  useEffect(() => {
    const interval = setInterval(() => {
      setShimmerPosition((prev) => (prev + 1) % 100)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  // Generate locks based on approximate country name length
  const lockCount = Math.max(5, Math.min(countryName.length, 12))
  const locks = Array(lockCount).fill('🔒')

  return (
    <div className="relative">
      {/* Blurred background hint */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span 
          className="text-4xl md:text-5xl font-bold text-slate-200 blur-lg select-none"
          aria-hidden="true"
        >
          {countryName}
        </span>
      </div>

      {/* Lock overlay */}
      <div className="relative z-10 py-8">
        {/* Lock icons */}
        <div 
          className="flex items-center justify-center gap-1 text-3xl md:text-4xl mb-4"
          role="img"
          aria-label="Land ist versteckt"
        >
          {locks.map((lock, i) => (
            <span 
              key={i} 
              className="animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {lock}
            </span>
          ))}
        </div>

        {/* Label */}
        <p className="text-slate-600 font-medium text-center">
          Dein Top-Land ist versteckt
        </p>

        {/* Shimmer effect */}
        <div 
          className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl"
          aria-hidden="true"
        >
          <div 
            className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            style={{ 
              left: `${shimmerPosition}%`,
              transform: 'translateX(-50%)',
            }}
          />
        </div>
      </div>

      {/* Decorative border */}
      <div className="absolute inset-0 border-2 border-dashed border-slate-300 rounded-xl" />
    </div>
  )
}

