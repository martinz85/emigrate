interface ProgressBarProps {
  current: number
  total: number
  percentage: number
}

export function ProgressBar({ current, total, percentage }: ProgressBarProps) {
  return (
    <div>
      <div className="flex justify-between text-sm text-slate-600 mb-2">
        <span>Fortschritt</span>
        <span>{current} von {total} Kriterien</span>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  )
}

