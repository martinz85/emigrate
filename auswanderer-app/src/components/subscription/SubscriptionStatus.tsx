'use client'

/**
 * Subscription Status Component
 * Story 8.3: Subscription Management
 * 
 * Displays current subscription details with actions.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SubscriptionData {
  status: 'active' | 'canceled' | 'past_due' | 'expired' | null
  tier: 'free' | 'pro'
  billing?: 'monthly' | 'yearly' | null
  periodEnd?: string | null
  price?: string
}

interface SubscriptionStatusProps {
  subscription: SubscriptionData
  onCancelClick: () => void
  onResumeClick: () => void
}

export function SubscriptionStatus({
  subscription,
  onCancelClick,
  onResumeClick,
}: SubscriptionStatusProps) {
  const [isLoadingPortal, setIsLoadingPortal] = useState(false)
  const router = useRouter()

  const handleOpenPortal = async () => {
    setIsLoadingPortal(true)
    try {
      const response = await fetch('/api/subscription/portal', {
        method: 'POST',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Portal konnte nicht geöffnet werden')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Portal error:', error)
      setIsLoadingPortal(false)
    }
  }

  // Format period end date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const periodEndFormatted = formatDate(subscription.periodEnd)

  // Determine status badge
  const getStatusBadge = () => {
    switch (subscription.status) {
      case 'active':
        return { text: 'Aktiv', color: 'bg-green-500/20 text-green-400 border-green-500/30' }
      case 'canceled':
        return { text: 'Gekündigt', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' }
      case 'past_due':
        return { text: 'Zahlung ausstehend', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
      case 'expired':
        return { text: 'Abgelaufen', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
      default:
        return { text: 'Free', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
    }
  }

  const statusBadge = getStatusBadge()
  const isPro = subscription.tier === 'pro'
  const isCanceled = subscription.status === 'canceled'
  const isActive = subscription.status === 'active'

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{isPro ? '👑' : '🆓'}</span>
            <div>
              <h2 className="text-xl font-bold text-white">
                {isPro ? 'Auswanderer PRO' : 'Kostenlos'}
              </h2>
              <p className="text-sm text-gray-400">
                {isPro ? (subscription.billing === 'yearly' ? 'Jährliche Abrechnung' : 'Monatliche Abrechnung') : 'Basis-Funktionen'}
              </p>
            </div>
          </div>
          <span className={cn('px-3 py-1 rounded-full text-sm font-medium border', statusBadge.color)}>
            {statusBadge.text}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="p-6 space-y-4">
        {isPro && (
          <>
            <div className="flex justify-between items-center text-gray-300">
              <span>Preis</span>
              <span className="font-medium text-white">
                {subscription.billing === 'yearly' ? '149,90€/Jahr' : '14,99€/Monat'}
              </span>
            </div>

            {isCanceled && periodEndFormatted && (
              <div className="flex justify-between items-center text-yellow-400">
                <span>Zugang bis</span>
                <span className="font-medium">{periodEndFormatted}</span>
              </div>
            )}

            {isActive && periodEndFormatted && (
              <div className="flex justify-between items-center text-gray-300">
                <span>Nächste Verlängerung</span>
                <span className="font-medium text-white">{periodEndFormatted}</span>
              </div>
            )}

            {subscription.status === 'past_due' && (
              <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/30">
                <p className="text-red-400 text-sm">
                  ⚠️ Deine letzte Zahlung ist fehlgeschlagen. Bitte aktualisiere deine Zahlungsmethode.
                </p>
              </div>
            )}
          </>
        )}

        {!isPro && (
          <div className="text-center py-4">
            <p className="text-gray-400 mb-4">
              Upgrade auf PRO für unbegrenzte Analysen und alle Premium-Features.
            </p>
            <button
              onClick={() => router.push('/pricing')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
            >
              <span>👑</span>
              <span>PRO werden</span>
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      {isPro && (
        <div className="p-6 border-t border-white/10 space-y-3">
          <button
            onClick={handleOpenPortal}
            disabled={isLoadingPortal}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-xl transition-all border border-white/20 disabled:opacity-50"
          >
            {isLoadingPortal ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Öffne Portal...</span>
              </>
            ) : (
              <>
                <span>💳</span>
                <span>Zahlungsmethode verwalten</span>
              </>
            )}
          </button>

          {isCanceled ? (
            <button
              onClick={onResumeClick}
              className="w-full flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 font-medium py-3 px-6 rounded-xl transition-all border border-green-500/30"
            >
              <span>↩️</span>
              <span>Kündigung widerrufen</span>
            </button>
          ) : (
            <button
              onClick={onCancelClick}
              className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 font-medium py-3 px-6 rounded-xl transition-all border border-white/10 hover:border-red-500/30"
            >
              <span>✕</span>
              <span>Abo kündigen</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

