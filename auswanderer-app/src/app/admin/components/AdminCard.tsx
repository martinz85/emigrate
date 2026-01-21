import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface AdminCardProps {
  title?: string
  value?: string | number
  subtitle?: string
  icon?: string
  trend?: 'up' | 'down' | 'warning' | 'neutral' | {
    value: number
    label: string
  }
  className?: string
  children?: ReactNode
}

export function AdminCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  className,
  children
}: AdminCardProps) {
  // If children are provided, render them directly
  if (children) {
    return (
      <div className={cn(
        'bg-white rounded-xl border border-slate-200 p-6',
        className
      )}>
        {children}
      </div>
    )
  }

  // Otherwise, render the default card layout
  return (
    <div className={cn(
      'bg-white rounded-xl border border-slate-200 p-6',
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">
            {typeof value === 'number' ? value.toLocaleString('de-DE') : value}
          </p>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          )}
          {trend && typeof trend === 'object' && 'value' in trend && (
            <p className={cn(
              'text-sm font-medium mt-2',
              trend.value >= 0 ? 'text-emerald-600' : 'text-red-600'
            )}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
          {trend && typeof trend === 'string' && trend !== 'neutral' && (
            <span className={cn(
              'inline-block mt-2 w-2 h-2 rounded-full',
              trend === 'up' && 'bg-emerald-500',
              trend === 'down' && 'bg-red-500',
              trend === 'warning' && 'bg-amber-500'
            )} />
          )}
        </div>
        {icon && (
          <span className="text-3xl" aria-hidden="true">{icon}</span>
        )}
      </div>
    </div>
  )
}

