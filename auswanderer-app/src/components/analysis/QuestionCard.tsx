'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { RatingButtons } from './RatingButtons'
import { CATEGORY_LABELS, CATEGORY_ICONS, type Criterion } from '@/lib/criteria'

interface QuestionCardProps {
  criterion: Criterion
  questionNumber: number
  totalQuestions: number
  onRate: (rating: number) => void
  selectedRating?: number
}

export function QuestionCard({
  criterion,
  questionNumber,
  totalQuestions,
  onRate,
  selectedRating,
}: QuestionCardProps) {
  const [showInfo, setShowInfo] = useState(false)

  const categoryLabel = CATEGORY_LABELS[criterion.category]
  const categoryIcon = CATEGORY_ICONS[criterion.category]

  return (
    <div className="text-center py-8 px-4">
      {/* Category Badge */}
      <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
        <span>{categoryIcon}</span>
        <span>{categoryLabel}</span>
        <span className="text-primary-400">•</span>
        <span>Frage {questionNumber}/{totalQuestions}</span>
      </div>

      {/* Question */}
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-4 max-w-2xl mx-auto">
        {criterion.question}
      </h2>

      {/* Info Button */}
      <button
        type="button"
        onClick={() => setShowInfo(true)}
        aria-label={`Mehr Informationen zu: ${criterion.name}`}
        className="text-slate-400 hover:text-primary-500 transition-colors mb-8 inline-flex items-center gap-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md px-2 py-1"
      >
        <span aria-hidden="true">ℹ️</span>
        <span>Mehr erfahren</span>
      </button>

      {/* Rating Buttons */}
      <div className="mb-6">
        <RatingButtons onSelect={onRate} selectedValue={selectedRating} />
      </div>

      {/* Labels */}
      <div className="flex justify-between max-w-xs mx-auto text-xs text-slate-500">
        <span>egal</span>
        <span>sehr wichtig</span>
      </div>

      {/* Info Modal */}
      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>{categoryIcon}</span>
              {criterion.name}
            </DialogTitle>
            <DialogDescription className="pt-4 text-base text-slate-600">
              {criterion.description}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <button
              onClick={() => setShowInfo(false)}
              className="w-full btn-primary"
            >
              Verstanden
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

