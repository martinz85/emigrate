'use client'

/**
 * PriceDisplay Component
 * 
 * Renders product prices with optional campaign strikethrough.
 * Shows "~~39,99€~~ 19,99€" with optional campaign badge.
 */

interface PriceDisplayProps {
  /** Regular price in cents (e.g., 2999 = 29,99€) */
  regularPrice: number
  /** Current/active price in cents */
  currentPrice: number
  /** Whether a campaign is active */
  campaignActive?: boolean
  /** Campaign name (e.g., "Neujahrs-Sale") */
  campaignName?: string | null
  /** Currency code */
  currency?: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Show savings badge */
  showSavings?: boolean
  /** Additional class names */
  className?: string
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-3xl',
}

const oldPriceSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-xl',
}

/**
 * Format cents to Euro string (e.g., 2999 -> "29,99 €")
 */
function formatPrice(cents: number, currency = 'eur'): string {
  const euros = cents / 100
  return euros.toLocaleString('de-DE', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' €'
}

export function PriceDisplay({ 
  regularPrice, 
  currentPrice, 
  campaignActive = false,
  campaignName,
  currency = 'eur',
  size = 'md',
  showSavings = true,
  className = '',
}: PriceDisplayProps) {
  // Calculate savings
  const savings = regularPrice - currentPrice
  const savingsPercent = Math.round((savings / regularPrice) * 100)
  const hasCampaign = campaignActive && savings > 0

  // No campaign or no savings - show regular price
  if (!hasCampaign) {
    return (
      <span className={`font-semibold text-slate-900 ${sizeClasses[size]} ${className}`}>
        {formatPrice(currentPrice, currency)}
      </span>
    )
  }

  // Campaign active - show strikethrough and new price
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* Campaign Badge */}
      {campaignName && (
        <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide animate-pulse">
          {campaignName}
        </span>
      )}
      
      {/* Savings Badge (if no campaign name but showSavings) */}
      {!campaignName && showSavings && savingsPercent > 0 && (
        <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          -{savingsPercent}%
        </span>
      )}
      
      {/* Old Price (strikethrough) */}
      <span 
        className={`text-slate-400 line-through ${oldPriceSizeClasses[size]}`}
        aria-label={`Vorher ${formatPrice(regularPrice, currency)}`}
      >
        {formatPrice(regularPrice, currency)}
      </span>
      
      {/* New Price */}
      <span 
        className={`font-bold text-emerald-600 ${sizeClasses[size]}`}
        aria-label={`Jetzt ${formatPrice(currentPrice, currency)}`}
      >
        {formatPrice(currentPrice, currency)}
      </span>
    </div>
  )
}

/**
 * Compact price display for smaller spaces
 */
export function PriceDisplayCompact({
  regularPrice,
  currentPrice,
  campaignActive = false,
  currency = 'eur',
}: Omit<PriceDisplayProps, 'size' | 'showSavings' | 'campaignName'>) {
  const hasCampaign = campaignActive && currentPrice < regularPrice

  if (!hasCampaign) {
    return <span className="font-medium">{formatPrice(currentPrice, currency)}</span>
  }

  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-slate-400 line-through text-sm">
        {formatPrice(regularPrice, currency)}
      </span>
      <span className="font-bold text-emerald-600">
        {formatPrice(currentPrice, currency)}
      </span>
    </span>
  )
}

