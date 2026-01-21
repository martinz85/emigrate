'use client'

/**
 * Subscription Manager Client Component
 * Story 8.3: Subscription Management
 * 
 * Handles subscription actions (cancel, resume, portal).
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus'
import { CancelModal } from '@/components/subscription/CancelModal'

interface SubscriptionData {
  tier: 'free' | 'pro'
  status: 'active' | 'canceled' | 'past_due' | 'expired' | null
  periodEnd: string | null
  billing: 'monthly' | 'yearly' | null
  hasStripeCustomer: boolean
  hasActiveSubscription: boolean
}

interface SubscriptionManagerProps {
  initialData: SubscriptionData
}

export function SubscriptionManager({ initialData }: SubscriptionManagerProps) {
  const [data, setData] = useState(initialData)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isResuming, setIsResuming] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const router = useRouter()

  const handleCancel = async () => {
    const response = await fetch('/api/subscription/cancel', {
      method: 'POST',
    })
    
    const result = await response.json()
    
    if (response.ok) {
      setData(prev => ({ ...prev, status: 'canceled' }))
      router.refresh()
      return { success: true, cancelAt: result.cancelAt }
    } else {
      return { success: false, error: result.error }
    }
  }

  const handleResume = async () => {
    setIsResuming(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/subscription/resume', {
        method: 'POST',
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setData(prev => ({ ...prev, status: 'active' }))
        setMessage({ type: 'success', text: 'Dein Abo wurde erfolgreich fortgesetzt!' })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Ein Fehler ist aufgetreten' })
    } finally {
      setIsResuming(false)
    }
  }

  return (
    <>
      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl border ${
          message.type === 'success' 
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Status Card */}
      <SubscriptionStatus
        subscription={{
          status: data.status,
          tier: data.tier,
          billing: data.billing,
          periodEnd: data.periodEnd,
        }}
        onCancelClick={() => setShowCancelModal(true)}
        onResumeClick={handleResume}
      />

      {/* Loading overlay for resume */}
      {isResuming && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="bg-slate-800 rounded-xl p-6 flex items-center gap-4">
            <svg className="animate-spin h-6 w-6 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-white">Wird fortgesetzt...</span>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        periodEnd={data.periodEnd}
      />

      {/* PRO Benefits Reminder (for free users) */}
      {data.tier === 'free' && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">Was du mit PRO bekommst:</h3>
          <div className="grid gap-4">
            <FeatureCard emoji="📊" title="Unbegrenzte Analysen" description="Keine Limits mehr bei der Länder-Analyse" />
            <FeatureCard emoji="📚" title="Alle E-Books inklusive" description="Kostenloser Zugang zu allen Auswanderer-Guides" />
            <FeatureCard emoji="🎯" title="Region & Stadt Empfehlungen" description="Detaillierte Empfehlungen wo du leben solltest" />
            <FeatureCard emoji="🗺️" title="Auswander-Roadmap" description="Personalisierter Schritt-für-Schritt Plan" />
          </div>
        </div>
      )}
    </>
  )
}

function FeatureCard({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4 border border-white/10">
      <span className="text-2xl">{emoji}</span>
      <div>
        <h4 className="font-medium text-white">{title}</h4>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
  )
}

