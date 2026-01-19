'use client'

import { useEffect, useState } from 'react'
import { PlanComparison } from '@/components/pricing'
import { Plan, FALLBACK_PLANS } from '@/lib/plans'
import { useIsPro } from '@/hooks/useSubscriptionStatus'

export function PricingPageContent() {
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS)
  const [isLoading, setIsLoading] = useState(true)
  const { isPro, isLoading: isProLoading } = useIsPro()

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch('/api/plans')
        if (res.ok) {
          const data = await res.json()
          setPlans(data)
        }
      } catch (error) {
        console.error('Failed to fetch plans:', error)
        // Keep fallback plans
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlans()
  }, [])

  if (isLoading || isProLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    )
  }

  return <PlanComparison plans={plans} isPro={isPro} />
}

