'use client'

import { useState } from 'react'

interface RatingButtonsProps {
  onSelect: (rating: number) => void
}

export function RatingButtons({ onSelect }: RatingButtonsProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)

  const ratings = [
    { value: 1, label: 'egal' },
    { value: 2, label: '' },
    { value: 3, label: '' },
    { value: 4, label: '' },
    { value: 5, label: 'sehr wichtig' },
  ]

  return (
    <div className="flex justify-center gap-3">
      {ratings.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onSelect(value)}
          onMouseEnter={() => setHoveredRating(value)}
          onMouseLeave={() => setHoveredRating(null)}
          className={`
            rating-btn
            ${hoveredRating === value ? 'border-primary-500 bg-primary-50' : ''}
          `}
        >
          <span className="text-lg font-bold">{value}</span>
          {label && (
            <span className="text-[10px] text-slate-500">{label}</span>
          )}
        </button>
      ))}
    </div>
  )
}

