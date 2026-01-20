'use client'

import { useState } from 'react'

interface RatingButtonsProps {
  onSelect: (rating: number) => void
  selectedValue?: number
}

const EMOJIS = ['😐', '🙂', '😊', '😃', '🤩']
const LABELS = ['egal', 'weniger wichtig', 'mittel', 'wichtig', 'sehr wichtig']

export function RatingButtons({ onSelect, selectedValue }: RatingButtonsProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)

  const ratings = [
    { value: 1, emoji: EMOJIS[0], label: LABELS[0] },
    { value: 2, emoji: EMOJIS[1], label: LABELS[1] },
    { value: 3, emoji: EMOJIS[2], label: LABELS[2] },
    { value: 4, emoji: EMOJIS[3], label: LABELS[3] },
    { value: 5, emoji: EMOJIS[4], label: LABELS[4] },
  ]

  return (
    <div 
      className="flex justify-center gap-3 sm:gap-4"
      role="radiogroup"
      aria-label="Bewertung von 1 bis 5"
    >
      {ratings.map(({ value, emoji, label }) => {
        const isSelected = selectedValue === value
        const isHovered = hoveredRating === value

        return (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(value)
              }
            }}
            onMouseEnter={() => setHoveredRating(value)}
            onMouseLeave={() => setHoveredRating(null)}
            role="radio"
            aria-checked={isSelected}
            aria-label={`Bewertung ${value} von 5: ${label}`}
            data-testid={`analysis-rating-${value}`}
            className={`
              flex flex-col items-center justify-center
              w-14 h-14 sm:w-16 sm:h-16 
              min-w-[48px] min-h-[48px]
              rounded-xl border-2 transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
              ${
                isSelected
                  ? 'border-primary-500 bg-primary-500 text-white scale-110 shadow-lg shadow-primary-500/30'
                  : isHovered
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
              }
            `}
          >
            <span className="text-2xl sm:text-3xl" aria-hidden="true">{emoji}</span>
            <span
              className={`text-xs font-bold mt-0.5 ${
                isSelected ? 'text-white' : 'text-slate-600'
              }`}
              aria-hidden="true"
            >
              {value}
            </span>
          </button>
        )
      })}
    </div>
  )
}
