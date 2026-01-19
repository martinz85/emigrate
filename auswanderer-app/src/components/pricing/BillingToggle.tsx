'use client'

import { Badge } from '@/components/ui/badge'

export type BillingPeriod = 'monthly' | 'yearly'

interface BillingToggleProps {
  value: BillingPeriod
  onChange: (value: BillingPeriod) => void
  monthsFree?: number
}

export function BillingToggle({ value, onChange, monthsFree = 2 }: BillingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={() => onChange('monthly')}
        className={`px-4 py-2 rounded-lg font-medium transition-all min-h-[44px] ${
          value === 'monthly'
            ? 'bg-primary-500 text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        Monatlich
      </button>
      
      <button
        onClick={() => onChange('yearly')}
        className={`px-4 py-2 rounded-lg font-medium transition-all min-h-[44px] flex items-center gap-2 ${
          value === 'yearly'
            ? 'bg-primary-500 text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        Jährlich
        {monthsFree > 0 && (
          <Badge 
            variant="secondary" 
            className={`text-xs ${
              value === 'yearly' 
                ? 'bg-white/20 text-white' 
                : 'bg-green-100 text-green-700'
            }`}
          >
            {monthsFree} Monate gratis
          </Badge>
        )}
      </button>
    </div>
  )
}

