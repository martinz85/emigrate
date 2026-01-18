'use client'

interface LockedCountryProps {
  /** Only the length of the country name - NOT the actual name for security */
  nameLength?: number
}

export function LockedCountry({ nameLength = 8 }: LockedCountryProps) {
  // Generate locks based on name length (without revealing the actual name)
  const lockCount = Math.max(5, Math.min(nameLength, 12))
  const locks = Array(lockCount).fill('🔒')

  return (
    <div className="relative">
      {/* Lock overlay */}
      <div className="relative z-10 py-8">
        {/* Lock icons with staggered animation */}
        <div 
          className="flex items-center justify-center gap-1 text-3xl md:text-4xl mb-4"
          role="img"
          aria-label="Dein Top-Land ist versteckt"
        >
          {locks.map((lock, i) => (
            <span 
              key={i} 
              className="animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
              aria-hidden="true"
            >
              {lock}
            </span>
          ))}
        </div>

        {/* Label */}
        <p className="text-slate-600 font-medium text-center">
          Dein Top-Land ist versteckt
        </p>

        {/* Shimmer effect - CSS animation instead of JS state */}
        <div 
          className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl"
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
