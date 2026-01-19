'use client'

import { Check, Minus } from 'lucide-react'

interface FeatureListProps {
  features: string[]
  allIncluded?: boolean
  highlightNew?: boolean
}

export function FeatureList({ features, allIncluded = true, highlightNew = false }: FeatureListProps) {
  return (
    <ul className="space-y-3">
      {features.map((feature, index) => (
        <li key={feature} className="flex items-start gap-2 text-sm">
          {allIncluded ? (
            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
          ) : (
            <Minus className="w-4 h-4 text-slate-300 mt-0.5 flex-shrink-0" />
          )}
          <span className={allIncluded ? 'text-slate-700' : 'text-slate-400'}>
            {feature}
          </span>
          {highlightNew && index >= 4 && (
            <span className="text-xs bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded">
              NEU
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}

interface FeatureComparisonListProps {
  features: Array<{
    name: string
    includedInFree: boolean
    includedInPro: boolean
  }>
  plan: 'free' | 'pro'
}

export function FeatureComparisonList({ features, plan }: FeatureComparisonListProps) {
  return (
    <ul className="space-y-3">
      {features.map((feature) => {
        const included = plan === 'free' ? feature.includedInFree : feature.includedInPro

        return (
          <li key={feature.name} className="flex items-start gap-2 text-sm">
            {included ? (
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            ) : (
              <Minus className="w-4 h-4 text-slate-300 mt-0.5 flex-shrink-0" />
            )}
            <span className={included ? 'text-slate-700' : 'text-slate-400 line-through'}>
              {feature.name}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

