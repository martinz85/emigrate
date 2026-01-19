import { cn } from '@/lib/utils'

interface AdminCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: string
  trend?: {
    value: number
    label: string
  }
  className?: string
}

export function AdminCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  className 
}: AdminCardProps) {
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
          {trend && (
            <p className={cn(
              'text-sm font-medium mt-2',
              trend.value >= 0 ? 'text-emerald-600' : 'text-red-600'
            )}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        {icon && (
          <span className="text-3xl" aria-hidden="true">{icon}</span>
        )}
      </div>
    </div>
  )
}

