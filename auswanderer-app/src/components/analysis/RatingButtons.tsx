'use client'

import { useState } from 'react'

interface RatingButtonsProps {
  onSelect: (rating: number) => void
  selectedValue?: number
}

const EMOJIS = ['😐', '🙂', '😊', '😃', '🤩']

export function RatingButtons({ onSelect, selectedValue }: RatingButtonsProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)

  const ratings = [
    { value: 1, emoji: EMOJIS[0] },
    { value: 2, emoji: EMOJIS[1] },
    { value: 3, emoji: EMOJIS[2] },
    { value: 4, emoji: EMOJIS[3] },
    { value: 5, emoji: EMOJIS[4] },
  ]

  return (
    <div className="flex justify-center gap-3 sm:gap-4">
      {ratings.map(({ value, emoji }) => {
        const isSelected = selectedValue === value
        const isHovered = hoveredRating === value

        return (
          <button
            key={value}
            onClick={() => onSelect(value)}
            onMouseEnter={() => setHoveredRating(value)}
            onMouseLeave={() => setHoveredRating(null)}
            className={`
              flex flex-col items-center justify-center
              w-14 h-14 sm:w-16 sm:h-16 
              min-w-[48px] min-h-[48px]
              rounded-xl border-2 transition-all duration-200
              ${
                isSelected
                  ? 'border-primary-500 bg-primary-500 text-white scale-110 shadow-lg shadow-primary-500/30'
                  : isHovered
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
              }
            `}
          >
            <span className="text-2xl sm:text-3xl">{emoji}</span>
            <span
              className={`text-xs font-bold mt-0.5 ${
                isSelected ? 'text-white' : 'text-slate-600'
              }`}
            >
              {value}
            </span>
          </button>
        )
      })}
    </div>
  )
}
