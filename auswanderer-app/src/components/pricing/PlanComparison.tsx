'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { BillingToggle, BillingPeriod } from './BillingToggle'
import { FeatureList } from './FeatureList'
import { Plan, formatPlanPrice, getYearlySavings, PLAN_FEATURES } from '@/lib/plans'

interface PlanComparisonProps {
  plans: Plan[]
  isPro?: boolean
  onSelectPlan?: (plan: Plan, billing: BillingPeriod) => void
}

export function PlanComparison({ plans, isPro = false, onSelectPlan }: PlanComparisonProps) {
  const [billing, setBilling] = useState<BillingPeriod>('monthly')

  const freePlan = plans.find(p => p.slug === 'free')
  const proPlan = plans.find(p => p.slug === 'pro')

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
              className="block text-center py-3 rounded-lg font-semibold bg-slate-100 text-slate-900 hover:bg-slate-200 transition-all"
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
              <Link
                href="/dashboard/subscription"
                className="block text-center py-3 rounded-lg font-semibold bg-slate-100 text-slate-700 transition-all"
              >
                ✓ Du bist bereits PRO
              </Link>
            ) : onSelectPlan ? (
              <button
                onClick={() => onSelectPlan(proPlan, billing)}
                className="w-full py-3 rounded-lg font-semibold bg-primary-500 text-white hover:bg-primary-600 transition-all"
              >
                PRO werden ⭐
              </button>
            ) : (
              <Link
                href={`/checkout?product=pro&billing=${billing}`}
                className="block text-center py-3 rounded-lg font-semibold bg-primary-500 text-white hover:bg-primary-600 transition-all"
              >
                PRO werden ⭐
              </Link>
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

