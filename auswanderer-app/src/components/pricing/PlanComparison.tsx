'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { BillingToggle, BillingPeriod } from './BillingToggle'
import { FeatureList } from './FeatureList'
import { Plan, formatPlanPrice, getYearlySavings } from '@/lib/plans'
import { createClient } from '@/lib/supabase/client'

interface PlanComparisonProps {
  plans: Plan[]
  isPro?: boolean
  onSelectPlan?: (plan: Plan, billing: BillingPeriod) => void
}

export function PlanComparison({ plans, isPro = false, onSelectPlan }: PlanComparisonProps) {
  const [billing, setBilling] = useState<BillingPeriod>('monthly')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const freePlan = plans.find(p => p.slug === 'free')
  const proPlan = plans.find(p => p.slug === 'pro')

  // Story 8.2: Handle subscription checkout
  const handleSubscriptionCheckout = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Check if user is logged in
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Redirect to login with return URL
        const returnTo = encodeURIComponent(`/pricing?checkout=pro&billing=${billing}`)
        router.push(`/login?return_to=${returnTo}`)
        return
      }

      // Call checkout API
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billing }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Checkout konnte nicht gestartet werden')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('Keine Checkout-URL erhalten')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      setIsLoading(false)
    }
  }

  if (!freePlan || !proPlan) {
    return null
  }

  const { monthsFree, savingsPercent } = proPlan.priceMonthly && proPlan.priceYearly
    ? getYearlySavings(proPlan.priceMonthly, proPlan.priceYearly)
    : { monthsFree: 2, savingsPercent: 17 }

  const currentProPrice = billing === 'yearly' 
    ? proPlan.priceYearly 
    : proPlan.priceMonthly

  const monthlyEquivalent = billing === 'yearly' && proPlan.priceYearly
    ? Math.round(proPlan.priceYearly / 12)
    : proPlan.priceMonthly

  return (
    <div className="space-y-8">
      {/* Billing Toggle */}
      <div className="flex justify-center">
        <BillingToggle 
          value={billing} 
          onChange={setBilling}
          monthsFree={monthsFree}
        />
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className="card">
          <div className="text-center mb-6">
            <h3 className="font-heading text-xl font-bold mb-2">{freePlan.name}</h3>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold">0</span>
              <span className="text-slate-500">€</span>
            </div>
            <p className="text-slate-600 text-sm mt-2">{freePlan.description}</p>
          </div>

          <FeatureList features={freePlan.features} />

          <div className="mt-8">
            <Link
              href="/analyse"
              className="block text-center py-3 rounded-lg font-semibold bg-slate-100 text-slate-900 hover:bg-slate-200 transition-all min-h-[48px]"
            >
              Kostenlos starten
            </Link>
          </div>
        </div>

        {/* PRO Plan */}
        <div className="card relative border-2 border-primary-500 shadow-xl shadow-primary-500/20">
          {/* Badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-primary-500 text-white border-0">
              Empfohlen
            </Badge>
          </div>

          <div className="text-center mb-6">
            <h3 className="font-heading text-xl font-bold mb-2">{proPlan.name}</h3>
            
            <div className="flex flex-col items-center gap-1">
              {billing === 'yearly' && proPlan.priceMonthly && (
                <span className="text-sm text-slate-400 line-through">
                  {formatPlanPrice(proPlan.priceMonthly)}/Monat
                </span>
              )}
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold">
                  {monthlyEquivalent ? (monthlyEquivalent / 100).toFixed(2).replace('.', ',') : '14,99'}
                </span>
                <span className="text-slate-500">€/Monat</span>
              </div>
              {billing === 'yearly' && (
                <span className="text-sm text-green-600 font-medium">
                  {formatPlanPrice(currentProPrice || 0)}/Jahr • {savingsPercent}% gespart
                </span>
              )}
            </div>
            
            <p className="text-slate-600 text-sm mt-2">{proPlan.description}</p>
          </div>

          <FeatureList features={proPlan.features} highlightNew />

          <div className="mt-8">
            {isPro ? (
              <div
                className="block text-center py-3 rounded-lg font-semibold bg-green-100 text-green-700 min-h-[48px] flex items-center justify-center gap-2"
              >
                <span>✓</span> Du bist bereits PRO
              </div>
            ) : onSelectPlan ? (
              <button
                onClick={() => onSelectPlan(proPlan, billing)}
                className="w-full py-3 rounded-lg font-semibold bg-primary-500 text-white hover:bg-primary-600 transition-all min-h-[48px]"
              >
                PRO werden ⭐
              </button>
            ) : (
              <button
                onClick={handleSubscriptionCheckout}
                disabled={isLoading}
                className="w-full py-3 rounded-lg font-semibold bg-primary-500 text-white hover:bg-primary-600 transition-all min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Wird geladen...</span>
                  </>
                ) : (
                  <span>PRO werden ⭐</span>
                )}
              </button>
            )}
            {error && (
              <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
            )}
          </div>
        </div>
      </div>

      {/* Money back guarantee */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 text-sm text-slate-600">
          <span className="text-xl">🔒</span>
          14 Tage Geld-zurück-Garantie bei PRO
        </div>
      </div>
    </div>
  )
}

