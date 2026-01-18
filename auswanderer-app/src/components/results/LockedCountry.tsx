'use client'

import Link from 'next/link'

interface LockedCountryProps {
  /** Only the length of the country name - NOT the actual name for security */
  nameLength?: number
  /** Analysis ID for CTA link */
  analysisId?: string
}

export function LockedCountry({ nameLength = 8, analysisId }: LockedCountryProps) {
  // Generate locks based on name length (without revealing the actual name)
  const lockCount = Math.max(5, Math.min(nameLength, 12))
  const locks = Array(lockCount).fill('🔒')

  return (
    <div className="relative">
      {/* Lock overlay */}
      <div className="relative z-10 py-8">
        {/* Lock icons with staggered animation - respects reduced motion */}
        <div 
          className="flex items-center justify-center gap-1 text-3xl md:text-4xl mb-4"
          role="img"
          aria-label="Dein Top-Land ist versteckt"
        >
          {locks.map((lock, i) => (
            <span 
              key={i} 
              className="animate-pulse motion-reduce:animate-none"
              style={{ animationDelay: `${i * 100}ms` }}
              aria-hidden="true"
            >
              {lock}
            </span>
          ))}
        </div>

        {/* Label */}
        <p className="text-slate-600 font-medium text-center mb-3">
          Dein Top-Land ist versteckt
        </p>

        {/* AC Story 3.3: "Jetzt freischalten" Hinweis */}
        {analysisId ? (
          <Link
            href={`/checkout?analysisId=${encodeURIComponent(analysisId)}`}
            className="block text-center text-amber-600 hover:text-amber-700 font-semibold transition-colors focus:outline-none focus:underline"
          >
            🔓 Jetzt freischalten
          </Link>
        ) : (
          <p className="text-center text-amber-600 font-semibold">
            🔓 Jetzt freischalten
          </p>
        )}

        {/* Shimmer effect - CSS animation, respects reduced motion */}
        <div 
          className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl motion-reduce:hidden"
          aria-hidden="true"
        >
          <div className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
      </div>

      {/* Decorative border */}
      <div className="absolute inset-0 border-2 border-dashed border-slate-300 rounded-xl" />
    </div>
  )
}
