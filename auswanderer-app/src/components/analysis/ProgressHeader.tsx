'use client'

import { Progress } from '@/components/ui/progress'
import { CATEGORY_LABELS, CATEGORY_ICONS, type CriterionCategory } from '@/lib/criteria'

interface ProgressHeaderProps {
  current: number
  total: number
  category?: CriterionCategory
  onBack: () => void
}

export function ProgressHeader({ current, total, category, onBack }: ProgressHeaderProps) {
  // Use (current + 1) so that question 1 shows some progress, not 0%
  const percentage = ((current + 1) / total) * 100
  const categoryLabel = category ? CATEGORY_LABELS[category] : ''
  const categoryIcon = category ? CATEGORY_ICONS[category] : ''

  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-3">
        {/* Top Row */}
        <div className="flex items-center justify-between mb-2">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors min-w-[48px] min-h-[48px]"
          >
            <span className="text-xl">←</span>
            <span className="hidden sm:inline">Zurück</span>
          </button>

          {/* Category */}
          {category && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>{categoryIcon}</span>
              <span className="hidden sm:inline">{categoryLabel}</span>
            </div>
          )}

          {/* Counter */}
          <div className="text-sm font-medium text-slate-600">
            {current + 1} / {total}
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={percentage} className="h-2" />
      </div>
    </div>
  )
}

